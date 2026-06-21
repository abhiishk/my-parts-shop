"""Idempotent seed data for PartStation: categories, brands, products, blog, pincodes, settings."""
import uuid
from datetime import datetime, timezone


def _id():
    return str(uuid.uuid4())


def now_iso():
    return datetime.now(timezone.utc).isoformat()


IMG = {
    "printer": [
        "https://images.unsplash.com/photo-1746016805172-86dc8aaf6484?w=800&q=80",
        "https://images.unsplash.com/photo-1740625940423-a59a65c753c0?w=800&q=80",
        "https://images.pexels.com/photos/17235421/pexels-photo-17235421.jpeg?auto=compress&w=800",
    ],
    "computer": [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        "https://images.pexels.com/photos/4584613/pexels-photo-4584613.jpeg?auto=compress&w=800",
        "https://images.unsplash.com/photo-1555617766-c94804975da3?w=800&q=80",
    ],
    "laptop": [
        "https://images.unsplash.com/photo-1620368523635-df9d83338fc1?w=800&q=80",
        "https://images.pexels.com/photos/7639373/pexels-photo-7639373.jpeg?auto=compress&w=800",
    ],
    "network": [
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
        "https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&w=800",
    ],
}

CATEGORIES = [
    {"slug": "printer-parts", "name_en": "Printer Parts", "name_hi": "प्रिंटर पार्ट्स", "img": "printer",
     "subs": ["Printer Head", "Formatter Board", "Fuser Assembly", "Pickup Roller", "Separation Pad",
              "Power Supply", "Logic Board", "Sensor", "Carriage Belt", "Maintenance Kit", "Gear / Motor", "Tray / Feeder Parts"]},
    {"slug": "printer-accessories", "name_en": "Printer Accessories", "name_hi": "प्रिंटर एक्सेसरीज़", "img": "printer",
     "subs": ["Trays", "Paper Feeders", "Duplex Units", "Network Cards"]},
    {"slug": "printer-consumables", "name_en": "Printer Consumables", "name_hi": "प्रिंटर कंज्यूमेबल्स", "img": "printer",
     "subs": ["Toner Cartridge", "Ink Cartridge", "Drum Unit", "Developer"]},
    {"slug": "computer-parts", "name_en": "Computer Parts", "name_hi": "कंप्यूटर पार्ट्स", "img": "computer",
     "subs": ["Motherboard", "RAM", "SSD", "Power Supply", "Processor", "Graphics Card"]},
    {"slug": "laptop-parts", "name_en": "Laptop Parts", "name_hi": "लैपटॉप पार्ट्स", "img": "laptop",
     "subs": ["Battery", "Keyboard", "Screen", "Adapter", "Hinge", "Cooling Fan"]},
    {"slug": "networking-it", "name_en": "Networking / IT Accessories", "name_hi": "नेटवर्किंग / आईटी", "img": "network",
     "subs": ["Switches", "Routers", "NIC Cards", "Patch Panels"]},
    {"slug": "cables-power", "name_en": "Cables / Power / Connectors", "name_hi": "केबल / पावर / कनेक्टर", "img": "network",
     "subs": ["Ethernet Cable", "Power Cable", "USB Cable", "Connectors"]},
    {"slug": "tools-service", "name_en": "Tools / Service Accessories", "name_hi": "टूल्स / सर्विस", "img": "computer",
     "subs": ["Screwdriver Kits", "Cleaning Kits", "Soldering Tools"]},
]

BRANDS = [
    {"slug": "hp", "name": "HP"},
    {"slug": "canon", "name": "Canon"},
    {"slug": "epson", "name": "Epson"},
    {"slug": "brother", "name": "Brother"},
    {"slug": "dell", "name": "Dell"},
    {"slug": "lenovo", "name": "Lenovo"},
    {"slug": "tp-link", "name": "TP-Link"},
    {"slug": "generic", "name": "Generic"},
]

