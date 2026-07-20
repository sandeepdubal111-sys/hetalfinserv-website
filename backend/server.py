from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import asyncio
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone


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


class AdminLoginRequest(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    if not ADMIN_PASSWORD or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    # Return the raw password as the token — used by admin_guard() below.
    # (This site has a single trusted admin; a stronger token flow would use JWT.)
    return {"token": ADMIN_PASSWORD}


def admin_guard(x_admin_token: Optional[str] = None):
    """Verifies a per-request X-Admin-Token header matches ADMIN_PASSWORD."""
    if not ADMIN_PASSWORD or x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")


from fastapi import Header


@api_router.get("/admin/leads")
async def admin_list_leads(
    x_admin_token: Optional[str] = Header(default=None, alias="X-Admin-Token"),
    limit: int = 500,
):
    admin_guard(x_admin_token)
    rows = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return rows


@api_router.patch("/admin/leads/{lead_id}")
async def admin_update_lead(
    lead_id: str,
    payload: dict,
    x_admin_token: Optional[str] = Header(default=None, alias="X-Admin-Token"),
):
    admin_guard(x_admin_token)
    allowed = {k: v for k, v in payload.items() if k in {"contacted", "notes"}}
    if not allowed:
        raise HTTPException(status_code=400, detail="No valid fields")
    await db.leads.update_one({"id": lead_id}, {"$set": allowed})
    return {"ok": True}


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
    client.close()
