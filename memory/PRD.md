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

## Prioritized backlog (P1/P2)
- P1 Admin dashboard to view/manage leads
- P2 Email notification on new lead (Resend integration)
- P2 Blog / knowledge center for SEO
- P2 AI chatbot for lead qualification
- P2 Multi-language support (English + Marathi)

## Next tasks
- P1 Admin dashboard for leads