# Curated product templates: (name_en, name_hi, category_slug, sub, brand_slug, models, mrp, price, gst, specs)
PRODUCTS = [
    ("HP LaserJet Pro Printer Head Assembly", "एचपी लेजरजेट प्रिंटर हेड", "printer-parts", "Printer Head", "hp",
     ["HP LaserJet Pro M404", "HP LaserJet M428"], 4500, 3299, 18,
     {"Type": "Thermal Print Head", "Compatibility": "LaserJet Pro Series", "Warranty": "6 Months"}),
    ("Canon Fuser Assembly Unit 220V", "कैनन फ्यूज़र असेंबली", "printer-parts", "Fuser Assembly", "canon",
     ["Canon iR2520", "Canon iR2525"], 8900, 6750, 18,
     {"Voltage": "220V", "Type": "Fuser Unit", "Warranty": "3 Months"}),
    ("Epson Pickup Roller Kit", "एप्सन पिकअप रोलर किट", "printer-parts", "Pickup Roller", "epson",
     ["Epson L3110", "Epson L3150"], 650, 399, 18,
     {"Material": "Rubber", "Pack": "Roller + Pad", "Warranty": "1 Month"}),
    ("HP Formatter Board (Logic Board)", "एचपी फॉर्मेटर बोर्ड", "printer-parts", "Formatter Board", "hp",
     ["HP LaserJet P1108", "HP LaserJet 1020"], 3200, 2450, 18,
     {"Interface": "USB", "Type": "Formatter / Main Board", "Warranty": "3 Months"}),
    ("Brother Separation Pad", "ब्रदर सेपरेशन पैड", "printer-parts", "Separation Pad", "brother",
     ["Brother HL-L2321D", "Brother DCP-L2520D"], 350, 199, 18,
     {"Material": "Rubber", "Warranty": "1 Month"}),
    ("Canon Carriage Belt", "कैनन कैरिज बेल्ट", "printer-parts", "Carriage Belt", "canon",
     ["Canon Pixma G2010"], 540, 349, 18, {"Type": "Drive Belt", "Warranty": "1 Month"}),
    ("HP Printer Power Supply Board", "एचपी पावर सप्लाई बोर्ड", "printer-parts", "Power Supply", "hp",
     ["HP LaserJet M1136", "HP LaserJet M1005"], 2100, 1599, 18,
     {"Output": "24V/5V", "Type": "SMPS", "Warranty": "3 Months"}),
    ("Epson Maintenance Kit", "एप्सन मेंटेनेंस किट", "printer-parts", "Maintenance Kit", "epson",
     ["Epson WF-7710", "Epson WF-7720"], 1800, 1299, 18, {"Includes": "Pads + Rollers", "Warranty": "1 Month"}),

    ("HP 88A Toner Cartridge", "एचपी 88A टोनर", "printer-consumables", "Toner Cartridge", "hp",
     ["HP LaserJet P1108", "HP M1136"], 1899, 1199, 18, {"Yield": "1500 pages", "Color": "Black"}),
    ("Canon PG-810 Ink Cartridge", "कैनन इंक कार्ट्रिज", "printer-consumables", "Ink Cartridge", "canon",
     ["Canon Pixma MP237"], 1250, 899, 18, {"Color": "Black", "Yield": "300 pages"}),
    ("Brother DR-2255 Drum Unit", "ब्रदर ड्रम यूनिट", "printer-consumables", "Drum Unit", "brother",
     ["Brother HL-L2321D"], 3500, 2599, 18, {"Yield": "12000 pages", "Type": "Drum"}),

    ("Dell OptiPlex Motherboard", "डेल मदरबोर्ड", "computer-parts", "Motherboard", "dell",
     ["Dell OptiPlex 3060", "Dell OptiPlex 7060"], 9500, 7250, 18,
     {"Socket": "LGA1151", "Form Factor": "Micro-ATX", "Warranty": "3 Months"}),
    ("Kingston 8GB DDR4 RAM 3200MHz", "किंग्स्टन 8GB रैम", "computer-parts", "RAM", "generic",
     ["Universal Desktop"], 2800, 1999, 18, {"Capacity": "8GB", "Speed": "3200MHz", "Type": "DDR4"}),
    ("Crucial 512GB SATA SSD", "क्रुशियल 512GB SSD", "computer-parts", "SSD", "generic",
     ["Universal 2.5 inch"], 4200, 3199, 18, {"Capacity": "512GB", "Interface": "SATA III"}),
    ("Corsair 550W SMPS Power Supply", "कोर्सेर पावर सप्लाई", "computer-parts", "Power Supply", "generic",
     ["ATX Desktop"], 3800, 2899, 18, {"Wattage": "550W", "Certification": "80+ Bronze"}),

    ("Dell Latitude Laptop Battery", "डेल लैपटॉप बैटरी", "laptop-parts", "Battery", "dell",
     ["Dell Latitude E5470", "Dell Latitude 3490"], 4500, 3299, 18, {"Capacity": "4-Cell", "Voltage": "7.6V"}),
    ("Lenovo Laptop Keyboard", "लेनोवो कीबोर्ड", "laptop-parts", "Keyboard", "lenovo",
     ["Lenovo ThinkPad E480", "Lenovo IdeaPad 330"], 1600, 1149, 18, {"Layout": "US", "Type": "Internal"}),
    ("Laptop 65W Adapter Charger", "लैपटॉप अडैप्टर", "laptop-parts", "Adapter", "generic",
     ["HP Pavilion", "Dell Inspiron"], 1400, 899, 18, {"Output": "19V 3.42A", "Wattage": "65W"}),
    ("Laptop Cooling Fan", "लैपटॉप कूलिंग फैन", "laptop-parts", "Cooling Fan", "generic",
     ["HP 15", "Dell Inspiron 15"], 950, 649, 18, {"Voltage": "5V", "Connector": "4-Pin"}),

    ("TP-Link 8-Port Gigabit Switch", "टीपी-लिंक स्विच", "networking-it", "Switches", "tp-link",
     ["Universal"], 1500, 1099, 18, {"Ports": "8", "Speed": "Gigabit"}),
    ("TP-Link Archer Dual Band Router", "टीपी-लिंक राउटर", "networking-it", "Routers", "tp-link",
     ["Universal"], 2800, 1999, 18, {"Band": "Dual", "Speed": "AC1200"}),
    ("Cat6 Ethernet Cable 5m", "कैट6 ईथरनेट केबल", "cables-power", "Ethernet Cable", "generic",
     ["Universal"], 350, 199, 18, {"Length": "5m", "Category": "Cat6"}),
    ("Universal Power Cable 1.5m", "पावर केबल", "cables-power", "Power Cable", "generic",
     ["Desktop / Printer"], 220, 129, 18, {"Length": "1.5m", "Type": "3-Pin"}),
    ("65-in-1 Precision Screwdriver Kit", "स्क्रूड्राइवर किट", "tools-service", "Screwdriver Kits", "generic",
     ["Universal"], 1200, 749, 18, {"Pieces": "65", "Use": "Electronics Repair"}),
    ("Electronics Cleaning Kit", "क्लीनिंग किट", "tools-service", "Cleaning Kits", "generic",
     ["Universal"], 600, 399, 18, {"Includes": "Brush, Blower, Cloth"}),
]

