from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import io
import csv
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Query, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

import auth as A
from email_service import send_email, order_placed_html
from seed_data import seed_all, slugify, now_iso

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="PartStation API")
api = APIRouter(prefix="/api")

get_current_user = A.make_get_current_user(db)
require_admin = A.make_require_admin(get_current_user)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("partstation")

NO_ID = {"_id": 0}


# ---------------- Schemas ----------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AddressIn(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str


class CartItemIn(BaseModel):
    product_id: str
    qty: int = 1


class OrderIn(BaseModel):
    items: List[CartItemIn]
    address: AddressIn
    payment_method: str = "cod"


class ShippingCheckIn(BaseModel):
    pincode: str
    cart_total: float = 0


# ---------------- Auth ----------------
@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = A.new_id()
    doc = {
        "id": uid, "name": body.name, "email": email, "phone": body.phone or "",
        "password_hash": A.hash_password(body.password), "role": "customer",
        "addresses": [], "wishlist": [], "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = A.create_access_token(uid, email, "customer")
    return {"token": token, "user": {"id": uid, "name": body.name, "email": email, "role": "customer", "phone": doc["phone"]}}


@api.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not A.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = A.create_access_token(user["id"], email, user["role"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": email, "role": user["role"], "phone": user.get("phone", "")}}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Catalog ----------------
@api.get("/categories")
async def list_categories():
    return await db.categories.find({}, NO_ID).sort("order", 1).to_list(100)


@api.get("/categories/{slug}")
async def get_category(slug: str):
    cat = await db.categories.find_one({"slug": slug}, NO_ID)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@api.get("/brands")
async def list_brands():
    return await db.brands.find({}, NO_ID).sort("name", 1).to_list(200)


@api.get("/products")
async def list_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    brand: Optional[str] = None,
    model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    sort: str = "relevance",
    page: int = 1,
    limit: int = 12,
):
    query: dict = {"publish_status": "published"}
    if category:
        query["category_slug"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if brand:
        query["brand_slug"] = brand
    if model:
        query["compatible_models"] = {"$regex": model, "$options": "i"}
    if featured is not None:
        query["featured"] = featured
    if new_arrival is not None:
        query["new_arrival"] = new_arrival
    if min_price is not None or max_price is not None:
        pr: dict = {}
        if min_price is not None:
            pr["$gte"] = min_price
        if max_price is not None:
            pr["$lte"] = max_price
        query["selling_price"] = pr
    if q:
        query["$or"] = [
            {"name_en": {"$regex": q, "$options": "i"}},
            {"name_hi": {"$regex": q, "$options": "i"}},
            {"sku": {"$regex": q, "$options": "i"}},
            {"part_number": {"$regex": q, "$options": "i"}},
            {"compatible_models": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]

    sort_map = {
        "price_asc": ("selling_price", 1),
        "price_desc": ("selling_price", -1),
        "newest": ("created_at", -1),
        "rating": ("rating", -1),
        "relevance": ("featured", -1),
    }
    sort_field, sort_dir = sort_map.get(sort, ("featured", -1))

    total = await db.products.count_documents(query)
    skip = (page - 1) * limit
    items = await db.products.find(query, NO_ID).sort(sort_field, sort_dir).skip(skip).limit(limit).to_list(limit)
    return {"items": items, "total": total, "page": page, "limit": limit, "pages": (total + limit - 1) // limit}


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, NO_ID)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    related = await db.products.find(
        {"category_slug": p["category_slug"], "slug": {"$ne": slug}, "publish_status": "published"}, NO_ID
    ).limit(4).to_list(4)
    p["related"] = related
    return p


# ---------------- Shipping ----------------
async def _compute_shipping(pincode: str, cart_total: float):
    settings = await db.settings.find_one({"id": "global"}, NO_ID) or {}
    rule = await db.pincode_rules.find_one({"pincode": pincode}, NO_ID)
    if not rule:
        # try 3-digit prefix
        rule = await db.pincode_rules.find_one({"pincode": {"$regex": f"^{pincode[:3]}"}}, NO_ID)
    if rule:
        zone = rule["zone"]
        charge = rule["shipping_charge"]
        cod = rule["cod_available"]
        free_above = rule.get("free_above", settings.get("free_shipping_above", 2499))
        serviceable = True
    else:
        zone = "Standard Zone"
        charge = settings.get("default_shipping_charge", 99)
        cod = settings.get("default_cod_available", True)
        free_above = settings.get("free_shipping_above", 2499)
        serviceable = True
    if cart_total and cart_total >= free_above:
        charge = 0
    return {"serviceable": serviceable, "zone": zone, "shipping_charge": charge,
            "cod_available": cod, "free_above": free_above}


@api.post("/shipping/check")
async def shipping_check(body: ShippingCheckIn):
    if not body.pincode.isdigit() or len(body.pincode) != 6:
        raise HTTPException(status_code=400, detail="Enter a valid 6-digit pincode")
    return await _compute_shipping(body.pincode, body.cart_total)


# ---------------- Orders ----------------
def _gst_breakdown(items):
    subtotal = 0.0
    tax_total = 0.0
    for it in items:
        line = it["selling_price"] * it["qty"]
        base = round(line / (1 + it["gst_rate"] / 100), 2)
        tax = round(line - base, 2)
        subtotal += base
        tax_total += tax
    return round(subtotal, 2), round(tax_total, 2)


async def _next_order_number():
    count = await db.orders.count_documents({})
    return f"PS{datetime.now(timezone.utc).strftime('%y%m')}{1001 + count}"


@api.post("/orders")
async def create_order(body: OrderIn, user: dict = Depends(get_current_user)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    items = []
    for ci in body.items:
        p = await db.products.find_one({"id": ci.product_id}, NO_ID)
        if not p:
            raise HTTPException(status_code=400, detail=f"Product not found: {ci.product_id}")
        items.append({
            "product_id": p["id"], "sku": p["sku"], "name_en": p["name_en"], "name_hi": p["name_hi"],
            "slug": p["slug"], "image": (p["images"][0] if p.get("images") else ""),
            "selling_price": p["selling_price"], "gst_rate": p["gst_rate"], "qty": ci.qty,
        })
    ship = await _compute_shipping(body.address.pincode, sum(i["selling_price"] * i["qty"] for i in items))
    if body.payment_method == "cod" and not ship["cod_available"]:
        raise HTTPException(status_code=400, detail="COD not available for this pincode")
    subtotal, tax_total = _gst_breakdown(items)
    grand = round(subtotal + tax_total + ship["shipping_charge"], 2)
    order = {
        "id": A.new_id(),
        "order_number": await _next_order_number(),
        "user_id": user["id"], "user_email": user["email"], "user_name": user["name"],
        "items": items, "address": body.address.model_dump(),
        "subtotal": subtotal, "tax_total": tax_total, "shipping_charge": ship["shipping_charge"],
        "total": grand, "payment_method": body.payment_method,
        "payment_status": "pending" if body.payment_method == "cod" else "pending",
        "status": "placed", "zone": ship["zone"], "tracking_number": "",
        "created_at": now_iso(),
        "timeline": [{"status": "placed", "at": now_iso()}],
    }
    await db.orders.insert_one({**order})
    await send_email(user["email"], f"Order Confirmed {order['order_number']}", order_placed_html(order), db)
    return {k: v for k, v in order.items() if k != "_id"}


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    return await db.orders.find({"user_id": user["id"]}, NO_ID).sort("created_at", -1).to_list(200)


@api.get("/orders/{order_id}")
async def order_detail(order_id: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, NO_ID)
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o


@api.get("/orders/{order_id}/invoice")
async def order_invoice(order_id: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, NO_ID)
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    settings = await db.settings.find_one({"id": "global"}, NO_ID) or {}
    lines = []
    for it in o["items"]:
        line = it["selling_price"] * it["qty"]
        base = round(line / (1 + it["gst_rate"] / 100), 2)
        tax = round(line - base, 2)
        lines.append({**it, "taxable_value": base, "gst_amount": tax, "line_total": round(line, 2)})
    return {"order": o, "lines": lines, "seller": {
        "name": settings.get("store_name", "PartStation"),
        "gstin": settings.get("gstin", ""), "address": settings.get("address", ""),
    }}


# ---------------- Wishlist ----------------
@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, NO_ID)
    ids = u.get("wishlist", [])
    if not ids:
        return []
    return await db.products.find({"id": {"$in": ids}}, NO_ID).to_list(100)


@api.post("/wishlist/{product_id}")
async def toggle_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]})
    wl = u.get("wishlist", [])
    if product_id in wl:
        wl.remove(product_id)
        active = False
    else:
        wl.append(product_id)
        active = True
    await db.users.update_one({"id": user["id"]}, {"$set": {"wishlist": wl}})
    return {"active": active, "wishlist": wl}


# ---------------- Addresses ----------------
@api.get("/addresses")
async def get_addresses(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, NO_ID)
    return u.get("addresses", [])


@api.post("/addresses")
async def add_address(body: AddressIn, user: dict = Depends(get_current_user)):
    addr = {"id": A.new_id(), **body.model_dump()}
    await db.users.update_one({"id": user["id"]}, {"$push": {"addresses": addr}})
    return addr


# ---------------- Blog & Settings ----------------
@api.get("/blog")
async def list_blog():
    return await db.blog_posts.find({"published": True}, NO_ID).sort("created_at", -1).to_list(100)


@api.get("/blog/{slug}")
async def get_blog(slug: str):
    b = await db.blog_posts.find_one({"slug": slug}, NO_ID)
    if not b:
        raise HTTPException(status_code=404, detail="Post not found")
    return b


@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"id": "global"}, NO_ID)
    return s or {}


