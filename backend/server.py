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