BLOG = [
    ("How to Replace a Printer Pickup Roller", "How to Replace a Printer Pickup Roller",
     "A step-by-step guide to diagnosing paper feed issues and replacing your printer's pickup roller safely.",
     "printer-maintenance"),
    ("Choosing the Right Toner vs Ink Cartridge", "Choosing the Right Toner vs Ink Cartridge",
     "Understand the difference between laser toner and inkjet ink, and how to pick the right consumable for your printer.",
     "buying-guide"),
    ("Top 5 Signs Your Laptop Battery Needs Replacement", "Top 5 Signs Your Laptop Battery Needs Replacement",
     "Learn the warning signs of a failing laptop battery and how to find a compatible replacement.",
     "laptop-care"),
]

PINCODES = [
    {"pincode": "110001", "zone": "North - Delhi NCR", "shipping_charge": 0, "cod_available": True, "free_above": 999},
    {"pincode": "400001", "zone": "West - Mumbai", "shipping_charge": 49, "cod_available": True, "free_above": 1499},
    {"pincode": "560001", "zone": "South - Bengaluru", "shipping_charge": 49, "cod_available": True, "free_above": 1499},
    {"pincode": "700001", "zone": "East - Kolkata", "shipping_charge": 79, "cod_available": True, "free_above": 1999},
    {"pincode": "600001", "zone": "South - Chennai", "shipping_charge": 59, "cod_available": False, "free_above": 1999},
]

SETTINGS = {
    "id": "global",
    "store_name": "PartStation.in",
    "tagline": "Your Parts Destination",
    "support_email": "support@partstation.com",
    "whatsapp_number": "919999999999",
    "phone": "+91 99999 99999",
    "address": "PartStation Warehouse, New Delhi, India",
    "gstin": "07AABCP1234C1Z5",
    "default_shipping_charge": 99,
    "free_shipping_above": 2499,
    "default_cod_available": True,
    "social": {"instagram": "", "facebook": "", "youtube": "", "linkedin": ""},
    "ga4_id": "",
    "hero_title": "Genuine Printer & IT Spare Parts, Shipped Across India",
    "hero_subtitle": "Printer heads, formatter boards, fusers, laptop & computer parts — with GST invoice, COD and fast delivery.",
}


