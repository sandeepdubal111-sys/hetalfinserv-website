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

## Prioritized backlog (P1/P2)
- P1 Admin dashboard to view leads
- P1 Email notification on new lead (Resend integration)
- P2 Blog / knowledge center for SEO
- P2 EMI / SIP calculator
- P2 AI chatbot for lead qualification
- P2 Multi-language support

## Next tasks
- Run automated tests (backend + frontend)
- Address any critical issues
- Optional enhancement post-testing
