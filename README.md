# PartStation.in — Your Parts Destination

India's marketplace for **genuine printer & IT spare parts** — toners, ink, printer heads, formatter boards, fusers, laptop & computer parts, networking and tools. Features bilingual (EN/HI) storefront, GST invoices, pincode-based shipping, COD checkout, bulk product import (CSV + import-from-URL), and a full admin panel.

> Stack: **React** (storefront + admin) · **FastAPI** · **MongoDB**

---

## ✨ Features

**Storefront (mobile-first, Flipkart/Amazon-style)**
- Home with hero, category circles, **Shop by Printer Model**, best-sellers & new-arrival rails, brand strip
- Catalog with search (by name / SKU / part number / **printer model**) + filters (category, subcategory, brand, price, sort)
- Detailed product pages: image gallery, specs table, compatible models, GST split, pincode delivery & COD check, offers, related products
- Cart, COD checkout with pincode shipping + GST summary, order success & tracking timeline, **GST tax invoice**
- Account (orders, addresses), wishlist, blog, policy pages, EN/HI toggle, WhatsApp support, mobile bottom nav

**Admin panel** (obscure path — see below)
- Dashboard with clickable stat cards (revenue, orders, products, customers, pending, **low stock**)
- Products: easy add/edit form (image **upload** + paste URL, brand dropdown, category→subcategory cascade, compatible models, **auto-generated SKU**, **min order qty**, **free-delivery qty**), search/filters, one-click **hide/show (eye)** toggle
- **Bulk Import**: CSV (WooCommerce-compatible) **and Import-from-URL** (fetch title/price/description/images from a product link)
- Categories, Brands, Orders (status + tracking + email), Customers, Pincode shipping rules, Blog manager, Business/GST/SEO/social settings

---

## 📁 Project Structure

```
/
├── backend/                # FastAPI app
│   ├── server.py           # API routes (all under /api)
│   ├── auth.py             # JWT auth, bcrypt, admin guard
│   ├── seed_data.py        # Versioned seed (categories, brands, products, blog, pincodes)
│   ├── storage.py          # Object storage helper (image uploads)
│   ├── scraper.py          # Import-from-URL extractor (JSON-LD/OpenGraph)
│   ├── email_service.py    # Resend email (mocked when disabled)
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React app (storefront + admin)
│   ├── src/
│   │   ├── pages/          # Storefront pages
│   │   ├── admin/          # Admin pages
│   │   ├── components/storefront/
│   │   ├── context/        # Auth, Cart, I18n
│   │   └── lib/            # api client, routes, helpers
│   ├── package.json
│   └── .env.example
└── docs/
    └── DEPLOYMENT_HOSTINGER.md
```

---

## 🔑 Environment Variables

Copy the examples and fill in values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**backend/.env**

| Key | Description |
|-----|-------------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `CORS_ORIGINS` | Allowed origins (comma-separated) or `*` |
| `JWT_SECRET` | Long random secret (`python -c "import secrets;print(secrets.token_hex(32))"`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin account (change before production) |
| `RESEND_API_KEY` / `EMAIL_ENABLED` / `EMAIL_FROM` | Transactional email (Resend). Keep `EMAIL_ENABLED=false` to mock |
| `PHONEPE_MERCHANT_ID` / `PHONEPE_SALT_KEY` | PhonePe (optional, COD works without) |
| `EMERGENT_LLM_KEY` / `APP_NAME` | Needed only for the image **upload** feature (object storage). Pasted image URLs work without it |

**frontend/.env**

| Key | Description |
|-----|-------------|
| `REACT_APP_BACKEND_URL` | Backend base URL (no trailing slash). App calls `${REACT_APP_BACKEND_URL}/api/...` |

---

## 🚀 Local Development

**Prerequisites:** Python 3.11+, Node 18+, Yarn, MongoDB running locally.

**1. Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit values
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
On first start it seeds categories, brands, ~40 products, blog, pincodes, and the admin account.

**2. Frontend**
```bash
cd frontend
yarn install
cp .env.example .env          # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start                    # http://localhost:3000
```

> Use **Yarn** (not npm).

---

## 🔐 Admin Access

- Admin login: **`/ops-control/admin/login`** (obscure path; `/admin` is intentionally not routed)
- Default credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`
- **Change these before going live.**

---

## 🧩 Key API Endpoints (all prefixed `/api`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` · `/api/auth/login` · GET `/api/auth/me` | Auth (JWT Bearer) |
| GET | `/api/products` · `/api/products/{slug}` | Catalog (filters, search) |
| GET | `/api/categories` · `/api/brands` · `/api/printer-models` · `/api/settings` | Reference data |
| POST | `/api/shipping/check` | Pincode shipping & COD check |
| POST/GET | `/api/orders` · `/api/orders/{id}` · `/api/orders/{id}/invoice` | Orders + GST invoice |
| * | `/api/admin/*` | Admin (require admin token): products, upload, import, orders, etc. |
| GET | `/api/files/{path}` | Public product image serving |

Interactive docs at `http://localhost:8001/docs`.

---

## 📦 Bulk Import

- **CSV**: Admin → Bulk Import → download template → upload (existing SKUs are updated).
- **Import from URL**: paste a product page link → fetches title/price/description/images → create as draft. Works best on shops exposing structured data (most WooCommerce/WordPress stores). Large marketplaces (Amazon/Flipkart) block automated fetching.

---

## 🛠️ Notes & Roadmap

Deferred until keys/config are provided:
- **PhonePe** online payments (COD works now)
- **Resend** live emails (mocked/logged by default)
- **Google + Mobile OTP** login (UI shows "coming soon")

Deployment guide: see [`docs/DEPLOYMENT_HOSTINGER.md`](docs/DEPLOYMENT_HOSTINGER.md).

---

## License
Proprietary — © PartStation.in. All rights reserved.
