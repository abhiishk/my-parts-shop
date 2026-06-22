# PartStation.in — Product Requirements & Build Log

## Original Problem Statement
Web-based e-commerce app to sell printers, printer spare parts, computer parts and IT parts across India.
Stack: React + FastAPI + MongoDB. Features: bulk product import (CSV/WooCommerce), GST invoices, pincode
shipping, PhonePe + COD, Google + mobile OTP login, bilingual (EN/HI), SEO-first, blog, WhatsApp support, admin.
Company: **PartStation.in** — tagline "Your Parts Destination". Domain target: partstation.in. Host: Hostinger VPS.

## User Decisions (from intake)
- First build = core storefront + admin + catalog/cart/checkout (COD), integrations mocked.
- No API keys yet (PhonePe, Resend, Twilio) — wire them in a later phase.
- Auth for V1: JWT email/password (Google + Mobile OTP deferred, shown as "coming soon").
- Design: agent-chosen clean modern industrial/tech look (industrial blue #0052FF + orange #FF6B00, Cabinet Grotesk + IBM Plex Sans).
- Build frontend-first, phase by phase.

## Architecture
- Backend: /app/backend/server.py (routes), auth.py (JWT Bearer + bcrypt + require_admin), seed_data.py, email_service.py (mock Resend).
- Frontend: React (CRA + craco). Storefront in src/pages + src/components/storefront; Admin in src/admin. Contexts: Auth, Cart (localStorage), I18n.
- Auth: JWT Bearer token in localStorage key `ps_token` (Authorization header). Admin guard on /api/admin/*.
- Mongo collections: users, products, categories, brands, orders, pincode_rules, blog_posts, settings, import_logs, email_logs.

## Implemented (2026-06-21) — Phase 1 MVP + Professional Redesign
### Phase 1 MVP
- Catalog, storefront, admin, GST invoices, pincode shipping, JWT auth, CSV import, blog, EN/HI.

### Redesign + UX upgrade (Flipkart/Amazon-inspired)
- New professional theme: brand blue #2B5CC6 + orange #F5821F, Outfit + Mukta fonts.
- Mobile-first: marketplace header (utility bar + orange search + category nav), mobile bottom tab nav, mobile drawer, sticky mobile Add-to-Cart/Buy-Now on PDP, responsive grids/rails.
- Home redesigned: hero, trust strip, category circles, **Shop by Printer Model** chips, Best Sellers + New Arrivals rails, brand strip, blog CTA.
- Product cards (rating badge, %off, MRP strikethrough), PDP with offers/highlights/specs/compatible-models.
- **Separate dark Admin portal at /admin/login** (fixes admin-login confusion); AdminLayout responsive with mobile drawer.
- Customer login page redesigned (split hero panel).
- Catalog expanded to **40 products** with real Indian printer brands & models (HP LaserJet 1020/M1005/M1136/P1108, Canon LBP2900/MF3010/iR2520, Epson L3110/L360/L380, Brother HL-L2321D, Samsung, Ricoh, Kyocera, Pantum, TVS, etc.); new /api/printer-models endpoint; versioned reseed.
- QA: backend 35/35; frontend 100% on tested flows (admin login, dashboard, 9 admin pages, search-by-printer-model, full purchase flow, PDP). Verified order-success redirect fix.

## Backlog (prioritized)
### P0 (needs user keys / later phase)
- PhonePe payment gateway (currently UI radio disabled; COD only).
- Resend live transactional emails (currently mocked, logged to email_logs).
- Google login (Emergent-managed) + Mobile OTP (Twilio/SMS) — UI shows "coming soon".

### P1
- SEO: XML sitemap, robots.txt, dynamic meta/OG tags, JSON-LD product/breadcrumb schema, GA4 event wiring.
- WooCommerce-specific CSV mapper preset + draft-import-before-publish workflow.
- Reviews & ratings (write + moderation), coupons/discounts.
- Saved-address selection at checkout (currently manual entry each time).
- Courier API module (tracking sync).

### P2
- Audit trail for admin actions, rate limiting, role granularity.
- Hostinger VPS deployment (Nginx, SSL, process manager), GitHub repo + docs.
- Split server.py into routers; migrate startup/shutdown to FastAPI lifespan.

## Next Action Items
1. When user provides keys: integrate PhonePe, Resend, Google/OTP login (via integration_expert).
2. Phase 5/6: WooCommerce import preset + SEO foundation (sitemap/schema/GA4).
3. Phase 8: Hostinger deployment + GitHub handover docs.

## Credentials
- Admin: admin@partstation.com / Admin@12345 (see /app/memory/test_credentials.md).
