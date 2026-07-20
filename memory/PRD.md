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

## Implemented (2026-07-20 — SIP/EMI Calculator)
- ✅ New `Calculator.jsx` section — dual-mode (SIP / EMI) with segmented pill toggle
- ✅ Editorial dark-mode layout with gold accents, custom range sliders (`hf-range`)
- ✅ Real-time calculations: SIP future value, invested, gains · EMI monthly, interest, total
- ✅ INR formatting with Cr/L suffixes
- ✅ CTA "Send this to an advisor" → routes to `/contact` and **pre-fills lead form** service + message via React Router `state`
- ✅ Placed on both HomePage (before Leadership) and ServicesPage (after AMC marquee)
- ✅ `ContactForm` reads `location.state` on mount to pre-populate fields

## Prioritized backlog (P1/P2)
- P1 Admin dashboard to view/manage leads
- P2 Email notification on new lead (Resend integration)
- P2 Blog / knowledge center for SEO
- P2 AI chatbot for lead qualification
- P2 Multi-language support (English + Marathi)

## Next tasks
- P1 Admin dashboard for leads
