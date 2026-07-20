"""Backend API tests for Hetal Finserv."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to reading frontend .env
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
BASE_URL = (BASE_URL or "").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health / Root ----------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("service") == "Hetal Finserv API"
        assert data.get("status") == "ok"

    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json().get("status") == "healthy"


# ---------- Leads ----------
class TestLeads:
    def test_create_lead_and_persist(self, api):
        payload = {
            "name": "TEST_Aarav Sharma",
            "phone": "+919820012345",
            "email": "test_aarav@example.com",
            "service": "Mutual Funds & Wealth",
            "message": "Interested in mutual funds",
            "source": "website",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert data["name"] == payload["name"]
        assert data["phone"] == payload["phone"]
        assert data["email"] == payload["email"]

        # Verify GET returns the created lead
        rg = api.get(f"{BASE_URL}/api/leads")
        assert rg.status_code == 200
        rows = rg.json()
        assert isinstance(rows, list)
        ids = [row.get("id") for row in rows]
        assert data["id"] in ids

    def test_create_lead_invalid_phone(self, api):
        r = api.post(
            f"{BASE_URL}/api/leads",
            json={"name": "TEST_Bad Phone", "phone": "abc"},
        )
        assert r.status_code == 422

    def test_create_lead_missing_name(self, api):
        r = api.post(
            f"{BASE_URL}/api/leads",
            json={"phone": "+919820012345"},
        )
        assert r.status_code == 422


# ---------- Contacts ----------
class TestContacts:
    def test_create_contact_and_persist(self, api):
        payload = {
            "name": "TEST_Contact User",
            "email": "test_contact@example.com",
            "phone": "+919812345678",
            "subject": "General enquiry",
            "message": "Please share more details",
        }
        r = api.post(f"{BASE_URL}/api/contacts", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        assert data["name"] == payload["name"]
        assert "id" in data

        rg = api.get(f"{BASE_URL}/api/contacts")
        assert rg.status_code == 200
        ids = [row.get("id") for row in rg.json()]
        assert data["id"] in ids

    def test_create_contact_invalid_email(self, api):
        r = api.post(
            f"{BASE_URL}/api/contacts",
            json={
                "name": "TEST_Bad Email",
                "email": "not-an-email",
                "message": "Some message body",
            },
        )
        assert r.status_code == 422


# ---------- Callbacks ----------
class TestCallbacks:
    def test_create_callback(self, api):
        payload = {
            "name": "TEST_Callback User",
            "phone": "+919812349999",
            "preferred_time": "Morning 10-12",
        }
        r = api.post(f"{BASE_URL}/api/callbacks", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["phone"] == payload["phone"]
        assert "id" in data

    def test_create_callback_invalid_phone(self, api):
        r = api.post(
            f"{BASE_URL}/api/callbacks",
            json={"name": "TEST_Bad", "phone": "xyz"},
        )
        assert r.status_code == 422


# ---------- Admin ----------
ADMIN_PASSWORD = "Hetal@110818"


class TestAdmin:
    def test_admin_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong-password"})
        assert r.status_code == 401

    def test_admin_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("token") == ADMIN_PASSWORD

    def test_admin_leads_unauthorized(self, api):
        # No header
        r = api.get(f"{BASE_URL}/api/admin/leads")
        assert r.status_code == 401
        # Wrong token
        r2 = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": "not-the-token"},
        )
        assert r2.status_code == 401

    def test_admin_leads_authorized(self, api):
        r = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)

    def test_admin_can_see_newly_created_lead_and_patch_contacted(self, api):
        # Create a fresh lead via public route
        payload = {
            "name": "TEST_Admin View Lead",
            "phone": "+919811112222",
            "email": "test_admin_lead@example.com",
            "service": "Loans",
            "message": "Admin flow lead",
        }
        cr = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert cr.status_code == 201
        lead_id = cr.json()["id"]

        # Fetch via admin
        r = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
        )
        assert r.status_code == 200
        ids = [row.get("id") for row in r.json()]
        assert lead_id in ids

        # PATCH contacted=true
        pr = api.patch(
            f"{BASE_URL}/api/admin/leads/{lead_id}",
            json={"contacted": True},
            headers={"X-Admin-Token": ADMIN_PASSWORD},
        )
        assert pr.status_code == 200, pr.text
        assert pr.json().get("ok") is True

        # Verify persistence
        r2 = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
        )
        row = next((x for x in r2.json() if x.get("id") == lead_id), None)
        assert row is not None
        assert row.get("contacted") is True

    def test_admin_patch_unauthorized(self, api):
        r = api.patch(
            f"{BASE_URL}/api/admin/leads/fake-id",
            json={"contacted": True},
        )
        assert r.status_code == 401


# ---------- Chat ----------
class TestChat:
    def test_chat_reply_and_history(self, api):
        import uuid as _uuid
        session_id = f"test-{_uuid.uuid4().hex[:10]}"

        # First message
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": session_id, "text": "What is SIP?"},
            timeout=45,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"].strip()) > 0

        # Fetch history
        h = api.get(f"{BASE_URL}/api/chat/{session_id}")
        assert h.status_code == 200
        msgs = h.json().get("messages", [])
        assert len(msgs) >= 2
        roles = [m.get("role") for m in msgs]
        assert "user" in roles
        assert "assistant" in roles

    def test_chat_missing_session(self, api):
        # session_id too short (min 6) -> 422
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": "x", "text": "hi"},
        )
        assert r.status_code == 422
