"""Best-effort product data extractor from a public product URL (JSON-LD + OpenGraph + heuristics)."""
import json
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PartStationBot/1.0)"}


def _clean(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def _price_from(value):
    if value is None:
        return None
    m = re.search(r"[\d,]+\.?\d*", str(value).replace(",", ""))
    return float(m.group()) if m else None


def _walk_jsonld(node, found):
    if isinstance(node, list):
        for n in node:
            _walk_jsonld(n, found)
    elif isinstance(node, dict):
        t = node.get("@type", "")
        types = t if isinstance(t, list) else [t]
        if any("Product" in str(x) for x in types):
            found.append(node)
        if "@graph" in node:
            _walk_jsonld(node["@graph"], found)


def extract_product(url: str) -> dict:
    result = {"name": "", "description": "", "price": None, "mrp": None, "images": [], "source_url": url, "warnings": []}
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        result["warnings"].append(f"Could not fetch URL: {e}")
        return result

    soup = BeautifulSoup(resp.text, "lxml")

    # 1) JSON-LD Product
    products = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "{}")
        except Exception:
            continue
        _walk_jsonld(data, products)

    if products:
        p = products[0]
        result["name"] = _clean(p.get("name"))
        result["description"] = _clean(p.get("description"))
        img = p.get("image")
        if isinstance(img, str):
            result["images"] = [img]
        elif isinstance(img, list):
            result["images"] = [i if isinstance(i, str) else i.get("url", "") for i in img]
        elif isinstance(img, dict):
            result["images"] = [img.get("url", "")]
        offers = p.get("offers")
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        if isinstance(offers, dict):
            result["price"] = _price_from(offers.get("price") or offers.get("lowPrice"))

    # 2) OpenGraph / meta fallback
    def meta(prop, attr="property"):
        tag = soup.find("meta", attrs={attr: prop})
        return tag.get("content") if tag else None

    if not result["name"]:
        result["name"] = _clean(meta("og:title") or (soup.title.string if soup.title else ""))
    if not result["description"]:
        result["description"] = _clean(meta("og:description") or meta("description", "name"))
    if not result["images"]:
        og_img = meta("og:image")
        if og_img:
            result["images"] = [og_img]
    if result["price"] is None:
        result["price"] = _price_from(meta("product:price:amount") or meta("og:price:amount"))

    result["images"] = [i for i in result["images"] if i and i.startswith("http")][:5]

    if not result["name"]:
        result["warnings"].append("No product title found — site may not expose structured data.")
    if result["price"] is None:
        result["warnings"].append("No price found — please enter it manually.")
    if not result["images"]:
        result["warnings"].append("No images found — please add image URLs or upload manually.")
    return result