# ---------------- ADMIN ----------------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({}, NO_ID).to_list(10000)
    revenue = sum(o["total"] for o in orders if o.get("payment_status") != "failed")
    pending = len([o for o in orders if o["status"] in ("placed", "confirmed")])
    low_stock = await db.products.count_documents({"stock_status": "low_stock"})
    return {
        "products": await db.products.count_documents({}),
        "orders": len(orders),
        "customers": await db.users.count_documents({"role": "customer"}),
        "revenue": round(revenue, 2),
        "pending_orders": pending,
        "low_stock": low_stock,
        "recent_orders": sorted(orders, key=lambda x: x["created_at"], reverse=True)[:8],
    }


@api.get("/admin/products")
async def admin_products(admin: dict = Depends(require_admin), q: Optional[str] = None, page: int = 1, limit: int = 20):
    query = {}
    if q:
        query = {"$or": [{"name_en": {"$regex": q, "$options": "i"}}, {"sku": {"$regex": q, "$options": "i"}}]}
    total = await db.products.count_documents(query)
    items = await db.products.find(query, NO_ID).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return {"items": items, "total": total, "page": page, "pages": (total + limit - 1) // limit}


def _product_defaults(data: dict):
    name = data.get("name_en", "Product")
    base_slug = data.get("slug") or slugify(name)
    return {
        "id": data.get("id") or A.new_id(),
        "sku": data.get("sku", ""),
        "part_number": data.get("part_number", ""),
        "name_en": name, "name_hi": data.get("name_hi", ""),
        "slug": base_slug,
        "short_description": data.get("short_description", ""),
        "long_description": data.get("long_description", ""),
        "brand": data.get("brand", "Generic"), "brand_slug": slugify(data.get("brand", "generic")),
        "category": data.get("category", ""), "category_slug": data.get("category_slug") or slugify(data.get("category", "")),
        "subcategory": data.get("subcategory", ""),
        "compatible_models": data.get("compatible_models", []),
        "technical_specs": data.get("technical_specs", {}),
        "images": data.get("images", []),
        "mrp": float(data.get("mrp", 0) or 0), "selling_price": float(data.get("selling_price", 0) or 0),
        "gst_rate": float(data.get("gst_rate", 18) or 18),
        "stock_qty": int(data.get("stock_qty", 0) or 0),
        "stock_status": "in_stock" if int(data.get("stock_qty", 0) or 0) > 5 else ("low_stock" if int(data.get("stock_qty", 0) or 0) > 0 else "out_of_stock"),
        "weight": float(data.get("weight", 0.5) or 0.5),
        "cod_allowed": bool(data.get("cod_allowed", True)),
        "pincode_shipping_group": data.get("pincode_shipping_group", "default"),
        "tags": data.get("tags", []),
        "seo_title": data.get("seo_title", name),
        "seo_description": data.get("seo_description", ""),
        "publish_status": data.get("publish_status", "published"),
        "featured": bool(data.get("featured", False)),
        "new_arrival": bool(data.get("new_arrival", False)),
        "return_eligible": bool(data.get("return_eligible", True)),
        "warranty": data.get("warranty", ""),
        "rating": float(data.get("rating", 4.0) or 4.0), "review_count": int(data.get("review_count", 0) or 0),
        "created_at": data.get("created_at") or now_iso(),
    }


@api.post("/admin/products")
async def create_product(data: dict, admin: dict = Depends(require_admin)):
    doc = _product_defaults(data)
    if await db.products.find_one({"slug": doc["slug"]}):
        doc["slug"] = f"{doc['slug']}-{doc['id'][:6]}"
    await db.products.insert_one({**doc})
    return doc


@api.put("/admin/products/{product_id}")
async def update_product(product_id: str, data: dict, admin: dict = Depends(require_admin)):
    existing = await db.products.find_one({"id": product_id}, NO_ID)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    merged = {**existing, **data, "id": product_id}
    doc = _product_defaults(merged)
    await db.products.update_one({"id": product_id}, {"$set": doc})
    return doc


@api.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    await db.products.delete_one({"id": product_id})
    return {"deleted": True}


CSV_COLUMNS = ["sku", "part_number", "name_en", "name_hi", "short_description", "long_description",
               "brand", "category", "subcategory", "compatible_models", "technical_specs", "image_urls",
               "mrp", "selling_price", "gst_rate", "stock_qty", "weight", "cod_allowed",
               "pincode_shipping_group", "tags", "seo_title", "seo_description", "publish_status"]


@api.get("/admin/products/import-template")
async def import_template(admin: dict = Depends(require_admin)):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(CSV_COLUMNS)
    w.writerow(["PS-2001", "PN-XYZ-1", "Sample Printer Roller", "सैंपल रोलर", "Short desc", "Long desc",
                "HP", "Printer Parts", "Pickup Roller", "HP M404|HP M428", "Material:Rubber;Warranty:6 Months",
                "https://example.com/img1.jpg|https://example.com/img2.jpg", "650", "399", "18", "25", "0.4",
                "true", "default", "roller|hp", "Buy Roller", "Roller for HP", "published"])
    return Response(content=buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=partstation_import_template.csv"})


def _parse_specs(text: str):
    specs = {}
    if not text:
        return specs
    for pair in text.replace("\n", ";").split(";"):
        if ":" in pair:
            k, v = pair.split(":", 1)
            specs[k.strip()] = v.strip()
    return specs


@api.post("/admin/products/import-csv")
async def import_csv(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    content = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    created, updated, errors = 0, 0, []
    batch_id = A.new_id()
    for idx, row in enumerate(reader, start=2):
        try:
            if not (row.get("name_en") or "").strip():
                errors.append({"row": idx, "error": "Missing name_en"})
                continue
            if not (row.get("selling_price") or "").strip():
                errors.append({"row": idx, "error": "Missing selling_price"})
                continue
            data = {
                "sku": (row.get("sku") or "").strip(),
                "part_number": (row.get("part_number") or "").strip(),
                "name_en": row["name_en"].strip(), "name_hi": (row.get("name_hi") or "").strip(),
                "short_description": (row.get("short_description") or "").strip(),
                "long_description": (row.get("long_description") or "").strip(),
                "brand": (row.get("brand") or "Generic").strip(),
                "category": (row.get("category") or "").strip(),
                "subcategory": (row.get("subcategory") or "").strip(),
                "compatible_models": [m.strip() for m in (row.get("compatible_models") or "").replace(",", "|").split("|") if m.strip()],
                "technical_specs": _parse_specs(row.get("technical_specs") or ""),
                "images": [u.strip() for u in (row.get("image_urls") or "").replace(",", "|").split("|") if u.strip()],
                "mrp": row.get("mrp") or 0, "selling_price": row.get("selling_price") or 0,
                "gst_rate": row.get("gst_rate") or 18, "stock_qty": row.get("stock_qty") or 0,
                "weight": row.get("weight") or 0.5,
                "cod_allowed": str(row.get("cod_allowed", "true")).lower() in ("true", "1", "yes"),
                "pincode_shipping_group": (row.get("pincode_shipping_group") or "default").strip(),
                "tags": [t.strip() for t in (row.get("tags") or "").replace(",", "|").split("|") if t.strip()],
                "seo_title": (row.get("seo_title") or "").strip(),
                "seo_description": (row.get("seo_description") or "").strip(),
                "publish_status": (row.get("publish_status") or "published").strip(),
                "import_batch_id": batch_id,
            }
            doc = _product_defaults(data)
            existing = await db.products.find_one({"sku": doc["sku"]}) if doc["sku"] else None
            if existing:
                await db.products.update_one({"id": existing["id"]}, {"$set": {**doc, "id": existing["id"], "slug": existing["slug"]}})
                updated += 1
            else:
                if await db.products.find_one({"slug": doc["slug"]}):
                    doc["slug"] = f"{doc['slug']}-{doc['id'][:6]}"
                await db.products.insert_one({**doc})
                created += 1
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})
    report = {"batch_id": batch_id, "created": created, "updated": updated,
              "failed": len(errors), "errors": errors[:50], "at": now_iso()}
    await db.import_logs.insert_one({"id": A.new_id(), **report})
    return report


@api.get("/admin/import-logs")
async def import_logs(admin: dict = Depends(require_admin)):
    return await db.import_logs.find({}, NO_ID).sort("at", -1).to_list(50)


# Categories admin
@api.post("/admin/categories")
async def create_category(data: dict, admin: dict = Depends(require_admin)):
    doc = {"id": A.new_id(), "slug": data.get("slug") or slugify(data["name_en"]),
           "name_en": data["name_en"], "name_hi": data.get("name_hi", ""),
           "image": data.get("image", ""), "subcategories": data.get("subcategories", []),
           "order": data.get("order", 99), "created_at": now_iso()}
    await db.categories.insert_one({**doc})
    return doc


@api.put("/admin/categories/{cid}")
async def update_category(cid: str, data: dict, admin: dict = Depends(require_admin)):
    data.pop("_id", None); data.pop("id", None)
    await db.categories.update_one({"id": cid}, {"$set": data})
    return await db.categories.find_one({"id": cid}, NO_ID)


@api.delete("/admin/categories/{cid}")
async def delete_category(cid: str, admin: dict = Depends(require_admin)):
    await db.categories.delete_one({"id": cid})
    return {"deleted": True}


# Brands admin
@api.post("/admin/brands")
async def create_brand(data: dict, admin: dict = Depends(require_admin)):
    doc = {"id": A.new_id(), "slug": data.get("slug") or slugify(data["name"]), "name": data["name"], "created_at": now_iso()}
    await db.brands.insert_one({**doc})
    return doc


@api.delete("/admin/brands/{bid}")
async def delete_brand(bid: str, admin: dict = Depends(require_admin)):
    await db.brands.delete_one({"id": bid})
    return {"deleted": True}


# Orders admin
@api.get("/admin/orders")
async def admin_orders(admin: dict = Depends(require_admin), status: Optional[str] = None):
    query = {"status": status} if status else {}
    return await db.orders.find(query, NO_ID).sort("created_at", -1).to_list(500)


@api.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, data: dict, admin: dict = Depends(require_admin)):
    o = await db.orders.find_one({"id": order_id}, NO_ID)
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = data.get("status")
    update = {"status": new_status}
    if "tracking_number" in data:
        update["tracking_number"] = data["tracking_number"]
    if "payment_status" in data:
        update["payment_status"] = data["payment_status"]
    timeline = o.get("timeline", [])
    timeline.append({"status": new_status, "at": now_iso()})
    update["timeline"] = timeline
    await db.orders.update_one({"id": order_id}, {"$set": update})
    subj_map = {"confirmed": "Order Confirmed", "shipped": "Order Shipped",
                "delivered": "Order Delivered", "cancelled": "Order Cancelled"}
    if new_status in subj_map:
        await send_email(o["user_email"], f"{subj_map[new_status]} {o['order_number']}",
                         f"<p>Your order {o['order_number']} is now <b>{new_status}</b>.</p>", db)
    return await db.orders.find_one({"id": order_id}, NO_ID)


