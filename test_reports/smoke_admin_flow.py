"""Pre-launch smoke test: full admin CRUD lifecycle + bulk actions + audit verification.
Runs as a standalone script (not pytest) — cleans up all scratch data at end.
"""
import os
import sys
import uuid
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip().rstrip("/")
                break

PW = "Hetal@110818"


def ok(label, cond, detail=""):
    tag = "PASS" if cond else "FAIL"
    print(f"  [{tag}] {label}" + (f" -- {detail}" if detail else ""))
    if not cond:
        sys.exit(1)


def main():
    print(f"BASE={BASE}")

    # 1) Admin login
    r = requests.post(f"{BASE}/api/admin/login", json={"password": PW})
    ok("admin login 200", r.status_code == 200, str(r.status_code))
    token = r.json()["token"]
    ok("token 43+ chars", len(token) >= 43)
    ok("token != password", token != PW)
    hdr = {"X-Admin-Token": token, "Content-Type": "application/json"}

    # 2) Wrong password → 401
    r = requests.post(f"{BASE}/api/admin/login", json={"password": "nope"})
    ok("wrong password 401", r.status_code == 401)

    # 3) Guards
    r = requests.get(f"{BASE}/api/admin/leads")
    ok("/api/admin/leads without token 401", r.status_code == 401)
    r = requests.get(f"{BASE}/api/admin/leads", headers=hdr)
    ok("/api/admin/leads with token 200", r.status_code == 200)
    r = requests.get(f"{BASE}/api/admin/blog", headers=hdr)
    ok("/api/admin/blog with token 200", r.status_code == 200)
    r = requests.get(f"{BASE}/api/admin/blog")
    ok("/api/admin/blog without token 401", r.status_code == 401)
    r = requests.get(f"{BASE}/api/admin/blog/audit", headers=hdr)
    ok("/api/admin/blog/audit with token 200", r.status_code == 200)
    r = requests.get(f"{BASE}/api/admin/blog/audit")
    ok("/api/admin/blog/audit without token 401", r.status_code == 401)

    # 4) Full single CRUD lifecycle: create draft → publish → delete → audit
    slug = "launch-smoke-test"
    payload = {
        "slug": slug,
        "title": "Launch Smoke Test Post",
        "excerpt": "Temporary scratch post for pre-launch smoke test — will be deleted.",
        "category": "investing",
        "date": "2026-07-20",
        "readMinutes": 3,
        "cover": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
        "body": [{"type": "p", "text": "smoke body"}],
        "published": False,
    }
    # cleanup any residue
    requests.delete(f"{BASE}/api/admin/blog/{slug}", headers=hdr)

    try:
        c = requests.post(f"{BASE}/api/admin/blog", json=payload, headers=hdr)
        ok("create draft 201", c.status_code == 201, c.text[:200])

        # Publish
        pub = requests.put(f"{BASE}/api/admin/blog/{slug}", json={"published": True}, headers=hdr)
        ok("publish 200", pub.status_code == 200, pub.text[:200])

        # Public feed picks it up
        p = requests.get(f"{BASE}/api/blog")
        public_slugs = [x["slug"] for x in p.json()]
        ok("published post in public /api/blog", slug in public_slugs)

        # Unpublish
        unp = requests.put(f"{BASE}/api/admin/blog/{slug}", json={"published": False}, headers=hdr)
        ok("unpublish 200", unp.status_code == 200)

        # Public feed drops it
        p = requests.get(f"{BASE}/api/blog")
        public_slugs = [x["slug"] for x in p.json()]
        ok("unpublished post NOT in public /api/blog", slug not in public_slugs)

        # Delete
        d = requests.delete(f"{BASE}/api/admin/blog/{slug}", headers=hdr)
        ok("delete 200", d.status_code == 200)

        # Audit trail contains created/published/unpublished/deleted
        a = requests.get(f"{BASE}/api/admin/blog/audit", params={"slug": slug, "limit": 100}, headers=hdr)
        ok("audit endpoint 200", a.status_code == 200)
        actions = [row["action"] for row in a.json()]
        for expected in ("created", "published", "unpublished", "deleted"):
            ok(f"audit contains '{expected}'", expected in actions, f"actions={actions}")
    finally:
        requests.delete(f"{BASE}/api/admin/blog/{slug}", headers=hdr)

    # 5) Bulk cycle: 2 scratch slugs → publish → unpublish → delete
    slugs = [f"launch-smoke-bulk-a-{uuid.uuid4().hex[:6]}",
             f"launch-smoke-bulk-b-{uuid.uuid4().hex[:6]}"]
    try:
        for s in slugs:
            body = dict(payload, slug=s, title=f"Bulk scratch {s}", published=False)
            requests.post(f"{BASE}/api/admin/blog", json=body, headers=hdr)

        # bulk publish
        r = requests.post(f"{BASE}/api/admin/blog/bulk",
                          json={"slugs": slugs, "action": "publish"}, headers=hdr)
        ok("bulk publish 200", r.status_code == 200)
        body = r.json()
        ok("bulk publish ok=true", body["ok"] is True, str(body))
        ok("bulk publish processed both", {p["slug"] for p in body["processed"]} == set(slugs))

        # bulk unpublish
        r = requests.post(f"{BASE}/api/admin/blog/bulk",
                          json={"slugs": slugs, "action": "unpublish"}, headers=hdr)
        ok("bulk unpublish 200 + ok", r.status_code == 200 and r.json()["ok"] is True)

        # bulk delete
        r = requests.post(f"{BASE}/api/admin/blog/bulk",
                          json={"slugs": slugs, "action": "delete"}, headers=hdr)
        ok("bulk delete 200 + ok", r.status_code == 200 and r.json()["ok"] is True)

        # audit rows written per slug
        for s in slugs:
            a = requests.get(f"{BASE}/api/admin/blog/audit", params={"slug": s, "limit": 100}, headers=hdr)
            actions = [row["action"] for row in a.json()]
            for e in ("created", "published", "unpublished", "deleted"):
                ok(f"bulk audit {s} has '{e}'", e in actions, f"actions={actions}")
    finally:
        for s in slugs:
            requests.delete(f"{BASE}/api/admin/blog/{s}", headers=hdr)

    # 6) Blog surface checks
    r = requests.get(f"{BASE}/api/blog")
    ok("public /api/blog 200", r.status_code == 200)
    posts = r.json()
    ok("public /api/blog >= 8", len(posts) >= 8, f"got {len(posts)}")
    for p in posts:
        for k in ("slug", "title", "excerpt", "category", "date", "readMinutes", "cover", "body"):
            ok(f"post {p['slug']} has '{k}'", k in p)

    r = requests.get(f"{BASE}/api/blog/5-signals-your-mutual-fund-sends-you")
    ok("specific post 200", r.status_code == 200)
    ok("specific post has 13 body blocks", len(r.json()["body"]) == 13)

    r = requests.get(f"{BASE}/api/blog/does-not-exist-xyz-9999")
    ok("nonexistent slug 404", r.status_code == 404)

    # 7) Lead validation
    r = requests.post(f"{BASE}/api/leads", json={"name": "TEST_", "phone": "123"})
    ok("invalid phone 422", r.status_code == 422)
    r = requests.post(f"{BASE}/api/leads", json={"phone": "+919820012345"})
    ok("missing name 422", r.status_code == 422)

    # 8) Contact + Callback junk rejection
    r = requests.post(f"{BASE}/api/contacts", json={"name": "TEST_", "email": "junk", "message": "m"})
    ok("contact invalid email 422", r.status_code == 422)
    r = requests.post(f"{BASE}/api/callbacks", json={"name": "TEST_", "phone": "junk"})
    ok("callback invalid phone 422", r.status_code == 422)

    print("\n=== ALL SMOKE CHECKS PASSED ===")


if __name__ == "__main__":
    main()
