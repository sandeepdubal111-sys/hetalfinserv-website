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
                    "readMinutes", "cover", "body"}
        for p in posts:
            missing = required - set(p.keys())
            assert not missing, f"post {p.get('slug')} missing keys: {missing}"
            assert isinstance(p["body"], list)
            assert isinstance(p["readMinutes"], int)

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
            "readMinutes": 4,
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

    def test_admin_list_blog_includes_drafts(self, api, admin_headers):
        """GET /api/admin/blog must return ALL posts including published:false drafts,
        while public GET /api/blog must continue to exclude them."""
        # 1. Unauth 401
        r_unauth = api.get(f"{BASE_URL}/api/admin/blog")
        assert r_unauth.status_code == 401

        # 2. Create a scratch draft (published:false)
        slug = self._scratch_slug()
        payload = self._payload(slug)
        payload["published"] = False
        payload["title"] = "Pytest Scratch Draft — Hidden From Public"
        try:
            c = api.post(f"{BASE_URL}/api/admin/blog", json=payload, headers=admin_headers)
            assert c.status_code == 201, c.text

            # 3. Admin endpoint MUST include the draft
            a = api.get(f"{BASE_URL}/api/admin/blog", headers=admin_headers)
            assert a.status_code == 200, a.text
            admin_rows = a.json()
            assert isinstance(admin_rows, list)
            admin_slugs = [row["slug"] for row in admin_rows]
            assert slug in admin_slugs, f"admin list missing draft slug {slug}"
            row = next(r for r in admin_rows if r["slug"] == slug)
            # Draft flag preserved (published:false) in admin payload
            assert row.get("published") is False, f"admin payload dropped published flag: {row}"

            # 4. Public endpoint MUST NOT include the draft
            p = api.get(f"{BASE_URL}/api/blog")
            assert p.status_code == 200
            public_slugs = [row["slug"] for row in p.json()]
            assert slug not in public_slugs, "draft leaked into public /api/blog"

            # 5. Admin list should be at least 8 (seed) + 1 (draft)
            assert len(admin_rows) >= 9, f"admin list too small: {len(admin_rows)}"
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

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



