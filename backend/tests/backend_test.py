"""
PartStation.in backend API regression tests.
Covers: catalog, shipping, auth (admin+customer), orders+invoice, admin CRUD, CSV import, RBAC.
"""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://parts-shop-5.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@partstation.com"
ADMIN_PASSWORD = "Admin@12345"


# --------- Fixtures ---------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def customer(session):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(f"{API}/auth/register", json={
        "name": "Test Customer", "email": email, "password": "Test@12345", "phone": "9999999999"
    })
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "token": data["token"], "user": data["user"]}


def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --------- Catalog ---------
class TestCatalog:
    def test_categories(self, session):
        r = session.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "slug" in data[0] and "name_en" in data[0]

    def test_brands(self, session):
        r = session.get(f"{API}/brands")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0

    def test_settings(self, session):
        r = session.get(f"{API}/settings")
        assert r.status_code == 200
        s = r.json()
        assert s.get("id") == "global"
        assert "gstin" in s

    def test_blog_list(self, session):
        r = session.get(f"{API}/blog")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_blog_detail(self, session):
        posts = session.get(f"{API}/blog").json()
        if not posts:
            pytest.skip("No blog posts seeded")
        slug = posts[0]["slug"]
        r = session.get(f"{API}/blog/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_products_list_with_pagination(self, session):
        r = session.get(f"{API}/products", params={"page": 1, "limit": 5})
        assert r.status_code == 200
        d = r.json()
        assert "items" in d and "total" in d and "pages" in d
        assert d["limit"] == 5
        assert isinstance(d["items"], list)
        assert d["total"] > 0

    def test_products_filter_category(self, session):
        cats = session.get(f"{API}/categories").json()
        slug = cats[0]["slug"]
        r = session.get(f"{API}/products", params={"category": slug, "limit": 50})
        assert r.status_code == 200
        items = r.json()["items"]
        for it in items:
            assert it["category_slug"] == slug

    def test_products_search_q(self, session):
        r = session.get(f"{API}/products", params={"q": "printer"})
        assert r.status_code == 200
        # search may return zero — only verify shape
        assert "items" in r.json()

    def test_products_sort_price_asc(self, session):
        r = session.get(f"{API}/products", params={"sort": "price_asc", "limit": 10})
        assert r.status_code == 200
        prices = [i["selling_price"] for i in r.json()["items"]]
        assert prices == sorted(prices)

    def test_product_detail_with_related(self, session):
        items = session.get(f"{API}/products", params={"limit": 1}).json()["items"]
        assert items, "no seeded products"
        slug = items[0]["slug"]
        r = session.get(f"{API}/products/{slug}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert "related" in d and isinstance(d["related"], list)

    def test_product_not_found(self, session):
        r = session.get(f"{API}/products/does-not-exist-xyz")
        assert r.status_code == 404


# --------- Shipping ---------
class TestShipping:
    def test_valid_pincode(self, session):
        r = session.post(f"{API}/shipping/check", json={"pincode": "110001", "cart_total": 0})
        assert r.status_code == 200
        d = r.json()
        assert d["serviceable"] is True
        assert "zone" in d and "shipping_charge" in d and "cod_available" in d

    def test_invalid_pincode_format(self, session):
        r = session.post(f"{API}/shipping/check", json={"pincode": "abc", "cart_total": 0})
        assert r.status_code == 400

    def test_invalid_pincode_short(self, session):
        r = session.post(f"{API}/shipping/check", json={"pincode": "1100", "cart_total": 0})
        assert r.status_code == 400

    def test_free_shipping_threshold(self, session):
        r = session.post(f"{API}/shipping/check", json={"pincode": "110001", "cart_total": 99999})
        assert r.status_code == 200
        assert r.json()["shipping_charge"] == 0


# --------- Auth ---------
class TestAuth:
    def test_admin_login(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["token"]

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, session, customer):
        r = session.get(f"{API}/auth/me", headers=auth_headers(customer["token"]))
        assert r.status_code == 200
        assert r.json()["email"] == customer["email"]
        assert r.json()["role"] == "customer"

    def test_me_without_token(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_duplicate_register(self, session, customer):
        r = session.post(f"{API}/auth/register", json={
            "name": "Dup", "email": customer["email"], "password": "Test@12345"
        })
        assert r.status_code == 400


# --------- Orders ---------
@pytest.fixture(scope="session")
def sample_product(session):
    items = session.get(f"{API}/products", params={"limit": 1}).json()["items"]
    assert items, "no seeded products"
    return items[0]


class TestOrders:
    def test_create_order_cod(self, session, customer, sample_product):
        body = {
            "items": [{"product_id": sample_product["id"], "qty": 2}],
            "address": {
                "full_name": "Test User", "phone": "9999999999",
                "line1": "1 Test St", "line2": "", "city": "Delhi",
                "state": "DL", "pincode": "110001"
            },
            "payment_method": "cod"
        }
        r = requests.post(f"{API}/orders", json=body, headers=auth_headers(customer["token"]))
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["order_number"].startswith("PS")
        assert o["payment_method"] == "cod"
        assert o["status"] == "placed"
        assert o["subtotal"] > 0 and o["tax_total"] > 0
        # totals = subtotal + tax + shipping
        expected = round(o["subtotal"] + o["tax_total"] + o["shipping_charge"], 2)
        assert abs(o["total"] - expected) < 0.05
        customer["order_id"] = o["id"]
        customer["order_number"] = o["order_number"]

    def test_list_my_orders(self, session, customer):
        r = requests.get(f"{API}/orders", headers=auth_headers(customer["token"]))
        assert r.status_code == 200
        orders = r.json()
        assert any(o["id"] == customer["order_id"] for o in orders)

    def test_order_detail(self, session, customer):
        r = requests.get(f"{API}/orders/{customer['order_id']}", headers=auth_headers(customer["token"]))
        assert r.status_code == 200
        assert r.json()["id"] == customer["order_id"]

    def test_order_invoice_gst_breakdown(self, session, customer):
        r = requests.get(f"{API}/orders/{customer['order_id']}/invoice", headers=auth_headers(customer["token"]))
        assert r.status_code == 200
        d = r.json()
        assert "order" in d and "lines" in d and "seller" in d
        assert len(d["lines"]) > 0
        line = d["lines"][0]
        assert "taxable_value" in line and "gst_amount" in line and "line_total" in line

    def test_order_requires_auth(self, session, sample_product):
        body = {
            "items": [{"product_id": sample_product["id"], "qty": 1}],
            "address": {"full_name": "X", "phone": "9", "line1": "1", "city": "D", "state": "DL", "pincode": "110001"},
            "payment_method": "cod"
        }
        r = requests.post(f"{API}/orders", json=body)
        assert r.status_code in (401, 403)


# --------- Admin ---------
class TestAdmin:
    def test_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers(admin_token))
        assert r.status_code == 200
        s = r.json()
        for k in ("products", "orders", "customers", "revenue", "pending_orders"):
            assert k in s

    def test_admin_products_list(self, admin_token):
        r = requests.get(f"{API}/admin/products", headers=auth_headers(admin_token))
        assert r.status_code == 200
        assert "items" in r.json()

    def test_admin_product_crud(self, admin_token):
        # CREATE
        payload = {
            "name_en": "TEST_QA_Product", "sku": f"TESTSKU-{uuid.uuid4().hex[:6]}",
            "brand": "HP", "category": "Printer Parts", "category_slug": "printer-parts",
            "mrp": 1000, "selling_price": 800, "gst_rate": 18, "stock_qty": 10
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=auth_headers(admin_token))
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        slug = r.json()["slug"]
        assert r.json()["name_en"] == "TEST_QA_Product"

        # GET verify
        g = requests.get(f"{API}/products/{slug}")
        assert g.status_code == 200
        assert g.json()["selling_price"] == 800

        # UPDATE
        u = requests.put(f"{API}/admin/products/{pid}", json={"selling_price": 750},
                         headers=auth_headers(admin_token))
        assert u.status_code == 200
        assert u.json()["selling_price"] == 750

        # DELETE
        d = requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers(admin_token))
        assert d.status_code == 200

        # verify deletion
        g2 = requests.get(f"{API}/products/{slug}")
        assert g2.status_code == 404

    def test_csv_template_download(self, admin_token):
        r = requests.get(f"{API}/admin/products/import-template", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert "sku" in r.text and "selling_price" in r.text

    def test_csv_import(self, admin_token):
        csv_text = (
            "sku,part_number,name_en,name_hi,short_description,long_description,brand,category,subcategory,"
            "compatible_models,technical_specs,image_urls,mrp,selling_price,gst_rate,stock_qty,weight,cod_allowed,"
            "pincode_shipping_group,tags,seo_title,seo_description,publish_status\n"
            f"TEST_QA_CSV_{uuid.uuid4().hex[:5]},PN-TEST,TEST_QA_CSV_Roller,टेस्ट,Short,Long,HP,Printer Parts,Roller,"
            "HP M404,Material:Rubber,https://example.com/x.jpg,500,399,18,10,0.4,true,default,tag1,TEST,TEST,published\n"
            ",,,,,,,,,,,,,,,,,,,,,,\n"  # invalid row (missing name)
        )
        files = {"file": ("test.csv", csv_text, "text/csv")}
        r = requests.post(f"{API}/admin/products/import-csv", files=files,
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        rep = r.json()
        assert "created" in rep and "updated" in rep and "failed" in rep
        assert rep["created"] >= 1
        assert rep["failed"] >= 1

    def test_admin_orders_list_and_status(self, admin_token, customer):
        r = requests.get(f"{API}/admin/orders", headers=auth_headers(admin_token))
        assert r.status_code == 200
        orders = r.json()
        assert any(o["id"] == customer["order_id"] for o in orders)

        u = requests.put(f"{API}/admin/orders/{customer['order_id']}/status",
                         json={"status": "confirmed"}, headers=auth_headers(admin_token))
        assert u.status_code == 200
        assert u.json()["status"] == "confirmed"

    def test_admin_pincode_crud(self, admin_token):
        pin = "999001"
        c = requests.post(f"{API}/admin/pincodes",
                          json={"pincode": pin, "zone": "TEST", "shipping_charge": 50, "cod_available": True},
                          headers=auth_headers(admin_token))
        assert c.status_code == 200
        pid = c.json()["id"]
        d = requests.delete(f"{API}/admin/pincodes/{pid}", headers=auth_headers(admin_token))
        assert d.status_code == 200

    def test_admin_category_brand_blog_settings(self, admin_token):
        # Category
        c = requests.post(f"{API}/admin/categories",
                         json={"name_en": "TEST_QA_Cat", "subcategories": []},
                         headers=auth_headers(admin_token))
        assert c.status_code == 200
        cid = c.json()["id"]
        requests.delete(f"{API}/admin/categories/{cid}", headers=auth_headers(admin_token))

        # Brand
        b = requests.post(f"{API}/admin/brands", json={"name": "TEST_QA_Brand"},
                          headers=auth_headers(admin_token))
        assert b.status_code == 200
        requests.delete(f"{API}/admin/brands/{b.json()['id']}", headers=auth_headers(admin_token))

        # Blog
        bl = requests.post(f"{API}/admin/blog",
                          json={"title": "TEST_QA_Post", "content": "hi", "published": True},
                          headers=auth_headers(admin_token))
        assert bl.status_code == 200
        requests.delete(f"{API}/admin/blog/{bl.json()['id']}", headers=auth_headers(admin_token))

        # Settings update
        st = requests.put(f"{API}/admin/settings",
                         json={"store_name": "PartStation"},
                         headers=auth_headers(admin_token))
        assert st.status_code == 200

    def test_admin_rejects_customer_token(self, customer):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers(customer["token"]))
        assert r.status_code == 403

    def test_admin_rejects_no_token(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code in (401, 403)
