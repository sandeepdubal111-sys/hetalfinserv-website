# Hetal Finserv — Marketing Website

## Problem statement (original)
Hetal Finserv website — a marketing site to present financial services, build trust, and capture leads. Awwwards-level design, bold editorial art direction.

## Architecture
- **Frontend**: React 19 + Tailwind + framer-motion + lenis (smooth momentum scroll) + Sonner (toasts)
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (collections: leads, contacts, callbacks)
- **Design system**: "Editorial Heritage" — Bone Ivory + Obsidian + Champagne Gold + Deep Emerald with Cormorant Garamond (display) + Manrope (body) + JetBrains Mono (labels)

## User personas
1. Individual seeking loans/investments
2. Small business owners
3. Returning clients / referrals

## Core requirements (static)
- Kinetic hero with masked line-by-line reveal + subtle parallax portrait
- Editorial marquees (Independent · Fiduciary-minded · Boutique …)
- Numbered manifesto chapters (01, 02, 03)
- Services page + on-home preview (6 practices)
- Founder profile with international/professional certifications + achievements
- AMC partners marquee
- Testimonials rotator
- FAQ accordion
- Contact + Lead form (stored in MongoDB)
- WhatsApp click-to-chat floating pill
- Mobile responsive

## Implemented (2026-07-20)
- ✅ Backend: POST/GET /api/leads, /api/contacts, /api/callbacks
- ✅ Frontend routes: /, /services, /about, /contact
- ✅ Kinetic hero, marquee, manifesto, services grid, stats count-up, AMC partners marquee, founder profile, testimonials rotator, FAQ, contact form, footer, WhatsApp floating CTA
- ✅ Lenis smooth scrolling + framer-motion scroll reveals
- ✅ Grain overlay, editorial framing on imagery
- ✅ Data-testid attributes across interactive elements
- ✅ Regulators grid (AMFI, SEBI, IRDAI, MahaRERA, NISM) with branded text-token marks
- ✅ Verify Us CTA in footer
- ✅ Animated H-monogram intro loader

## Implemented (2026-07-20 — UI polish)
- ✅ AMC logos now render via `logo.dev` (real official brand logos, 256×256) with icon.horse + branded-initials fallback chain (shared `BrandLogo.jsx` component)
- ✅ Regulators show authentic official logos (AMFI triangles, SEBI wordmark, IRDAI, MahaRERA — user-provided asset override, NISM) via logo.dev + optional `logoOverride` field
- ✅ Navbar wordmark: "Hetal Finserv" (removed period)
- ✅ Navbar tabs: larger display type + animated black rounded-pill highlight for active route (framer-motion layoutId spring transition)

## Implemented (2026-07-20 — 15-Calculator Suite)
- ✅ Schema-driven calculator engine `CalcRunner.jsx` + math library `calcMath.js` + 15 configs in `calculators.js`
- ✅ Dedicated `/calculators` page with sidebar navigation grouped by Investment / Loan & Withdrawal / Goal Planning + mobile chip nav; each calc has its own URL (`/calculators/:slug`)
- ✅ 15 calculators (matching hetalfinserv.com): SIP · Lumpsum · Cost of Delay · SIP Top-Up · Limited Period SIP · Birthday SIP · Home-Loan SIP · EMI · SWP · Retirement · Child Education · Grand Wedding · Dream Car/Property · Dream Vacation · Life Insurance Need (HLV)
- ✅ Every calc: live gold sliders, editorial result card, "Send to advisor" CTA that pre-fills the lead form
- ✅ "Calculators" tab added to top nav; SIP+EMI teaser on Home links to full suite
- ✅ Navbar dark-hero aware (ivory text + gold active pill on `/calculators`)

## Implemented (2026-07-20 — Brand hygiene)
- ✅ Removed old LLP socials. New Pvt Ltd links:
  - Instagram: `https://www.instagram.com/hetalfinservpvtltd/`
  - Facebook: `https://www.facebook.com/hetalfinservpvtltd`
  - LinkedIn (Sandeep Dubal): `https://in.linkedin.com/in/sandeep-dubal-44a29547`
- ✅ LinkedIn added to Footer socials strip + "Connect on LinkedIn" CTA on Sandeep's leadership card
- ✅ Footer wordmark: "Hetal Finserv" (removed period)

## Implemented (2026-07-20 — Compliance footer + PDF + Email)
- ✅ Footer compliance block matches hetalfinserv.com: Risk Factors paragraph, ARN registration line, 8-link legal strip (Important Links, Disclaimer, Disclosure, Privacy Policy, SID/SAI/KIM, Code of Conduct, SEBI Circulars, AMFI Risk Factors) — all pointing to exact original URLs; Image credit line
- ✅ `/legal` internal page with Disclaimer, Disclosure, Privacy Policy, Risk Factors (available as fallback)
- ✅ PDF export on every calculator via `calcPDF.js` (jsPDF) — branded header, gold hero result, breakdown table, coral advisor CTA strip, compliance footnote
- ✅ Resend email notification (Emergent-managed) — every new lead fires an admin email to `LEAD_NOTIFY_TO` (info@hetalfinserv.com) with a fully branded HTML template; asyncio fire-and-forget so it never blocks the API