# ---------- Blog Audit Log ----------
class TestBlogAudit:
    """GET /api/admin/blog/audit + audit rows written on every CRUD action.

    Audit rows: {id, action, slug, title, actor(8 hex), changed_fields[], ts(ISO)}.
    'actor' is first 8 hex of SHA256(session_token). Token itself must never be stored.
    """

    def _scratch_slug(self):
        return f"pytest-audit-{_uuid.uuid4().hex[:10]}"

    def _payload(self, slug):
        return {
            "slug": slug,
            "title": "Pytest Audit Post — Do Not Ship",
            "excerpt": "A temporary audit-test post created by the automated test suite.",
            "category": "investing",
            "date": "2026-08-01",
            "readMinutes": 3,
            "cover": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
            "body": [{"type": "p", "text": "audit body"}],
            "published": True,
        }

    def _rows_for(self, api, headers, slug):
        r = api.get(f"{BASE_URL}/api/admin/blog/audit", params={"slug": slug, "limit": 500}, headers=headers)
        assert r.status_code == 200, r.text
        return r.json()

    def test_audit_endpoint_without_token_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/blog/audit")
        assert r.status_code == 401

    def test_create_writes_created_row(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            c = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            assert c.status_code == 201, c.text

            rows = self._rows_for(api, admin_headers, slug)
            assert len(rows) >= 1
            created = [r for r in rows if r["action"] == "created"]
            assert len(created) == 1, f"expected exactly 1 created row, got {rows}"
            row = created[0]
            assert row["slug"] == slug
            assert row["title"] == "Pytest Audit Post — Do Not Ship"
            assert isinstance(row["actor"], str)
            assert len(row["actor"]) == 8
            assert all(c in "0123456789abcdef" for c in row["actor"])
            assert row.get("changed_fields") == []
            # ts serialized as ISO string
            assert isinstance(row["ts"], str) and "T" in row["ts"]
            # no _id, no raw token
            assert "_id" not in row
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_update_non_published_writes_updated_row_with_changed_fields(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)

            u = api.put(
                f"{BASE_URL}/api/admin/blog/{slug}",
                json={"title": "New Audit Title Here"},
                headers=admin_headers,
            )
            assert u.status_code == 200, u.text

            rows = self._rows_for(api, admin_headers, slug)
            updated = [r for r in rows if r["action"] == "updated"]
            assert len(updated) == 1, f"expected exactly 1 updated row, got {rows}"
            assert updated[0]["changed_fields"] == ["title"]
            assert updated[0]["slug"] == slug
            # action label MUST NOT be 'published' or 'unpublished' for a plain title-only update
            actions = {r["action"] for r in rows}
            assert "published" not in actions and "unpublished" not in actions
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_publish_toggle_writes_published_then_unpublished(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            # create as draft
            p = self._payload(slug)
            p["published"] = False
            api.post(f"{BASE_URL}/api/admin/blog", json=p, headers=admin_headers)

            # publish
            r1 = api.put(f"{BASE_URL}/api/admin/blog/{slug}", json={"published": True}, headers=admin_headers)
            assert r1.status_code == 200
            # unpublish
            r2 = api.put(f"{BASE_URL}/api/admin/blog/{slug}", json={"published": False}, headers=admin_headers)
            assert r2.status_code == 200

            rows = self._rows_for(api, admin_headers, slug)
            actions_in_order = [r["action"] for r in rows]  # sorted desc by ts
            # Latest first: unpublished, published, created
            assert actions_in_order[:3] == ["unpublished", "published", "created"], (
                f"unexpected order (desc): {actions_in_order}"
            )
            pub_row = next(r for r in rows if r["action"] == "published")
            unpub_row = next(r for r in rows if r["action"] == "unpublished")
            assert pub_row["changed_fields"] == ["published"]
            assert unpub_row["changed_fields"] == ["published"]
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_delete_writes_deleted_row_with_snapshot_title(self, api, admin_headers):
        slug = self._scratch_slug()
        api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)

        d = api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)
        assert d.status_code == 200, d.text

        rows = self._rows_for(api, admin_headers, slug)
        deleted = [r for r in rows if r["action"] == "deleted"]
        assert len(deleted) == 1
        assert deleted[0]["slug"] == slug
        # title snapshot must have been captured BEFORE deletion
        assert deleted[0]["title"] == "Pytest Audit Post — Do Not Ship"

    def test_audit_filter_by_slug_isolates_rows(self, api, admin_headers):
        slug_a = self._scratch_slug()
        slug_b = self._scratch_slug()
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug_a), headers=admin_headers)
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug_b), headers=admin_headers)

            a_rows = self._rows_for(api, admin_headers, slug_a)
            assert all(r["slug"] == slug_a for r in a_rows), "slug filter leaked other slugs"
            assert any(r["action"] == "created" for r in a_rows)

            b_rows = self._rows_for(api, admin_headers, slug_b)
            assert all(r["slug"] == slug_b for r in b_rows)
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug_a}", headers=admin_headers)
            api.delete(f"{BASE_URL}/api/admin/blog/{slug_b}", headers=admin_headers)

    def test_audit_global_list_sorted_desc_and_respects_limit(self, api, admin_headers):
        slug = self._scratch_slug()
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            api.put(f"{BASE_URL}/api/admin/blog/{slug}", json={"title": "Global Sort Check"}, headers=admin_headers)

            # No slug filter → global
            r = api.get(f"{BASE_URL}/api/admin/blog/audit", headers=admin_headers)
            assert r.status_code == 200
            rows = r.json()
            assert isinstance(rows, list)
            # default limit is 100
            assert len(rows) <= 100
            # sorted desc by ts
            timestamps = [row["ts"] for row in rows]
            assert timestamps == sorted(timestamps, reverse=True), "audit not sorted desc by ts"
            # our slug should appear (unless it was pushed past 100 by other tests — allow either)
            # but the more important assertion is the ordering above.

            # limit=1 returns at most 1 row
            r1 = api.get(f"{BASE_URL}/api/admin/blog/audit", params={"limit": 1}, headers=admin_headers)
            assert r1.status_code == 200
            assert len(r1.json()) <= 1

            # hard-cap at 500 — asking for 10000 must NOT return more than 500
            rmax = api.get(f"{BASE_URL}/api/admin/blog/audit", params={"limit": 10000}, headers=admin_headers)
            assert rmax.status_code == 200
            assert len(rmax.json()) <= 500
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)

    def test_different_sessions_produce_different_actor_hashes(self, api):
        """Two independent logins → two different tokens → two different actor hashes."""
        # login session A
        rA = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert rA.status_code == 200
        tokA = rA.json()["token"]
        headersA = {"X-Admin-Token": tokA, "Content-Type": "application/json"}

        # login session B (different token)
        rB = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert rB.status_code == 200
        tokB = rB.json()["token"]
        headersB = {"X-Admin-Token": tokB, "Content-Type": "application/json"}

        assert tokA != tokB, "two logins returned identical tokens"

        slug_a = f"pytest-audit-sa-{_uuid.uuid4().hex[:8]}"
        slug_b = f"pytest-audit-sb-{_uuid.uuid4().hex[:8]}"
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug_a), headers=headersA)
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug_b), headers=headersB)

            rows_a = self._rows_for(api, headersA, slug_a)
            rows_b = self._rows_for(api, headersA, slug_b)  # any admin can read
            assert rows_a and rows_b
            actor_a = rows_a[0]["actor"]
            actor_b = rows_b[0]["actor"]
            assert actor_a != actor_b, f"expected different actors, got {actor_a} == {actor_b}"
            # Both hashes exactly 8 lowercase hex
            for a in (actor_a, actor_b):
                assert len(a) == 8 and all(c in "0123456789abcdef" for c in a)
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug_a}", headers=headersA)
            api.delete(f"{BASE_URL}/api/admin/blog/{slug_b}", headers=headersA)

    def test_token_never_leaks_into_audit_rows(self, api, admin_token, admin_headers):
        """The raw session token must NOT appear anywhere in any audit row (no 'token' key,
        and the token string must not appear as any value)."""
        slug = self._scratch_slug()
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            api.put(f"{BASE_URL}/api/admin/blog/{slug}", json={"title": "no leak"}, headers=admin_headers)

            # Pull a large batch from the global feed
            r = api.get(f"{BASE_URL}/api/admin/blog/audit", params={"limit": 500}, headers=admin_headers)
            assert r.status_code == 200
            rows = r.json()
            assert rows, "no audit rows returned"

            # Serialize the whole payload as text and search for the raw token
            import json as _json
            blob = _json.dumps(rows)
            assert admin_token not in blob, "raw session token leaked into audit payload!"
            # No row should contain a 'token' key
            for row in rows:
                assert "token" not in row, f"row unexpectedly has 'token' key: {row}"
        finally:
            api.delete(f"{BASE_URL}/api/admin/blog/{slug}", headers=admin_headers)


