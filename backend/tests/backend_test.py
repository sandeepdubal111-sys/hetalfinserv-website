"""Backend API tests for Hetal Finserv.

Iteration 3 update:
- Admin auth switched from raw-password token to random session tokens
  (POST /api/admin/login -> {token, expires_in_hours}). All admin tests now
  log in first via a shared fixture and use the returned opaque token.
- New TestAdminSession group: opaque token != password, logout invalidates,
  raw password fails, two independent session tokens.
- New TestBlogDigest group: send/idempotent/force/unknown-slug/history.
"""
import os
import uuid as _uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
BASE_URL = (BASE_URL or "").rstrip("/")

ADMIN_PASSWORD = "Hetal@110818"


# ---------- Shared fixtures ----------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture()
def admin_token(api):
    """Log in fresh and return a session token. Function-scoped so tests
    that logout get a clean token."""
    r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    token = r.json().get("token")
    assert token, "login did not return a token"
    return token


@pytest.fixture()
def admin_headers(admin_token):
    return {"X-Admin-Token": admin_token, "Content-Type": "application/json"}


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


# ---------- Admin login / session token ----------
class TestAdminSession:
    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong-password"})
        assert r.status_code == 401

    def test_login_returns_opaque_random_token(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        token = data.get("token")
        assert isinstance(token, str)
        # secrets.token_urlsafe(32) => 43 chars
        assert len(token) >= 43, f"token too short: {len(token)}"
        # MUST NOT leak the raw password
        assert token != ADMIN_PASSWORD
        assert ADMIN_PASSWORD not in token
        assert data.get("expires_in_hours") == 8

    def test_raw_password_as_token_rejected(self, api):
        """Old behaviour where raw password worked as X-Admin-Token must be dead."""
        r = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
        )
        assert r.status_code == 401

    def test_two_logins_return_different_tokens_both_valid(self, api):
        r1 = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        r2 = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert r1.status_code == 200 and r2.status_code == 200
        t1 = r1.json()["token"]
        t2 = r2.json()["token"]
        assert t1 != t2, "two logins returned the same token"

        # both work independently
        a = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": t1})
        b = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": t2})
        assert a.status_code == 200
        assert b.status_code == 200

        # logout t1 -> t2 still valid, t1 dead
        lo = api.post(f"{BASE_URL}/api/admin/logout", headers={"X-Admin-Token": t1})
        assert lo.status_code == 200
        assert lo.json().get("ok") is True

        a2 = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": t1})
        assert a2.status_code == 401
        b2 = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": t2})
        assert b2.status_code == 200

    def test_logout_invalidates_token(self, api):
        # fresh login
        lr = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        token = lr.json()["token"]

        # verify token works
        pre = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": token})
        assert pre.status_code == 200

        # logout
        out = api.post(f"{BASE_URL}/api/admin/logout", headers={"X-Admin-Token": token})
        assert out.status_code == 200

        # verify token now rejected
        post = api.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": token})
        assert post.status_code == 401

    def test_logout_without_token_401(self, api):
        r = api.post(f"{BASE_URL}/api/admin/logout")
        assert r.status_code == 401


