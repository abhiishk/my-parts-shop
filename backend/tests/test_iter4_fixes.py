"""Tests for iteration 4 fixes: logo, emergent removal, admin product category_id backfill."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://parts-shop-5.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@partstation.com"
ADMIN_PASSWORD = "Admin@12345"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
    return s


def test_logo_accessible():
    r = requests.get(f"{BASE_URL}/logo.png")
    assert r.status_code == 200
    assert len(r.content) > 1000


def test_index_no_emergent_badge():
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200
    txt = r.text.lower()
    assert "emergent-badge" not in txt
    assert "posthog" not in txt
    assert "made with emergent" not in txt


def test_categories_list():
    r = requests.get(f"{BASE_URL}/api/categories")
    assert r.status_code == 200
    cats = r.json()
    assert isinstance(cats, list) and len(cats) > 0


def test_shop_products_list():
    r = requests.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200


def test_admin_create_product_backfills_category_id(admin_session):
    cats = requests.get(f"{BASE_URL}/api/categories").json()
    assert len(cats) > 0
    cat = cats[0]
    payload = {
        "name": "TEST_iter4_product",
        "selling_price": 999,
        "category_slug": cat["slug"],
        # no category_id sent -- backend should backfill
    }
    r = admin_session.post(f"{BASE_URL}/api/admin/products", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text[:300]}"
    prod = r.json()
    assert prod.get("category_id"), f"category_id not backfilled: {prod}"
    assert prod["category_id"] == cat["id"]
    # cleanup
    pid = prod.get("id") or prod.get("_id")
    if pid:
        admin_session.delete(f"{BASE_URL}/api/admin/products/{pid}")


def test_admin_create_product_with_category_id(admin_session):
    cats = requests.get(f"{BASE_URL}/api/categories").json()
    cat = cats[0]
    payload = {
        "name": "TEST_iter4_product_2",
        "selling_price": 500,
        "category_slug": cat["slug"],
        "category_id": cat["id"],
    }
    r = admin_session.post(f"{BASE_URL}/api/admin/products", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text[:300]}"
    prod = r.json()
    assert prod["category_id"] == cat["id"]
    pid = prod.get("id") or prod.get("_id")
    # verify GET
    if pid:
        g = requests.get(f"{BASE_URL}/api/products/{pid}")
        if g.status_code == 200:
            assert g.json().get("category_id") == cat["id"]
        admin_session.delete(f"{BASE_URL}/api/admin/products/{pid}")