# ---------- Bulk Blog Actions ----------
class TestBulkBlog:
    """POST /api/admin/blog/bulk — bulk publish/unpublish/delete with per-slug audit rows.

    Contract:
    - 401 without token
    - 400 on invalid action
    - 422 on empty slug list (Pydantic min_length=1) and > max_length=200
    - Response: {ok: bool, processed: [{slug, no_op?: true}], failed: [{slug, error}]}
    - Successful flip → writes exactly ONE audit row per slug (published|unpublished|deleted).
    - No-op flip (already at target state) → processed with no_op:true, ZERO audit rows.
    - Non-existent slug on publish/unpublish/delete → failed with error='not_found', no audit row.
    """

    def _scratch_slug(self, tag: str = "x"):
        # lowercase-only per BlogPostBase regex ^[a-z0-9-]+$
        return f"pytest-bulk-{tag}-{_uuid.uuid4().hex[:8]}"

    def _payload(self, slug: str, published: bool = False):
        return {
            "slug": slug,
            "title": "Pytest Bulk Post — Do Not Ship",
            "excerpt": "A temporary bulk-test post created by the automated test suite.",
            "category": "investing",
            "date": "2026-08-01",
            "readMinutes": 3,
            "cover": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
            "body": [{"type": "p", "text": "bulk body"}],
            "published": published,
        }

    def _audit_rows(self, api, headers, slug):
        r = api.get(f"{BASE_URL}/api/admin/blog/audit",
                    params={"slug": slug, "limit": 500}, headers=headers)
        assert r.status_code == 200, r.text
        return r.json()

    def _cleanup(self, api, headers, slugs):
        for s in slugs:
            try:
                api.delete(f"{BASE_URL}/api/admin/blog/{s}", headers=headers)
            except Exception:
                pass

    # ---- Auth / validation ----
    def test_bulk_without_token_returns_401(self, api):
        r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": ["whatever"], "action": "publish"})
        assert r.status_code == 401

    def test_bulk_invalid_action_returns_400(self, api, admin_headers):
        slug = self._scratch_slug("inv")
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug), headers=admin_headers)
            r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                         json={"slugs": [slug], "action": "nuke"}, headers=admin_headers)
            assert r.status_code == 400, r.text
        finally:
            self._cleanup(api, admin_headers, [slug])

    def test_bulk_empty_slugs_returns_422(self, api, admin_headers):
        r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [], "action": "publish"}, headers=admin_headers)
        assert r.status_code == 422, r.text

    def test_bulk_over_cap_returns_422(self, api, admin_headers):
        # 201 slugs — Pydantic max_length=200 → 422
        slugs = [f"pytest-bulk-cap-{i:03d}" for i in range(201)]
        r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": slugs, "action": "publish"}, headers=admin_headers)
        assert r.status_code == 422, r.text

    # ---- Happy paths ----
    def test_bulk_publish_two_drafts_writes_two_audit_rows(self, api, admin_headers):
        a = self._scratch_slug("pa")
        b = self._scratch_slug("pb")
        try:
            # Both drafts (published:false)
            r_a = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(a, published=False), headers=admin_headers)
            r_b = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(b, published=False), headers=admin_headers)
            assert r_a.status_code == 201 and r_b.status_code == 201

            # Baseline: only 'created' rows so far
            base_a = self._audit_rows(api, admin_headers, a)
            base_b = self._audit_rows(api, admin_headers, b)
            assert [r["action"] for r in base_a] == ["created"]
            assert [r["action"] for r in base_b] == ["created"]

            # Bulk publish
            r1 = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                          json={"slugs": [a, b], "action": "publish"},
                          headers=admin_headers)
            assert r1.status_code == 200, r1.text
            body = r1.json()
            assert body["ok"] is True
            assert body["failed"] == []
            processed_slugs = {p["slug"] for p in body["processed"]}
            assert processed_slugs == {a, b}
            # First call must NOT be no_op
            for p in body["processed"]:
                assert not p.get("no_op"), f"unexpected no_op on first publish: {p}"

            # Each slug has exactly one 'published' audit row
            for s in (a, b):
                rows = self._audit_rows(api, admin_headers, s)
                pub_rows = [r for r in rows if r["action"] == "published"]
                assert len(pub_rows) == 1, f"expected 1 published row for {s}, got {rows}"
                assert pub_rows[0]["changed_fields"] == ["published"]

            # Public GET /api/blog now surfaces both
            pub = api.get(f"{BASE_URL}/api/blog")
            assert pub.status_code == 200
            public_slugs = {p["slug"] for p in pub.json()}
            assert a in public_slugs and b in public_slugs, "bulk-published slugs missing from public feed"

            # Second call with same payload → no-op flips, ZERO new audit rows
            before_a = len(self._audit_rows(api, admin_headers, a))
            before_b = len(self._audit_rows(api, admin_headers, b))
            r2 = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                          json={"slugs": [a, b], "action": "publish"},
                          headers=admin_headers)
            assert r2.status_code == 200
            body2 = r2.json()
            assert body2["ok"] is True and body2["failed"] == []
            # Every processed entry must be no_op:true
            for p in body2["processed"]:
                assert p.get("no_op") is True, f"expected no_op on repeat publish: {p}"
            # NO new audit rows written
            assert len(self._audit_rows(api, admin_headers, a)) == before_a
            assert len(self._audit_rows(api, admin_headers, b)) == before_b
        finally:
            self._cleanup(api, admin_headers, [a, b])

    def test_bulk_unpublish_with_ghost_slug_partial_failure(self, api, admin_headers):
        a = self._scratch_slug("ua")
        b = self._scratch_slug("ub")
        ghost = f"pytest-bulk-ghost-{_uuid.uuid4().hex[:8]}"
        try:
            # Both real ones start published
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(a, published=True), headers=admin_headers)
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(b, published=True), headers=admin_headers)

            r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                         json={"slugs": [a, ghost, b], "action": "unpublish"},
                         headers=admin_headers)
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["ok"] is False, "ok must be false when any slug fails"
            processed_slugs = {p["slug"] for p in body["processed"]}
            assert processed_slugs == {a, b}
            assert body["failed"] == [{"slug": ghost, "error": "not_found"}]

            # Only the real slugs got audit rows
            for s in (a, b):
                rows = self._audit_rows(api, admin_headers, s)
                unpub = [r for r in rows if r["action"] == "unpublished"]
                assert len(unpub) == 1, f"expected 1 unpublished row for {s}, got {rows}"
            ghost_rows = self._audit_rows(api, admin_headers, ghost)
            assert ghost_rows == [], f"ghost slug got audit rows: {ghost_rows}"
        finally:
            self._cleanup(api, admin_headers, [a, b])

    def test_bulk_delete_two_slugs_then_repeat_all_not_found(self, api, admin_headers):
        a = self._scratch_slug("da")
        b = self._scratch_slug("db")
        try:
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(a), headers=admin_headers)
            api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(b), headers=admin_headers)

            r1 = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                          json={"slugs": [a, b], "action": "delete"},
                          headers=admin_headers)
            assert r1.status_code == 200, r1.text
            body = r1.json()
            assert body["ok"] is True
            assert body["failed"] == []
            assert {p["slug"] for p in body["processed"]} == {a, b}

            # Each slug has exactly one 'deleted' audit row
            for s in (a, b):
                rows = self._audit_rows(api, admin_headers, s)
                deleted = [r for r in rows if r["action"] == "deleted"]
                assert len(deleted) == 1, f"expected 1 deleted row for {s}, got {rows}"

            # Rows are actually gone from the admin listing
            admin_list = api.get(f"{BASE_URL}/api/admin/blog", headers=admin_headers)
            assert admin_list.status_code == 200
            remaining = {p["slug"] for p in admin_list.json()}
            assert a not in remaining and b not in remaining

            # Second call: both slugs missing → 2 failed 'not_found', no processed
            r2 = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                          json={"slugs": [a, b], "action": "delete"},
                          headers=admin_headers)
            assert r2.status_code == 200
            body2 = r2.json()
            assert body2["ok"] is False
            assert body2["processed"] == []
            errs = sorted(body2["failed"], key=lambda x: x["slug"])
            assert errs == sorted([{"slug": a, "error": "not_found"},
                                   {"slug": b, "error": "not_found"}], key=lambda x: x["slug"])
        finally:
            self._cleanup(api, admin_headers, [a, b])

    def test_audit_row_count_full_lifecycle(self, api, admin_headers):
        """created + published + unpublished + deleted = exactly 4 rows.
        Extra no_op flips in the middle MUST NOT add rows."""
        slug = self._scratch_slug("life")
        try:
            # 1) create as draft (published:false) → 1 row 'created'
            c = api.post(f"{BASE_URL}/api/admin/blog", json=self._payload(slug, published=False), headers=admin_headers)
            assert c.status_code == 201

            # 2) bulk unpublish on an already-draft → no_op, 0 rows added
            api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [slug], "action": "unpublish"}, headers=admin_headers)

            # 3) bulk publish → 1 'published' row
            api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [slug], "action": "publish"}, headers=admin_headers)

            # 4) bulk publish again → no_op, 0 rows added
            api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [slug], "action": "publish"}, headers=admin_headers)

            # 5) bulk unpublish → 1 'unpublished' row
            api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [slug], "action": "unpublish"}, headers=admin_headers)

            # 6) bulk delete → 1 'deleted' row
            api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [slug], "action": "delete"}, headers=admin_headers)

            rows = self._audit_rows(api, admin_headers, slug)
            actions = [r["action"] for r in rows]  # desc by ts
            assert actions == ["deleted", "unpublished", "published", "created"], (
                f"unexpected audit sequence: {actions}"
            )
            assert len(rows) == 4, f"expected exactly 4 audit rows, got {len(rows)}: {actions}"
        finally:
            self._cleanup(api, admin_headers, [slug])

    def test_bulk_publish_all_ghost_slugs_returns_ok_false(self, api, admin_headers):
        """Sanity: a bulk publish where every slug is missing must return ok=false with all failures."""
        g1 = f"pytest-bulk-ghost1-{_uuid.uuid4().hex[:8]}"
        g2 = f"pytest-bulk-ghost2-{_uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/admin/blog/bulk",
                     json={"slugs": [g1, g2], "action": "publish"}, headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is False
        assert body["processed"] == []
        failed_slugs = sorted(f["slug"] for f in body["failed"])
        assert failed_slugs == sorted([g1, g2])
        for f in body["failed"]:
            assert f["error"] == "not_found"
