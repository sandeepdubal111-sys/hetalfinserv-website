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

## Prioritized backlog (P1/P2)
- P2 Marathi language toggle (i18n)
- P2 Weekly-digest email to lead list when a new blog post ships
- P2 Backend `/api/blog` collection so posts are DB-managed
- P2 Shareable calculator URL params
- P2 (Hardening) Replace raw-password-as-token admin auth with random session token + TTL; move away from localStorage
- P2 (Chat) Use LlmChat native session memory instead of replaying history send_message loop; add axios timeout + WhatsApp fallback
