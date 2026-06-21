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

## Implemented (2026-06-21) — Phase 1 MVP
- Catalog: categories (8) + subcategories, brands (8), 25 seeded products with specs/compatible models/GST/stock.
- Storefront: Home (hero, category bento, best-selling, brands, new arrivals, shop-by-model), Shop (filters: category/subcategory/brand/max-price/sort/search + pagination), Product detail (gallery, specs table, SKU/part no, GST split, pincode checker, compatible models, related), Cart, Checkout (address + pincode shipping + GST summary + COD), Order success, Account (orders + addresses), Order detail with tracking timeline + GST tax-invoice modal, Wishlist, Blog list/detail, static pages (about/contact/faq/policies), EN/HI toggle, WhatsApp float.
- Admin: Dashboard (stats), Products CRUD + modal form, Bulk CSV import (template download, mapping, report, history), Categories, Brands, Orders (status update + tracking + email trigger), Customers, Pincode shipping rules, Blog manager, Business/GST/shipping/social/GA4 settings.
- GST invoices: per-line taxable value + GST breakdown via /api/orders/{id}/invoice.
- Branding: user-provided PartStation.in logo + tagline across header/footer/admin/login.
- QA: backend 35/35 pytest passed; frontend flows verified; fixed checkout->order-success redirect race.

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