@api.get("/admin/customers")
async def admin_customers(admin: dict = Depends(require_admin)):
    users = await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    for u in users:
        u["order_count"] = await db.orders.count_documents({"user_id": u["id"]})
    return users


# Pincodes admin
@api.get("/admin/pincodes")
async def admin_pincodes(admin: dict = Depends(require_admin)):
    return await db.pincode_rules.find({}, NO_ID).sort("pincode", 1).to_list(1000)


@api.post("/admin/pincodes")
async def create_pincode(data: dict, admin: dict = Depends(require_admin)):
    doc = {"id": A.new_id(), "pincode": data["pincode"], "zone": data.get("zone", ""),
           "shipping_charge": float(data.get("shipping_charge", 0)), "cod_available": bool(data.get("cod_available", True)),
           "free_above": float(data.get("free_above", 2499)), "created_at": now_iso()}
    await db.pincode_rules.insert_one({**doc})
    return doc


@api.put("/admin/pincodes/{pid}")
async def update_pincode(pid: str, data: dict, admin: dict = Depends(require_admin)):
    data.pop("_id", None); data.pop("id", None)
    await db.pincode_rules.update_one({"id": pid}, {"$set": data})
    return await db.pincode_rules.find_one({"id": pid}, NO_ID)


@api.delete("/admin/pincodes/{pid}")
async def delete_pincode(pid: str, admin: dict = Depends(require_admin)):
    await db.pincode_rules.delete_one({"id": pid})
    return {"deleted": True}


