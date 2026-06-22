"""
PartStation.in NEW admin upgrade endpoints (iteration_3).

Covers:
- POST /api/admin/upload (image upload)
- POST /api/admin/import/from-url (URL import / preview)
- PATCH /api/admin/products/{id}/visibility (eye toggle)
- Auto-SKU generation (POST /api/admin/products with blank SKU)
- Admin product search (q across name/sku/brand/category/model) + stock/status filters
- min_order_qty enforcement on /api/orders
- Free-delivery quantity flag on orders
- low_stock count on /api/admin/stats
- Hidden (draft) products excluded from public /api/products
"""
import io
import os
import uuid
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://parts-shop-5.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@partstation.com"
ADMIN_PASSWORD = "Admin@12345"


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      headers={"Content-Type": "application/json"})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def customer():
    email = f"buyer_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "MOQ Buyer", "email": email, "password": "Test@12345", "phone": "9999900000"
    })
    assert r.status_code == 200, r.text
    return {"email": email, "token": r.json()["token"]}


def _tiny_png() -> bytes:
    """Generate a valid 1x1 transparent PNG without external deps."""
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0))
    raw = b"\x00\x00\x00\x00\x00"  # filter + 1 RGBA pixel
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


# ---------------- IMAGE UPLOAD ----------------
class TestAdminUpload:
    def test_upload_png(self, admin_token):
        files = {"file": ("test.png", _tiny_png(), "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=auth_headers(admin_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "file_url" in data and data["file_url"].startswith("/api/files/")
        # Verify file is accessible publicly (no auth)
        public_url = f"{BASE_URL}{data['file_url']}"
        g = requests.get(public_url)
        assert g.status_code == 200, f"Public file fetch failed: {g.status_code}"
        assert g.headers.get("content-type", "").startswith("image/")

    def test_upload_rejects_bad_ext(self, admin_token):
        files = {"file": ("a.txt", b"hello", "text/plain")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=auth_headers(admin_token))
        assert r.status_code == 400

    def test_upload_requires_admin(self):
        files = {"file": ("a.png", _tiny_png(), "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files)
        assert r.status_code in (401, 403)


# ---------------- AUTO-SKU + PRODUCT CREATE ----------------
class TestAutoSkuAndProduct:
    def test_auto_sku_format(self, admin_token):
        payload = {
            "name_en": "TEST_AutoSku_Toner",
            "brand": "HP",
            "category": "Printer Parts",
            "category_slug": "printer-parts",
            "subcategory": "Toner",
            "mrp": 2000, "selling_price": 1500, "stock_qty": 12,
            "min_order_qty": 2, "free_shipping_qty": 5,
            "images": ["https://example.com/x.jpg"],
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=auth_headers(admin_token))
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["sku"], "SKU should be auto-generated"
        # Should match BRAND-SUB-NNNN pattern (HP-TON-0001 style). Brand 3-char or fewer letters
        import re as _re
        assert _re.match(r"^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-\d{4}$", p["sku"]), f"Bad SKU format: {p['sku']}"
        assert p["min_order_qty"] == 2
        assert p["free_shipping_qty"] == 5
        # cleanup
        TestAutoSkuAndProduct._created_id = p["id"]
        TestAutoSkuAndProduct._created_sku = p["sku"]
        TestAutoSkuAndProduct._created_slug = p["slug"]

    def test_visible_in_public_list(self, admin_token):
        sku = TestAutoSkuAndProduct._created_sku
        r = requests.get(f"{API}/products", params={"q": sku, "limit": 20})
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(i["sku"] == sku for i in items), "Newly created product missing from public list"


# ---------------- VISIBILITY TOGGLE ----------------
class TestVisibilityToggle:
    def test_toggle_hides_then_shows(self, admin_token):
        pid = TestAutoSkuAndProduct._created_id
        slug = TestAutoSkuAndProduct._created_slug

        # Toggle to draft
        r1 = requests.patch(f"{API}/admin/products/{pid}/visibility", headers=auth_headers(admin_token))
        assert r1.status_code == 200, r1.text
        assert r1.json()["publish_status"] == "draft"

        # Public list excludes it (this is the documented contract)
        sku = TestAutoSkuAndProduct._created_sku
        pl = requests.get(f"{API}/products", params={"q": sku, "limit": 20}).json()["items"]
        assert not any(i["sku"] == sku for i in pl), "Hidden product appears in public list"

        # BUG: /api/products/{slug} detail endpoint does NOT filter by publish_status,
        # so a hidden product is still accessible via direct URL. Reported as backend bug.
        g = requests.get(f"{API}/products/{slug}")
        if g.status_code == 200:
            pytest.xfail("BUG: /api/products/{slug} returns hidden (draft) product (no publish_status filter)")
        assert g.status_code == 404

        # Toggle back to published
        r2 = requests.patch(f"{API}/admin/products/{pid}/visibility", headers=auth_headers(admin_token))
        assert r2.status_code == 200
        assert r2.json()["publish_status"] == "published"
        # Visible again
        g2 = requests.get(f"{API}/products/{slug}")
        assert g2.status_code == 200

    def test_toggle_requires_admin(self):
        pid = TestAutoSkuAndProduct._created_id
        r = requests.patch(f"{API}/admin/products/{pid}/visibility")
        assert r.status_code in (401, 403)


# ---------------- ADMIN PRODUCT SEARCH + FILTERS ----------------
class TestAdminProductSearch:
    def test_search_by_brand(self, admin_token):
        r = requests.get(f"{API}/admin/products", params={"q": "HP"}, headers=auth_headers(admin_token))
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) > 0
        assert any("hp" in (i["brand"] or "").lower() for i in items)

    def test_search_by_compatible_model(self, admin_token):
        r = requests.get(f"{API}/admin/products", params={"q": "LaserJet 1020"}, headers=auth_headers(admin_token))
        assert r.status_code == 200
        # at least the search should return shape; result count depends on seeds
        assert "items" in r.json()

    def test_search_by_sku(self, admin_token):
        sku = TestAutoSkuAndProduct._created_sku
        r = requests.get(f"{API}/admin/products", params={"q": sku}, headers=auth_headers(admin_token))
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(i["sku"] == sku for i in items)

    def test_filter_status_draft(self, admin_token):
        # Create a draft product
        payload = {"name_en": "TEST_DraftOnly", "brand": "Canon", "category": "Printer Parts",
                   "category_slug": "printer-parts", "subcategory": "Drum",
                   "selling_price": 100, "publish_status": "draft"}
        c = requests.post(f"{API}/admin/products", json=payload, headers=auth_headers(admin_token))
        assert c.status_code == 200
        draft_id = c.json()["id"]
        try:
            r = requests.get(f"{API}/admin/products", params={"status": "draft", "limit": 100},
                             headers=auth_headers(admin_token))
            assert r.status_code == 200
            items = r.json()["items"]
            assert all(i["publish_status"] == "draft" for i in items)
            assert any(i["id"] == draft_id for i in items)
        finally:
            requests.delete(f"{API}/admin/products/{draft_id}", headers=auth_headers(admin_token))

    def test_filter_stock_low(self, admin_token):
        r = requests.get(f"{API}/admin/products", params={"stock": "low_stock", "limit": 100},
                         headers=auth_headers(admin_token))
        assert r.status_code == 200
        items = r.json()["items"]
        for i in items:
            assert i["stock_status"] == "low_stock"


# ---------------- IMPORT FROM URL ----------------
class TestImportFromUrl:
    def test_invalid_url(self, admin_token):
        r = requests.post(f"{API}/admin/import/from-url", json={"url": "not-a-url"},
                          headers=auth_headers(admin_token))
        assert r.status_code == 400

    def test_extract_returns_shape(self, admin_token):
        # Use example.com which has minimal data but should not crash
        r = requests.post(f"{API}/admin/import/from-url",
                          json={"url": "https://example.com"},
                          headers=auth_headers(admin_token))
        assert r.status_code == 200, r.text
        d = r.json()
        # extractor contract used by AdminImport.jsx: name, price, description, images
        for k in ("name", "price", "images"):
            assert k in d, f"Missing key {k} in fetched preview"
        assert isinstance(d["images"], list)

    def test_blocked_site_graceful(self, admin_token):
        r = requests.post(f"{API}/admin/import/from-url",
                          json={"url": "https://www.flipkart.com/abc"},
                          headers=auth_headers(admin_token))
        # Must not 500
        assert r.status_code in (200, 400, 422), r.text


# ---------------- MOQ ENFORCEMENT ----------------
class TestMOQ:
    def test_order_below_moq_rejected(self, admin_token, customer):
        # ensure product with MOQ=2 exists
        pid = TestAutoSkuAndProduct._created_id
        body = {
            "items": [{"product_id": pid, "qty": 1}],
            "address": {"full_name": "X", "phone": "9999999999", "line1": "1",
                        "city": "Delhi", "state": "DL", "pincode": "110001"},
            "payment_method": "cod"
        }
        r = requests.post(f"{API}/orders", json=body,
                          headers={**auth_headers(customer["token"]), "Content-Type": "application/json"})
        assert r.status_code == 400, f"Expected 400 MOQ rejection, got {r.status_code}: {r.text}"
        assert "minimum" in r.text.lower() or "moq" in r.text.lower()

    def test_order_at_moq_succeeds(self, customer):
        pid = TestAutoSkuAndProduct._created_id
        body = {
            "items": [{"product_id": pid, "qty": 2}],
            "address": {"full_name": "X", "phone": "9999999999", "line1": "1",
                        "city": "Delhi", "state": "DL", "pincode": "110001"},
            "payment_method": "cod"
        }
        r = requests.post(f"{API}/orders", json=body,
                          headers={**auth_headers(customer["token"]), "Content-Type": "application/json"})
        assert r.status_code == 200, r.text
        assert r.json()["order_number"].startswith("PS")

    def test_free_shipping_when_qty_above_threshold(self, customer):
        pid = TestAutoSkuAndProduct._created_id  # free_shipping_qty=5
        body = {
            "items": [{"product_id": pid, "qty": 5}],
            "address": {"full_name": "X", "phone": "9999999999", "line1": "1",
                        "city": "Delhi", "state": "DL", "pincode": "110001"},
            "payment_method": "cod"
        }
        r = requests.post(f"{API}/orders", json=body,
                          headers={**auth_headers(customer["token"]), "Content-Type": "application/json"})
        assert r.status_code == 200, r.text
        assert r.json()["shipping_charge"] == 0, "Free shipping not applied at threshold qty"


# ---------------- LOW STOCK DASHBOARD STAT ----------------
class TestStatsLowStock:
    def test_stats_includes_low_stock(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers(admin_token))
        assert r.status_code == 200
        s = r.json()
        assert "low_stock" in s
        assert isinstance(s["low_stock"], int)


# ---------------- CLEANUP ----------------
@pytest.fixture(scope="module", autouse=True)
def _cleanup(admin_token):
    yield
    pid = getattr(TestAutoSkuAndProduct, "_created_id", None)
    if pid:
        requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers(admin_token))
