from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import os
import logging
import re
import asyncio
import secrets
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

from blog_seed import BLOG_SEED


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Emergent-managed email integration
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Hetal Finserv")
LEAD_NOTIFY_TO = os.environ.get("LEAD_NOTIFY_TO", "info@hetalfinserv.com")

logger = logging.getLogger(__name__)

app = FastAPI(title="Hetal Finserv API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
PHONE_RE = re.compile(r"^[+\d][\d\s\-]{7,17}$")


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=2, max_length=80)
    phone: str = Field(..., min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    service: Optional[str] = Field(None, max_length=80)
    message: Optional[str] = Field(None, max_length=1000)
    source: Optional[str] = Field("website", max_length=40)

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        if not PHONE_RE.match(v.strip()):
            raise ValueError("Invalid phone number")
        return v.strip()


class Lead(LeadCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    subject: Optional[str] = Field(None, max_length=120)
    message: str = Field(..., min_length=5, max_length=2000)


class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CallbackCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=2, max_length=80)
    phone: str = Field(..., min_length=8, max_length=20)
    preferred_time: Optional[str] = Field(None, max_length=80)

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        if not PHONE_RE.match(v.strip()):
            raise ValueError("Invalid phone number")
        return v.strip()


class Callback(CallbackCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"service": "Hetal Finserv API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "ts": datetime.now(timezone.utc).isoformat()}


def _serialize(doc: dict) -> dict:
    d = dict(doc)
    if isinstance(d.get("created_at"), datetime):
        d["created_at"] = d["created_at"].isoformat()
    return d


def _lead_email_html(lead: "Lead") -> str:
    rows = [
        ("Name", lead.name),
        ("Phone", lead.phone),
        ("Email", lead.email or "—"),
        ("Service", lead.service or "—"),
        ("Source", lead.source or "website"),
        ("Received", lead.created_at.strftime("%d %b %Y · %H:%M IST")),
    ]
    detail_rows = "".join(
        f'<tr><td style="padding:8px 14px;color:#666;font-size:13px;font-family:Arial,sans-serif;width:120px;">{k}</td>'
        f'<td style="padding:8px 14px;color:#0E0F0C;font-size:14px;font-family:Arial,sans-serif;font-weight:600;">{v}</td></tr>'
        for k, v in rows
    )
    msg_block = (
        f'<tr><td colspan="2" style="padding:14px;background:#FDF9EE;border-left:3px solid #C9A227;'
        f'font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#0E0F0C;white-space:pre-wrap;">'
        f"{lead.message}</td></tr>"
        if lead.message
        else ""
    )
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 0;">
      <tr><td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #eee;">
          <tr><td style="background:#0E0F0C;padding:24px 28px;">
            <div style="font-family:'Times New Roman',serif;color:#FDF9EE;font-size:22px;">Hetal Finserv</div>
            <div style="font-family:'Courier New',monospace;color:#C9A227;font-size:10px;margin-top:4px;letter-spacing:0.16em;">— NEW LEAD FROM THE WEBSITE</div>
          </td></tr>
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 18px 0;font-family:Arial,sans-serif;font-size:15px;color:#0E0F0C;line-height:1.6;">
              A new enquiry has arrived from hetalfinserv.com. Details below — please respond within one working day.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;">
              {detail_rows}
            </table>
            {("<div style='height:14px;'></div><table width='100%' cellpadding='0' cellspacing='0'>" + msg_block + "</table>") if msg_block else ""}
          </td></tr>
          <tr><td style="padding:18px 28px;background:#FDF9EE;border-top:1px solid #eee;">
            <div style="font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:0.14em;">
              LEAD ID · {lead.id}
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def _notify_lead(lead: "Lead") -> None:
    """Fire-and-forget email to the admin inbox. Never blocks or breaks the API."""
    if not EMAIL_KEY:
        logger.info("EMERGENT_EMAIL_KEY not set — skipping lead email")
        return
    payload = {
        "to": [LEAD_NOTIFY_TO],
        "subject": f"New lead · {lead.name} · {lead.service or 'general'}",
        "html": _lead_email_html(lead),
        "from_name": EMAIL_FROM_NAME,
    }
    if lead.email:
        payload["contact_email"] = lead.email
    try:
        async with httpx.AsyncClient(timeout=15) as hc:
            resp = await hc.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
            resp.raise_for_status()
            logger.info(f"Lead email sent for {lead.id}: {resp.json().get('id')}")
    except httpx.HTTPStatusError as e:
        logger.error(f"Lead email failed {e.response.status_code}: {e.response.text}")
    except Exception as e:
        logger.error(f"Lead email error: {e}")


@api_router.post("/leads", response_model=Lead, status_code=status.HTTP_201_CREATED)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(_serialize(lead.model_dump()))
    # Fire-and-forget notification — never fails the request
    asyncio.create_task(_notify_lead(lead))
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 100):
    rows = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    return rows


@api_router.post("/contacts", response_model=Contact, status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate):
    contact = Contact(**payload.model_dump())
    await db.contacts.insert_one(_serialize(contact.model_dump()))
    return contact


@api_router.get("/contacts", response_model=List[Contact])
async def list_contacts(limit: int = 100):
    rows = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    return rows


@api_router.post("/callbacks", response_model=Callback, status_code=status.HTTP_201_CREATED)
async def create_callback(payload: CallbackCreate):
    cb = Callback(**payload.model_dump())
    await db.callbacks.insert_one(_serialize(cb.model_dump()))
    return cb


# ---------- Admin ----------
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ADMIN_SESSION_HOURS = int(os.environ.get("ADMIN_SESSION_HOURS", "8"))


class AdminLoginRequest(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    if not ADMIN_PASSWORD or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=ADMIN_SESSION_HOURS)
    await db.admin_sessions.insert_one({
        "token": token,
        "created_at": now,
        "expires_at": expires,
    })
    # Prune expired sessions opportunistically (best-effort; TTL index does the rest)
    await db.admin_sessions.delete_many({"expires_at": {"$lt": now}})
    return {"token": token, "expires_in_hours": ADMIN_SESSION_HOURS}


async def require_admin(
    x_admin_token: Optional[str] = Header(default=None, alias="X-Admin-Token"),
) -> dict:
    """FastAPI dependency — resolves X-Admin-Token to a live session or raises 401."""
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    session = await db.admin_sessions.find_one({"token": x_admin_token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    expires_at = session["expires_at"]
    # Backward-compat: legacy ISO-string rows from before this change
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.admin_sessions.delete_one({"token": x_admin_token})
        raise HTTPException(status_code=401, detail="Session expired")
    return session


@api_router.post("/admin/logout")
async def admin_logout(session: dict = Depends(require_admin)):
    await db.admin_sessions.delete_one({"token": session["token"]})
    return {"ok": True}


@api_router.get("/admin/leads")
async def admin_list_leads(
    _: dict = Depends(require_admin),
    limit: int = 500,
):
    rows = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return rows


@api_router.patch("/admin/leads/{lead_id}")
async def admin_update_lead(
    lead_id: str,
    payload: dict,
    _: dict = Depends(require_admin),
):
    allowed = {k: v for k, v in payload.items() if k in {"contacted", "notes"}}
    if not allowed:
        raise HTTPException(status_code=400, detail="No valid fields")
    await db.leads.update_one({"id": lead_id}, {"$set": allowed})
    return {"ok": True}


# Legacy compatibility for older admin_guard() imports — kept short so tests using
# the old raw-password flow still resolve if any reference remained.
def admin_guard(x_admin_token: Optional[str] = None):
    if not ADMIN_PASSWORD or x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ---------- AI Chatbot ----------
HETAL_SYSTEM_PROMPT = """You are the friendly, knowledgeable assistant on hetalfinserv.com — Hetal Finserv Pvt Ltd, a boutique financial services practice in Pune founded by Sandeep Dubal (Founder & Director, 20+ years).

Your job: answer visitor questions warmly and concisely, then convert genuine interest into a lead.

WHO WE ARE
- Registrations: AMFI (ARN-254254), MahaRERA (A52100043460), IRDAI Insurance Broker (00115138383), PMS (APRN00234), NISM certified. Regular Plans only, full commission disclosure.
- Services: Mutual Funds (SIP/Lumpsum/PMS), Insurance (life, health, general), Loans (home, business, personal), Real Estate consulting, Financial Planning.
- Pune-based, serving families across India. info@hetalfinserv.com  ·  +91 87670 95307
- Founders: Sandeep Dubal & Tanuja Dubal — personally involved with every client.

STYLE
- Warm, plain English. Never robotic. Never use "As an AI".
- Keep replies to 3-5 sentences unless the user asks for depth.
- Never give specific fund names, stock tips, or return guarantees. Always frame as "your advisor can review this".
- If user asks about a competitor or unrelated topic, gently pivot back.

CONVERSION
- If the visitor shows buying/planning intent (asks about starting SIP, insurance, loans, retirement, education) OR after 3 substantive turns, invite them to leave name + phone: "Would you like Sandeep to call you back? Please share your name and a phone number." Do this ONCE per conversation, not repeatedly.
- If they share contact details, thank them warmly and confirm we'll reach out within one working day. Do NOT ask again.
- Point people to our calculator suite (/calculators) or blog (/blog) when relevant.

Never make up regulatory numbers, phone numbers, or emails beyond what's listed above."""


class ChatMessage(BaseModel):
    session_id: str = Field(..., min_length=6, max_length=64)
    text: str = Field(..., min_length=1, max_length=2000)


@api_router.post("/chat")
async def chat_endpoint(msg: ChatMessage):
    """Non-streaming chat — simpler client, quicker to ship. Returns full response."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except ImportError:
        raise HTTPException(status_code=500, detail="emergentintegrations not installed")

    # Load recent history for this session (last 20 messages)
    history = await db.chat_history.find(
        {"session_id": msg.session_id}, {"_id": 0}
    ).sort("ts", 1).to_list(20)

    chat = LlmChat(
        api_key=api_key,
        session_id=msg.session_id,
        system_message=HETAL_SYSTEM_PROMPT,
    ).with_model("gemini", "gemini-3-flash-preview")

    # Replay history so the model has context
    for h in history:
        if h.get("role") == "user":
            try:
                await chat.send_message(UserMessage(text=h["text"]))
            except Exception:
                pass  # best-effort replay

    try:
        reply = await chat.send_message(UserMessage(text=msg.text))
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(status_code=502, detail="Assistant is temporarily unavailable")

    now = datetime.now(timezone.utc).isoformat()
    await db.chat_history.insert_many([
        {"session_id": msg.session_id, "role": "user", "text": msg.text, "ts": now},
        {"session_id": msg.session_id, "role": "assistant", "text": reply, "ts": now},
    ])
    return {"reply": reply}


@api_router.get("/chat/{session_id}")
async def chat_history(session_id: str):
    rows = await db.chat_history.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("ts", 1).to_list(100)
    return {"messages": rows}


# ---------- Blog digest ----------
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://hetalfinserv.com").rstrip("/")
CATEGORY_LABELS = {
    "investing": "Investing",
    "insurance": "Insurance",
    "planning": "Planning",
    "behaviour": "Behaviour",
}


def _digest_email_html(post: dict) -> str:
    url = f"{PUBLIC_SITE_URL}/blog/{post['slug']}"
    cat = CATEGORY_LABELS.get(post.get("category", ""), (post.get("category") or "").title())
    read = post.get("readMinutes") or 5
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 0;">
      <tr><td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #eee;">
          <tr><td style="background:#0E0F0C;padding:24px 28px;">
            <div style="font-family:'Times New Roman',serif;color:#FDF9EE;font-size:22px;">Hetal Finserv</div>
            <div style="font-family:'Courier New',monospace;color:#C9A227;font-size:10px;margin-top:4px;letter-spacing:0.16em;">— A NEW READ FROM OUR DESK</div>
          </td></tr>
          <tr><td style="padding:28px;">
            <div style="font-family:'Courier New',monospace;color:#C9A227;font-size:10px;letter-spacing:0.16em;">— {cat.upper()} · {read} MIN READ</div>
            <h1 style="font-family:'Times New Roman',serif;color:#0E0F0C;font-size:24px;line-height:1.25;margin:14px 0 12px 0;font-weight:normal;">
              {post['title']}
            </h1>
            <p style="font-family:Arial,sans-serif;color:#3a3a34;font-size:14px;line-height:1.7;margin:0 0 22px 0;">
              {post['excerpt']}
            </p>
            <a href="{url}" style="display:inline-block;background:#F27A54;color:#fff;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.06em;text-decoration:none;padding:14px 26px;font-weight:600;">
              READ THE FULL ARTICLE
            </a>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#FDF9EE;border-top:1px solid #eee;">
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#666;line-height:1.6;margin:0;">
              You're receiving this because you've been in touch with Hetal Finserv Pvt Ltd.
              Reply to this email or call <a href="tel:+918767095307" style="color:#0E0F0C;">+91 87670 95307</a>
              if you'd like to opt out.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def _send_digest_email(to_email: str, post: dict) -> bool:
    if not EMAIL_KEY:
        return False
    payload = {
        "to": [to_email],
        "subject": f"New from Hetal Finserv · {post['title']}",
        "html": _digest_email_html(post),
        "from_name": EMAIL_FROM_NAME,
    }
    try:
        async with httpx.AsyncClient(timeout=20) as hc:
            resp = await hc.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.error(f"Digest email to {to_email} failed: {e}")
        return False


async def send_blog_digest(slug: Optional[str] = None, force: bool = False) -> dict:
    """Send the digest for a given slug (or the latest post if slug is None).
    Skips if already sent unless force=True."""
    if slug:
        post = await db.blog_posts.find_one({"slug": slug, "published": {"$ne": False}}, {"_id": 0})
    else:
        post = await db.blog_posts.find_one(
            {"published": {"$ne": False}}, {"_id": 0}, sort=[("date", -1)]
        )
    if not post:
        return {"ok": False, "error": "post_not_found", "slug": slug}

    already = await db.blog_digests_sent.find_one({"slug": post["slug"]})
    if already and not force:
        return {
            "ok": True,
            "skipped": True,
            "reason": "already_sent",
            "slug": post["slug"],
            "sent_at": already.get("sent_at"),
        }

    # Collect unique lead emails
    cursor = db.leads.find(
        {"email": {"$exists": True, "$ne": None, "$nin": ["", None]}},
        {"_id": 0, "email": 1},
    )
    seen = set()
    recipients: List[str] = []
    async for row in cursor:
        e = (row.get("email") or "").strip().lower()
        if e and e not in seen:
            seen.add(e)
            recipients.append(e)

    if not recipients:
        return {"ok": True, "sent": 0, "slug": post["slug"], "reason": "no_recipients"}

    # Send concurrently but bounded
    sem = asyncio.Semaphore(5)

    async def _one(addr: str) -> bool:
        async with sem:
            return await _send_digest_email(addr, post)

    results = await asyncio.gather(*(_one(a) for a in recipients), return_exceptions=False)
    sent_ok = sum(1 for r in results if r)

    if sent_ok == 0:
        # Every recipient failed upstream (rejected by provider). Do NOT mark as sent,
        # so a subsequent non-force retry is still allowed.
        logger.warning(
            f"Blog digest '{post['slug']}': 0/{len(recipients)} recipients accepted — not marking as sent"
        )
        return {
            "ok": False,
            "sent": 0,
            "attempted": len(recipients),
            "slug": post["slug"],
            "reason": "all_recipients_failed",
        }

    await db.blog_digests_sent.update_one(
        {"slug": post["slug"]},
        {"$set": {
            "slug": post["slug"],
            "title": post["title"],
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "recipients_count": sent_ok,
            "attempted": len(recipients),
        }},
        upsert=True,
    )

    logger.info(f"Blog digest '{post['slug']}' sent to {sent_ok}/{len(recipients)} recipients")
    return {
        "ok": True,
        "sent": sent_ok,
        "attempted": len(recipients),
        "slug": post["slug"],
        "title": post["title"],
    }


class DigestSendRequest(BaseModel):
    slug: Optional[str] = None
    force: bool = False


@api_router.post("/admin/blog-digest/send")
async def admin_send_digest(payload: DigestSendRequest, _: dict = Depends(require_admin)):
    return await send_blog_digest(slug=payload.slug, force=payload.force)


@api_router.get("/admin/blog-digest/history")
async def admin_digest_history(_: dict = Depends(require_admin)):
    rows = await db.blog_digests_sent.find({}, {"_id": 0}).sort("sent_at", -1).to_list(100)
    return rows


# ---------- Scheduler ----------
scheduler: Optional[AsyncIOScheduler] = None


async def _weekly_digest_job():
    logger.info("Weekly blog digest cron fired")
    try:
        result = await send_blog_digest()
        logger.info(f"Weekly digest result: {result}")
    except Exception as e:
        logger.exception(f"Weekly digest job failed: {e}")


@app.on_event("startup")
async def _ensure_indexes():
    """Idempotent — ensures the admin session TTL index exists and legacy string rows are purged."""
    try:
        # Purge legacy ISO-string rows so the TTL index can operate consistently.
        await db.admin_sessions.delete_many({"expires_at": {"$type": "string"}})
        await db.admin_sessions.create_index("expires_at", expireAfterSeconds=0)
        logger.info("admin_sessions TTL index ensured (expireAfterSeconds=0)")
    except Exception as e:
        logger.warning(f"Failed to ensure admin_sessions TTL index: {e}")


# ---------- Blog CRUD (DB-backed) ----------
class BlogBlock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str  # "p" | "h2" | "quote" | "list"
    text: Optional[str] = None
    items: Optional[List[str]] = None


class BlogPostBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str = Field(..., min_length=3, max_length=120, pattern=r"^[a-z0-9-]+$")
    title: str = Field(..., min_length=6, max_length=200)
    excerpt: str = Field(..., min_length=10, max_length=600)
    category: str = Field(..., min_length=2, max_length=40)
    date: str = Field(..., min_length=10, max_length=10)  # YYYY-MM-DD
    readMinutes: int = Field(default=5, ge=1, le=60)
    cover: str = Field(..., min_length=8, max_length=800)
    body: List[BlogBlock] = Field(default_factory=list)
    published: bool = True


class BlogPostUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    readMinutes: Optional[int] = None
    cover: Optional[str] = None
    body: Optional[List[BlogBlock]] = None
    published: Optional[bool] = None


def _blog_to_public(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/blog")
async def list_blog_posts(category: Optional[str] = None):
    q: dict = {"published": {"$ne": False}}
    if category:
        q["category"] = category
    rows = await db.blog_posts.find(q, {"_id": 0}).sort("date", -1).to_list(200)
    return [_blog_to_public(r) for r in rows]


@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": {"$ne": False}}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    return _blog_to_public(doc)


@api_router.get("/blog/{slug}/related")
async def get_related_posts(slug: str, limit: int = 3):
    cur = await db.blog_posts.find_one({"slug": slug}, {"_id": 0, "category": 1})
    if not cur:
        # Fall back to newest N
        rows = await db.blog_posts.find(
            {"published": {"$ne": False}}, {"_id": 0}
        ).sort("date", -1).to_list(limit)
        return [_blog_to_public(r) for r in rows]
    # Same-category first, then others, excluding current slug
    same = await db.blog_posts.find(
        {"category": cur["category"], "slug": {"$ne": slug}, "published": {"$ne": False}},
        {"_id": 0},
    ).sort("date", -1).to_list(limit)
    if len(same) >= limit:
        return [_blog_to_public(r) for r in same[:limit]]
    others = await db.blog_posts.find(
        {"category": {"$ne": cur["category"]}, "slug": {"$ne": slug}, "published": {"$ne": False}},
        {"_id": 0},
    ).sort("date", -1).to_list(limit - len(same))
    return [_blog_to_public(r) for r in (same + others)]


@api_router.get("/admin/blog")
async def admin_list_blog(_: dict = Depends(require_admin)):
    """Admin variant of GET /api/blog — includes drafts (published:false)."""
    rows = await db.blog_posts.find({}, {"_id": 0}).sort("date", -1).to_list(500)
    return [_blog_to_public(r) for r in rows]


def _actor_from_session(session: dict) -> str:
    """Return a short, stable identifier for the admin session so audit rows can group by 'who'.
    We hash the session token and keep the first 8 hex chars — enough to distinguish two people
    who share the admin password (each login gets its own token), while never storing the token itself."""
    import hashlib
    tok = (session or {}).get("token", "")
    return hashlib.sha256(tok.encode("utf-8")).hexdigest()[:8] if tok else "unknown"


async def _log_audit(action: str, slug: str, session: dict, *, title: Optional[str] = None,
                     changed_fields: Optional[List[str]] = None) -> None:
    try:
        await db.blog_audit.insert_one({
            "id": str(uuid.uuid4()),
            "action": action,
            "slug": slug,
            "title": title,
            "actor": _actor_from_session(session),
            "changed_fields": changed_fields or [],
            "ts": datetime.now(timezone.utc),
        })
    except Exception as e:
        logger.warning(f"Audit log failed for {action} {slug}: {e}")


@api_router.post("/admin/blog", status_code=201)
async def admin_create_blog(payload: BlogPostBase, session: dict = Depends(require_admin)):
    doc = payload.model_dump()
    if await db.blog_posts.find_one({"slug": doc["slug"]}):
        raise HTTPException(status_code=409, detail="Slug already exists")
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc)
    await db.blog_posts.insert_one(doc)
    await _log_audit("created", doc["slug"], session, title=doc.get("title"))
    return _blog_to_public({k: v for k, v in doc.items() if k != "_id"})


@api_router.put("/admin/blog/{slug}")
async def admin_update_blog(slug: str, payload: BlogPostUpdate, session: dict = Depends(require_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    # Capture current published state BEFORE the write, so we can detect a toggle even when
    # the caller sends the full document (as the PostEditor slide-over does).
    existing = await db.blog_posts.find_one({"slug": slug}, {"_id": 0, "published": 1})
    if existing is None:
        raise HTTPException(status_code=404, detail="Post not found")
    prev_published = existing.get("published", True)
    res = await db.blog_posts.update_one({"slug": slug}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    doc = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    # Classify the action: if the `published` value FLIPPED, that's the primary signal — even if
    # other fields also changed in the same request. Otherwise it's a regular "updated".
    if "published" in updates and bool(updates["published"]) != bool(prev_published):
        action = "published" if updates["published"] else "unpublished"
    else:
        action = "updated"
    await _log_audit(action, slug, session, title=doc.get("title"), changed_fields=sorted(updates.keys()))
    return _blog_to_public(doc)


@api_router.delete("/admin/blog/{slug}")
async def admin_delete_blog(slug: str, session: dict = Depends(require_admin)):
    doc = await db.blog_posts.find_one({"slug": slug}, {"_id": 0, "title": 1})
    res = await db.blog_posts.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    await _log_audit("deleted", slug, session, title=(doc or {}).get("title"))
    return {"ok": True}


@api_router.get("/admin/blog/audit")
async def admin_blog_audit(
    _: dict = Depends(require_admin),
    slug: Optional[str] = None,
    limit: int = 100,
):
    q: dict = {}
    if slug:
        q["slug"] = slug
    rows = await db.blog_audit.find(q, {"_id": 0}).sort("ts", -1).to_list(min(max(limit, 1), 500))
    return rows


@app.on_event("startup")
async def _seed_blog_posts():
    """One-time seed: insert BLOG_SEED only if the collection is empty. Ensures a unique index on slug.
    Also performs the one-time rename of legacy `read_minutes` → `readMinutes` on any existing docs."""
    try:
        await db.blog_posts.create_index("slug", unique=True)
        # One-time migration: legacy docs used snake_case
        migrated = await db.blog_posts.update_many(
            {"read_minutes": {"$exists": True}},
            {"$rename": {"read_minutes": "readMinutes"}},
        )
        if migrated.modified_count:
            logger.info(f"Renamed read_minutes → readMinutes on {migrated.modified_count} blog_posts docs")
        count = await db.blog_posts.count_documents({})
        if count == 0:
            docs = []
            now = datetime.now(timezone.utc)
            for post in BLOG_SEED:
                d = dict(post)
                d["id"] = str(uuid.uuid4())
                d["published"] = True
                d["created_at"] = now
                docs.append(d)
            if docs:
                await db.blog_posts.insert_many(docs)
                logger.info(f"Seeded {len(docs)} blog posts into `blog_posts` collection")
    except Exception as e:
        logger.warning(f"Blog seed step failed: {e}")


@app.on_event("startup")
async def _start_scheduler():
    global scheduler
    if os.environ.get("DISABLE_SCHEDULER") == "1":
        logger.info("Scheduler disabled via DISABLE_SCHEDULER=1")
        return
    scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
    # Every Monday 09:00 IST
    scheduler.add_job(_weekly_digest_job, CronTrigger(day_of_week="mon", hour=9, minute=0))
    scheduler.start()
    logger.info("APScheduler started — weekly blog digest cron registered (Mon 09:00 IST)")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    global scheduler
    if scheduler:
        try:
            scheduler.shutdown(wait=False)
        except Exception:
            pass
    client.close()