# Blog admin
@api.get("/admin/blog")
async def admin_blog(admin: dict = Depends(require_admin)):
    return await db.blog_posts.find({}, NO_ID).sort("created_at", -1).to_list(200)


@api.post("/admin/blog")
async def create_blog(data: dict, admin: dict = Depends(require_admin)):
    doc = {"id": A.new_id(), "title": data["title"], "slug": data.get("slug") or slugify(data["title"]),
           "excerpt": data.get("excerpt", ""), "category": data.get("category", "general"),
           "content": data.get("content", ""), "cover_image": data.get("cover_image", ""),
           "author": data.get("author", "PartStation Team"), "published": bool(data.get("published", True)),
           "created_at": now_iso()}
    await db.blog_posts.insert_one({**doc})
    return doc


@api.put("/admin/blog/{bid}")
async def update_blog(bid: str, data: dict, admin: dict = Depends(require_admin)):
    data.pop("_id", None); data.pop("id", None)
    await db.blog_posts.update_one({"id": bid}, {"$set": data})
    return await db.blog_posts.find_one({"id": bid}, NO_ID)


@api.delete("/admin/blog/{bid}")
async def delete_blog(bid: str, admin: dict = Depends(require_admin)):
    await db.blog_posts.delete_one({"id": bid})
    return {"deleted": True}


# Settings admin
@api.put("/admin/settings")
async def update_settings(data: dict, admin: dict = Depends(require_admin)):
    data.pop("_id", None)
    data["id"] = "global"
    await db.settings.update_one({"id": "global"}, {"$set": data}, upsert=True)
    return await db.settings.find_one({"id": "global"}, NO_ID)


@api.get("/admin/email-logs")
async def email_logs(admin: dict = Depends(require_admin)):
    return await db.email_logs.find({}, NO_ID).sort("created_at", -1).to_list(100)


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": A.new_id(), "name": "Admin", "email": admin_email,
            "password_hash": A.hash_password(admin_password), "role": "admin",
            "addresses": [], "wishlist": [], "created_at": now_iso(),
        })
    elif not A.verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": A.hash_password(admin_password)}})


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("category_slug")
    await _seed_admin()
    await seed_all(db)
    logger.info("PartStation startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()