# ---------- Admin leads (now session-token flow) ----------
class TestAdminLeads:
    def test_admin_leads_unauthorized(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads")
        assert r.status_code == 401
        r2 = api.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"X-Admin-Token": "not-a-real-token-xxx"},
        )
        assert r2.status_code == 401

    def test_admin_leads_authorized(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_admin_can_see_newly_created_lead_and_patch(self, api, admin_headers):
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

        r = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
        assert r.status_code == 200
        ids = [row.get("id") for row in r.json()]
        assert lead_id in ids

        pr = api.patch(
            f"{BASE_URL}/api/admin/leads/{lead_id}",
            json={"contacted": True},
            headers=admin_headers,
        )
        assert pr.status_code == 200, pr.text
        assert pr.json().get("ok") is True

        r2 = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
        row = next((x for x in r2.json() if x.get("id") == lead_id), None)
        assert row is not None
        assert row.get("contacted") is True

    def test_admin_patch_unauthorized(self, api):
        r = api.patch(
            f"{BASE_URL}/api/admin/leads/fake-id",
            json={"contacted": True},
        )
        assert r.status_code == 401


# ---------- Blog digest ----------
class TestBlogDigest:
    """Weekly digest manual-trigger endpoint + history + idempotency."""

    def test_unknown_slug_returns_post_not_found(self, api, admin_headers):
        r = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": "this-slug-does-not-exist-xyz"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is False
        assert data.get("error") == "post_not_found"

    def test_send_and_idempotent_and_force(self, api, admin_headers):
        # Ensure at least one lead with an email exists so recipients > 0
        seed = {
            "name": "TEST_Digest Recipient",
            "phone": "+919812345001",
            "email": f"test_digest_{_uuid.uuid4().hex[:6]}@example.com",
            "service": "Mutual Funds",
            "message": "digest seed",
        }
        s = api.post(f"{BASE_URL}/api/leads", json=seed)
        assert s.status_code == 201

        # First call: pick a specific known slug
        slug = "sip-laziness-pays-off"
        r1 = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": slug, "force": True},
            headers=admin_headers,
        )
        assert r1.status_code == 200, r1.text
        data1 = r1.json()
        assert data1.get("slug") == slug
        assert "title" in data1
        # Upstream Emergent email accepts real recipients only; assert bounds.
        assert data1.get("attempted", 0) >= data1.get("sent", 0) >= 0

        # If upstream rejected every recipient the row is NOT marked as sent,
        # so the "already_sent" idempotency path can't be verified in this run.
        if data1.get("ok") is not True or data1.get("sent", 0) == 0:
            pytest.skip(
                f"Upstream email provider rejected all {data1.get('attempted')} test recipients — "
                "cannot verify idempotency path. (Not a code regression.)"
            )

        # Second call without force -> skipped
        r2 = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": slug},
            headers=admin_headers,
        )
        assert r2.status_code == 200, r2.text
        data2 = r2.json()
        assert data2.get("ok") is True
        assert data2.get("skipped") is True
        assert data2.get("reason") == "already_sent"
        assert data2.get("slug") == slug

        # Force re-send
        r3 = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": slug, "force": True},
            headers=admin_headers,
        )
        assert r3.status_code == 200, r3.text
        data3 = r3.json()
        # force path returns sent/attempted, NOT skipped. `ok` may be False if
        # upstream email provider rejects every test recipient — that is not a
        # regression, so we assert on shape, not the boolean.
        assert data3.get("skipped") is not True
        assert data3.get("slug") == slug
        assert "sent" in data3 and "attempted" in data3

    def test_history_contains_sent_digest(self, api, admin_headers):
        # send one (force to avoid idempotent skip masking recipients_count)
        slug = "five-quotes-great-investors-think"
        sent = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": slug, "force": True},
            headers=admin_headers,
        )
        assert sent.status_code == 200

        r = api.get(
            f"{BASE_URL}/api/admin/blog-digest/history",
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list)
        row = next((x for x in rows if x.get("slug") == slug), None)
        assert row is not None, f"slug {slug} not in history"
        assert "recipients_count" in row
        assert isinstance(row["recipients_count"], int)
        assert "sent_at" in row
        assert row.get("title")

    def test_digest_endpoints_require_auth(self, api):
        r1 = api.post(
            f"{BASE_URL}/api/admin/blog-digest/send",
            json={"slug": "sip-laziness-pays-off"},
        )
        assert r1.status_code == 401

        r2 = api.get(f"{BASE_URL}/api/admin/blog-digest/history")
        assert r2.status_code == 401


# ---------- Chat ----------
class TestChat:
    def test_chat_reply_and_history(self, api):
        session_id = f"test-{_uuid.uuid4().hex[:10]}"

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

        h = api.get(f"{BASE_URL}/api/chat/{session_id}")
        assert h.status_code == 200
        msgs = h.json().get("messages", [])
        assert len(msgs) >= 2
        roles = [m.get("role") for m in msgs]
        assert "user" in roles
        assert "assistant" in roles

    def test_chat_missing_session(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat",
            json={"session_id": "x", "text": "hi"},
        )
        assert r.status_code == 422


# ---------- Blog Public (DB-backed) ----------
class TestBlogPublic:
    """Public /api/blog endpoints — DB seeded from /app/backend/blog_seed.py (8 posts)."""

    def test_list_returns_at_least_8_and_shape(self, api):
        r = api.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200, r.text
        posts = r.json()
        assert isinstance(posts, list)
        assert len(posts) >= 8, f"expected >=8 posts, got {len(posts)}"

        required = {"slug", "title", "excerpt", "category", "date",
                    "read_minutes", "readMinutes", "cover", "body"}
        for p in posts:
            missing = required - set(p.keys())
            assert not missing, f"post {p.get('slug')} missing keys: {missing}"
            assert isinstance(p["body"], list)
            assert p["read_minutes"] == p["readMinutes"]

        # sorted by date desc
        dates = [p["date"] for p in posts]
        assert dates == sorted(dates, reverse=True), f"posts not date-desc: {dates}"

    def test_list_behaviour_category(self, api):
        r = api.get(f"{BASE_URL}/api/blog?category=behaviour")
        assert r.status_code == 200, r.text
        posts = r.json()
        assert isinstance(posts, list)
        assert len(posts) == 3, f"expected 3 behaviour posts, got {len(posts)}"
        for p in posts:
            assert p["category"] == "behaviour"

    def test_get_specific_post_full_body(self, api):
        r = api.get(f"{BASE_URL}/api/blog/5-signals-your-mutual-fund-sends-you")
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["slug"] == "5-signals-your-mutual-fund-sends-you"
        assert isinstance(p["body"], list)
        assert len(p["body"]) == 13, f"expected 13 body blocks, got {len(p['body'])}"

    def test_get_nonexistent_slug_returns_404(self, api):
        r = api.get(f"{BASE_URL}/api/blog/does-not-exist-abc123")
        assert r.status_code == 404

    def test_related_returns_3_excluding_current(self, api):
        slug = "5-signals-your-mutual-fund-sends-you"
        r = api.get(f"{BASE_URL}/api/blog/{slug}/related?limit=3")
        assert r.status_code == 200, r.text
        rel = r.json()
        assert isinstance(rel, list)
        assert len(rel) == 3, f"expected 3 related, got {len(rel)}"
        for item in rel:
            assert item["slug"] != slug, "related list included current slug"