## Implemented (2026-07-20 — Blog / SEO knowledge center)
- ✅ `/blog` list route with featured post + 7-card grid, category filters (Investing / Insurance / Planning / Behaviour)
- ✅ `/blog/:slug` article route with editorial typography (h2 / quote / list / paragraph block renderer)
- ✅ 8 original articles inspired by the topics on hetalfinserv.com (SIP signals, health insurance psychology, colour bias, creator-economy planning, quotes, corrections, laziness pays, Gen Z investors)
- ✅ Each article has a dark obsidian "Bring these ideas to your money" CTA that routes to `/contact` with pre-filled service + article-context message
- ✅ "Blog" tab added to top nav; related posts strip at bottom of each article
- ✅ Fixed dead AMFI Risk Factors link → now points to current URL `https://www.amfiindia.com/investor/knowledge-center-info?zoneName=riskInMutualFunds` (verified 200)

## Implemented (2026-07-20 — AI Chatbot + Admin Dashboard + Content polish)
- ✅ Floating AI Chatbot (`ChatWidget.jsx`) on every page — Gemini 3 Flash via `EMERGENT_LLM_KEY` (emergentintegrations `LlmChat`)
- ✅ `POST /api/chat` (session-scoped, persists to `chat_history` collection) + `GET /api/chat/{session_id}` for history replay
- ✅ Domain-specific system prompt: mentions ARN-254254 / MahaRERA / IRDAI / Sandeep Dubal, pivots to lead capture after 3 turns
- ✅ Admin Dashboard at `/admin` — `POST /api/admin/login` returns token, `GET /api/admin/leads` + `PATCH /api/admin/leads/{id}` guarded by `X-Admin-Token` header
- ✅ Dashboard UI: search, service filter, sortable columns, CSV export, "Mark contacted" toggle (persisted), sign-out
- ✅ Admin password `Hetal@110818` stored in backend `.env` as `ADMIN_PASSWORD`; documented in `/app/memory/test_credentials.md`
- ✅ About page hero copy corrected — removed fictional "25 years / Bandra single-desk" narrative; new copy reflects real Pune-based Pvt Ltd with SEBI/AMFI/IRDAI/RERA registrations
- ✅ Contact page map iframe updated from Bandra Mumbai → Wadgaon Sheri, Pune 411014 (real HQ address per hetalfinserv.com)
- ✅ Backend test suite `/app/backend/tests/backend_test.py` — 17/17 pytest green (Leads/Contacts/Callbacks/Admin/Chat)

## Implemented (2026-07-20 — Hardening + Blog digest cron)
- ✅ **Admin session tokens**: `/api/admin/login` now returns a random 32-byte URL-safe token (43 chars), persisted in `admin_sessions` with 8h TTL. Old raw-password-as-token flow is 401. New `POST /api/admin/logout` server-side invalidates. Frontend sign-out calls it before clearing localStorage. Expired sessions are opportunistically pruned on every login.
- ✅ **ChatWidget resilience**: axios `timeout=20000ms` on `/api/chat`. On timeout/error, a bespoke fallback message renders with a "CONTINUE ON WHATSAPP →" CTA (data-testid `chat-whatsapp-fallback`) linking to `https://wa.me/918767095307`. Timeout and generic-error messages are now differentiated.
- ✅ **Weekly blog digest cron**: APScheduler `AsyncIOScheduler` fires every Monday 09:00 IST calling `send_blog_digest()` — picks newest post from `blog_data.py` (mirror of frontend blog.js), emails every unique lead-email via Emergent Email, records in `blog_digests_sent` (idempotent — same slug won't re-send unless `force=true`). If 0/N recipients succeeded upstream, we do NOT mark as sent so a retry is possible.
- ✅ Admin endpoints for the digest: `POST /api/admin/blog-digest/send` (body `{slug?, force?}`) + `GET /api/admin/blog-digest/history`.
- ✅ Env: added `ADMIN_SESSION_HOURS=8`, `PUBLIC_SITE_URL=<preview-url>` to `/app/backend/.env`. Added `APScheduler==3.11.3` to requirements.
- ✅ Backend test coverage grew 17 → 25 (TestAdminSession, TestBlogDigest); all green.

## Prioritized backlog (P1/P2)
- P2 Marathi language toggle (i18n)
- P2 Backend `/api/blog` collection so posts are DB-managed (currently mirrored in `blog_data.py`)
- P2 Shareable calculator URL params
- P2 (Hardening) Add Mongo TTL index on `admin_sessions.expires_at`; store as native datetime instead of ISO strings
- P2 Chatbot auto-lead capture (regex-detect phone/name in user message, silent POST to /api/leads with source="chatbot")