def slugify(text):
    import re
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s


async def seed_all(db):
    if await db.products.count_documents({}) > 0:
        return

    # Categories
    cat_map = {}
    for c in CATEGORIES:
        doc = {
            "id": _id(), "slug": c["slug"], "name_en": c["name_en"], "name_hi": c["name_hi"],
            "image": IMG[c["img"]][0], "subcategories": c["subs"], "order": CATEGORIES.index(c),
            "created_at": now_iso(),
        }
        cat_map[c["slug"]] = doc
        await db.categories.insert_one({**doc})

    # Brands
    for b in BRANDS:
        await db.brands.insert_one({"id": _id(), "slug": b["slug"], "name": b["name"], "created_at": now_iso()})

    # Products
    img_cycle = {"printer-parts": "printer", "printer-accessories": "printer", "printer-consumables": "printer",
                 "computer-parts": "computer", "laptop-parts": "laptop", "networking-it": "network",
                 "cables-power": "network", "tools-service": "computer"}
    for idx, p in enumerate(PRODUCTS):
        name_en, name_hi, cat_slug, sub, brand_slug, models, mrp, price, gst, specs = p
        imgs = IMG[img_cycle[cat_slug]]
        brand_name = next((b["name"] for b in BRANDS if b["slug"] == brand_slug), "Generic")
        cat = cat_map[cat_slug]
        doc = {
            "id": _id(),
            "sku": f"PS-{1000 + idx}",
            "part_number": f"PN-{cat_slug[:3].upper()}-{1000 + idx}",
            "name_en": name_en, "name_hi": name_hi,
            "slug": slugify(name_en) + f"-{1000 + idx}",
            "short_description": f"{name_en} — genuine quality spare part with warranty.",
            "long_description": f"{name_en} is a high-quality replacement part compatible with {', '.join(models)}. "
                                f"Backed by GST invoice and India-wide shipping. Category: {cat['name_en']} > {sub}.",
            "brand": brand_name, "brand_slug": brand_slug,
            "category": cat["name_en"], "category_slug": cat_slug, "subcategory": sub,
            "compatible_models": models,
            "technical_specs": specs,
            "images": imgs[:2],
            "mrp": mrp, "selling_price": price, "gst_rate": gst,
            "stock_qty": 25 if idx % 5 else 3, "stock_status": "in_stock" if idx % 7 else "low_stock",
            "weight": 0.5, "cod_allowed": True, "pincode_shipping_group": "default",
            "tags": [cat["name_en"], brand_name, sub],
            "seo_title": f"Buy {name_en} Online | PartStation",
            "seo_description": f"{name_en} compatible with {models[0]}. GST invoice, COD, fast shipping across India.",
            "publish_status": "published",
            "featured": idx % 4 == 0,
            "new_arrival": idx % 3 == 0,
            "return_eligible": True, "warranty": specs.get("Warranty", "Limited"),
            "rating": round(3.8 + (idx % 5) * 0.2, 1), "review_count": 5 + idx,
            "created_at": now_iso(),
        }
        await db.products.insert_one({**doc})

    # Blog
    for t in BLOG:
        title, _, excerpt, cat = t
        await db.blog_posts.insert_one({
            "id": _id(), "title": title, "slug": slugify(title), "excerpt": excerpt,
            "category": cat,
            "content": f"<p>{excerpt}</p><p>This is a sample article from the PartStation resource center. "
                       f"Detailed guides help technicians and businesses choose and install the right parts.</p>"
                       f"<h3>Key Points</h3><ul><li>Always power off before servicing.</li>"
                       f"<li>Use genuine compatible parts.</li><li>Keep your GST invoice for warranty claims.</li></ul>",
            "cover_image": IMG["printer"][1],
            "author": "PartStation Team", "published": True, "created_at": now_iso(),
        })

    # Pincodes
    for pc in PINCODES:
        await db.pincode_rules.insert_one({"id": _id(), **pc, "created_at": now_iso()})

    # Settings
    await db.settings.update_one({"id": "global"}, {"$set": SETTINGS}, upsert=True)