# ---------- Blog Admin CRUD ----------
class TestBlogAdmin:
    """POST/PUT/DELETE /api/admin/blog — session-token guarded, auto-cleans scratch slugs."""

    def _scratch_slug(self):
        return f"pytest-scratch-{_uuid.uuid4().hex[:10]}"

    def _payload(self, slug):
        return {
            "slug": slug,
            "title": "Pytest Scratch Post — Do Not Ship",
            "excerpt": "A temporary post created by the automated test suite. Safe to delete.",
            "category": "investing",
            "date": "2026-07-01",
            "read_minutes": 4,
            "cover": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
            "body": [
                {"type": "p", "text": "Body paragraph one."},
                {"type": "h2", "text": "A heading"},
                {"type": "p", "text": "Body paragraph two."},
            ],
            "published": True,
        }

    def test_create_without_token_returns_401(self, api):
        slug = self._scratch_slug()
        r = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug))
        assert r.status_code == 401

    def test_create_with_valid_token_returns_201_and_get_works(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            r = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            assert r.status_code == 201, r.text
            data = r.json()
            assert data["slug"] == slug
            assert data["title"] == "Pytest Scratch Post — Do Not Ship"
            assert "readMinutes" in data
            assert data["readMinutes"] == 4

            # verify via public GET
            g = api.get(f"{BASE_URL}/api/blog/{slug}")
            assert g.status_code == 200
            assert g.json()["slug"] == slug
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_duplicate_slug_returns_409(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            r1 = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            assert r1.status_code == 201, r1.text
            r2 = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            assert r2.status_code == 409, r2.text
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_invalid_slug_pattern_returns_422(self, api, admin_headers):
        # Uppercase
        p = self._payload("HAS-UPPER-CASE")
        r = api.post(f"{BASE_URL}/api/admin/blog", json=p, headers=admin_headers)
        assert r.status_code == 422, r.text

        # Spaces
        p2 = self._payload("has spaces here")
        r2 = api.post(f"{BASE_URL}/api/admin/blog", json=p2, headers=admin_headers)
        assert r2.status_code == 422, r2.text

    def test_update_and_unpublish_hides_from_public(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)

            # update title/excerpt
            u = api.put(
                f"{BASE_URL}/api/admin/blog/{slug}",
                json={"title": "Updated Title Here", "excerpt": "Updated excerpt content longer than ten chars."},
                headers=admin_headers,
            )
            assert u.status_code == 200, u.text
            assert u.json()["title"] == "Updated Title Here"

            # verify persisted
            g = api.get(f"{BASE_URL}/api/blog/{slug}")
            assert g.status_code == 200
            assert g.json()["title"] == "Updated Title Here"

            # unpublish
            unp = api.put(
                f"{BASE_URL}/api/admin/blog/{slug}",
                json={"published": False},
                headers=admin_headers,
            )
            assert unp.status_code == 200

            # public GET should now 404
            g2 = api.get(f"{BASE_URL}/api/blog/{slug}")
            assert g2.status_code == 404, "unpublished post still exposed on public GET"

            # public list should not include it
            l = api.get(f"{BASE_URL}/api/blog")
            slugs = [p["slug"] for p in l.json()]
            assert slug not in slugs, "unpublished post appears in public list"
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_delete_then_second_delete_returns_404(self, api, admin_headers):
        slug = self._scratch_slug()
        api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
        d1 = api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)
        assert d1.status_code == 200, d1.text
        assert d1.json().get("ok") is True

        d2 = api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)
        assert d2.status_code == 404

    def test_digest_after_deleting_newest_picks_next_newest(self, api, admin_headers):
        """Create a scratch post dated in the future so it becomes newest, then delete it and
        ensure send_blog_digest (no slug) picks a different slug (the next-newest)."""
        slug = self._scratch_slug()
        payload = self._payload(slug)
        payload["date"] = "2030-01-01"  # ensure newest
        payload["title"] = "Future Scratch — Newest"

        try:
            create = api.post(f"{BASE_URL}/api/admin/blog", json=payload, headers=admin_headers)
            assert create.status_code == 201, create.text

            # Confirm the newest via list
            l = api.get(f"{BASE_URL}/api/blog")
            assert l.json()[0]["slug"] == slug

            # Delete it
            d = api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)
            assert d.status_code == 200

            # Now digest must pick a different slug
            r = api.post(
                f"{BASE_URL}/api/admin/blog-digest/send",
                json={"force": True},
                headers=admin_headers,
            )
            assert r.status_code == 200, r.text
            data = r.json()
            assert data.get("slug") != slug, f"digest still points to deleted slug: {slug}"
            assert data.get("ok") is True
        finally:
            # In case delete failed above, try to clean up
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)
