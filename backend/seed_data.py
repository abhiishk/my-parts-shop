"""Seed data for PartStation.in — real Indian printer brands/models + parts. Versioned reseed."""
import uuid, re
from datetime import datetime, timezone

SEED_VERSION = 3


def _id(): return str(uuid.uuid4())
def now_iso(): return datetime.now(timezone.utc).isoformat()
def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")


IMG = {
    "printerhead": ["https://images.unsplash.com/photo-1746016805172-86dc8aaf6484?w=800&q=80", "https://images.unsplash.com/photo-1740625940423-a59a65c753c0?w=800&q=80"],
    "printer": ["https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=800&q=80", "https://images.pexels.com/photos/17235421/pexels-photo-17235421.jpeg?auto=compress&w=800"],
    "toner": ["https://images.unsplash.com/photo-1706895040634-62055892cbbb?w=800&q=80", "https://images.pexels.com/photos/33475146/pexels-photo-33475146.jpeg?auto=compress&w=800"],
    "ink": ["https://images.unsplash.com/photo-1703950104186-aeb81511cfd2?w=800&q=80", "https://images.pexels.com/photos/7639358/pexels-photo-7639358.jpeg?auto=compress&w=800"],
    "computer": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", "https://images.pexels.com/photos/4584613/pexels-photo-4584613.jpeg?auto=compress&w=800"],
    "ram": ["https://images.pexels.com/photos/6373758/pexels-photo-6373758.jpeg?auto=compress&w=800", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"],
    "laptop": ["https://images.unsplash.com/photo-1620368523635-df9d83338fc1?w=800&q=80", "https://images.pexels.com/photos/7639373/pexels-photo-7639373.jpeg?auto=compress&w=800"],
    "adapter": ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80", "https://images.pexels.com/photos/3921707/pexels-photo-3921707.jpeg?auto=compress&w=800"],
    "network": ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80", "https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&w=800"],
}

CATEGORIES = [
    {"slug": "printer-parts", "name_en": "Printer Parts", "name_hi": "प्रिंटर पार्ट्स", "img": "printerhead",
     "subs": ["Printer Head", "Formatter Board", "Fuser Assembly", "Pickup Roller", "Separation Pad", "Power Supply", "Logic Board", "Sensor", "Carriage Belt", "Maintenance Kit", "Gear / Motor", "Tray / Feeder Parts"]},
    {"slug": "printer-consumables", "name_en": "Printer Consumables", "name_hi": "प्रिंटर कंज्यूमेबल्स", "img": "toner",
     "subs": ["Toner Cartridge", "Ink Cartridge", "Drum Unit", "Ink Bottle", "Developer"]},
    {"slug": "printer-accessories", "name_en": "Printer Accessories", "name_hi": "प्रिंटर एक्सेसरीज़", "img": "printer",
     "subs": ["Trays", "Paper Feeders", "Duplex Units", "Network Cards", "USB Cables"]},
    {"slug": "computer-parts", "name_en": "Computer Parts", "name_hi": "कंप्यूटर पार्ट्स", "img": "computer",
     "subs": ["Motherboard", "RAM", "SSD", "Hard Disk", "Power Supply", "Processor", "Graphics Card"]},
    {"slug": "laptop-parts", "name_en": "Laptop Parts", "name_hi": "लैपटॉप पार्ट्स", "img": "laptop",
     "subs": ["Battery", "Keyboard", "Screen", "Adapter / Charger", "Hinge", "Cooling Fan"]},
    {"slug": "networking-it", "name_en": "Networking / IT Accessories", "name_hi": "नेटवर्किंग / आईटी", "img": "network",
     "subs": ["Switches", "Routers", "NIC Cards", "Patch Panels"]},
    {"slug": "cables-power", "name_en": "Cables / Power / Connectors", "name_hi": "केबल / पावर / कनेक्टर", "img": "network",
     "subs": ["Ethernet Cable", "Power Cable", "USB Cable", "Connectors"]},
    {"slug": "tools-service", "name_en": "Tools / Service Accessories", "name_hi": "टूल्स / सर्विस", "img": "computer",
     "subs": ["Screwdriver Kits", "Cleaning Kits", "Soldering Tools"]},
]

BRANDS = [
    {"slug": "hp", "name": "HP"}, {"slug": "canon", "name": "Canon"}, {"slug": "epson", "name": "Epson"},
    {"slug": "brother", "name": "Brother"}, {"slug": "samsung", "name": "Samsung"}, {"slug": "ricoh", "name": "Ricoh"},
    {"slug": "kyocera", "name": "Kyocera"}, {"slug": "pantum", "name": "Pantum"}, {"slug": "tvs", "name": "TVS Electronics"},
    {"slug": "xerox", "name": "Xerox"}, {"slug": "dell", "name": "Dell"}, {"slug": "lenovo", "name": "Lenovo"},
    {"slug": "kingston", "name": "Kingston"}, {"slug": "tp-link", "name": "TP-Link"}, {"slug": "d-link", "name": "D-Link"},
    {"slug": "generic", "name": "Generic / Compatible"},
]

# (name_en, name_hi, cat, sub, brand, models, mrp, price, gst, img, specs)
PRODUCTS = [
    ("HP 12A Toner Cartridge (Q2612A)", "एचपी 12A टोनर कार्ट्रिज", "printer-consumables", "Toner Cartridge", "hp",
     ["HP LaserJet 1020", "HP LaserJet 1018", "HP LaserJet M1005 MFP", "HP LaserJet 1010"], 2399, 1349, 18, "toner",
     {"Yield": "2000 pages", "Colour": "Black", "Page Type": "Laser", "Warranty": "1 Month"}),
    ("HP 88A Toner Cartridge (CC388A)", "एचपी 88A टोनर", "printer-consumables", "Toner Cartridge", "hp",
     ["HP LaserJet P1007", "HP LaserJet P1008", "HP LaserJet M1136 MFP", "HP LaserJet M1213nf"], 2099, 1199, 18, "toner",
     {"Yield": "1500 pages", "Colour": "Black", "Warranty": "1 Month"}),
    ("Canon 925 Toner Cartridge", "कैनन 925 टोनर", "printer-consumables", "Toner Cartridge", "canon",
     ["Canon LBP6018", "Canon LBP6030", "Canon MF3010"], 2299, 1299, 18, "toner",
     {"Yield": "1600 pages", "Colour": "Black", "Warranty": "1 Month"}),
    ("Canon 303 Toner Cartridge", "कैनन 303 टोनर", "printer-consumables", "Toner Cartridge", "canon",
     ["Canon LBP2900", "Canon LBP2900B", "Canon LBP3000"], 1899, 1099, 18, "toner",
     {"Yield": "2000 pages", "Colour": "Black", "Warranty": "1 Month"}),
    ("Epson 003 Ink Bottle Set (BK/C/M/Y)", "एप्सन 003 इंक बोतल सेट", "printer-consumables", "Ink Bottle", "epson",
     ["Epson L3110", "Epson L3150", "Epson L3210", "Epson L3250"], 1640, 1199, 18, "ink",
     {"Pack": "4 Bottles", "Volume": "65ml each", "Colours": "Black, Cyan, Magenta, Yellow"}),
    ("Epson 664 Ink Bottle Set", "एप्सन 664 इंक सेट", "printer-consumables", "Ink Bottle", "epson",
     ["Epson L360", "Epson L380", "Epson L130", "Epson L1300"], 1520, 1099, 18, "ink",
     {"Pack": "4 Bottles", "Volume": "70ml each"}),
    ("HP GT53 Black Ink Bottle", "एचपी GT53 इंक बोतल", "printer-consumables", "Ink Bottle", "hp",
     ["HP Ink Tank 315", "HP Ink Tank 415", "HP Smart Tank 515"], 749, 549, 18, "ink",
     {"Volume": "90ml", "Colour": "Black", "Yield": "4000 pages"}),
    ("Brother TN-2280 Toner", "ब्रदर TN-2280 टोनर", "printer-consumables", "Toner Cartridge", "brother",
     ["Brother HL-L2321D", "Brother DCP-L2520D", "Brother MFC-L2701DW"], 2599, 1549, 18, "toner",
     {"Yield": "2600 pages", "Colour": "Black"}),
    ("Brother DR-2255 Drum Unit", "ब्रदर ड्रम यूनिट", "printer-consumables", "Drum Unit", "brother",
     ["Brother HL-L2321D", "Brother DCP-L2520D"], 3500, 2399, 18, "toner",
     {"Yield": "12000 pages", "Type": "Drum"}),

    ("HP LaserJet 1020 Pickup Roller", "एचपी 1020 पिकअप रोलर", "printer-parts", "Pickup Roller", "hp",
     ["HP LaserJet 1020", "HP LaserJet 1018", "HP LaserJet M1005 MFP"], 350, 179, 18, "printerhead",
     {"Material": "Rubber", "Warranty": "1 Month"}),
    ("HP LaserJet P1108 Formatter Board", "एचपी P1108 फॉर्मेटर बोर्ड", "printer-parts", "Formatter Board", "hp",
     ["HP LaserJet P1108", "HP LaserJet P1106", "HP LaserJet 1020"], 3200, 2199, 18, "printerhead",
     {"Interface": "USB", "Type": "Formatter / Main Board", "Warranty": "3 Months"}),
    ("Canon iR2520 Fuser Assembly 220V", "कैनन iR2520 फ्यूज़र असेंबली", "printer-parts", "Fuser Assembly", "canon",
     ["Canon iR2520", "Canon iR2525", "Canon iR2530"], 8900, 6450, 18, "printerhead",
     {"Voltage": "220V", "Type": "Fuser Unit", "Warranty": "3 Months"}),
    ("HP LaserJet M1136 Fuser Film Sleeve", "एचपी M1136 फ्यूज़र फिल्म", "printer-parts", "Fuser Assembly", "hp",
     ["HP LaserJet M1136 MFP", "HP LaserJet P1108", "HP LaserJet M1005 MFP"], 650, 349, 18, "printerhead",
     {"Type": "Fuser Film", "Warranty": "15 Days"}),
    ("HP Printer Power Supply Board", "एचपी पावर सप्लाई बोर्ड", "printer-parts", "Power Supply", "hp",
     ["HP LaserJet M1136 MFP", "HP LaserJet M1005 MFP", "HP LaserJet P1108"], 2100, 1399, 18, "printerhead",
     {"Output": "24V/5V", "Type": "SMPS", "Warranty": "3 Months"}),
    ("Epson L3110 Print Head", "एप्सन L3110 प्रिंट हेड", "printer-parts", "Printer Head", "epson",
     ["Epson L3110", "Epson L3150", "Epson L380", "Epson L360"], 4500, 3299, 18, "printerhead",
     {"Type": "Inkjet Print Head", "Warranty": "15 Days"}),
    ("Canon LBP2900 Separation Pad", "कैनन LBP2900 सेपरेशन पैड", "printer-parts", "Separation Pad", "canon",
     ["Canon LBP2900", "Canon LBP2900B", "Canon LBP3000"], 320, 169, 18, "printerhead",
     {"Material": "Rubber", "Warranty": "1 Month"}),
    ("Brother HL-L2321D Gear Kit", "ब्रदर गियर किट", "printer-parts", "Gear / Motor", "brother",
     ["Brother HL-L2321D", "Brother DCP-L2520D"], 780, 499, 18, "printerhead",
     {"Includes": "Fuser Gears", "Warranty": "1 Month"}),
    ("Epson L360 Maintenance Pad Kit", "एप्सन मेंटेनेंस पैड किट", "printer-parts", "Maintenance Kit", "epson",
     ["Epson L360", "Epson L380", "Epson L3110"], 450, 299, 18, "printerhead",
     {"Includes": "Waste Ink Pad + Reset", "Warranty": "15 Days"}),
    ("HP LaserJet M1005 Scanner Head", "एचपी M1005 स्कैनर हेड", "printer-parts", "Sensor", "hp",
     ["HP LaserJet M1005 MFP", "HP LaserJet M1136 MFP"], 1850, 1199, 18, "printerhead",
     {"Type": "CIS Scanner", "Warranty": "1 Month"}),
    ("Canon imageCLASS MF3010 Drum Unit", "कैनन MF3010 ड्रम यूनिट", "printer-consumables", "Drum Unit", "canon",
     ["Canon MF3010", "Canon LBP6030"], 2599, 1799, 18, "toner", {"Yield": "Standard", "Type": "Drum"}),

    ("Dell OptiPlex 3060 Motherboard", "डेल मदरबोर्ड", "computer-parts", "Motherboard", "dell",
     ["Dell OptiPlex 3060", "Dell OptiPlex 7060", "Dell OptiPlex 5060"], 9500, 6999, 18, "computer",
     {"Socket": "LGA1151", "Form Factor": "Micro-ATX", "Warranty": "3 Months"}),
    ("Kingston 8GB DDR4 3200MHz RAM", "किंग्स्टन 8GB DDR4 रैम", "computer-parts", "RAM", "kingston",
     ["Universal Desktop", "Dell / HP / Lenovo Desktops"], 2800, 1849, 18, "ram",
     {"Capacity": "8GB", "Speed": "3200MHz", "Type": "DDR4 DIMM", "Warranty": "Lifetime"}),
    ("Kingston 16GB DDR4 Laptop RAM", "किंग्स्टन 16GB लैपटॉप रैम", "computer-parts", "RAM", "kingston",
     ["Universal Laptop SODIMM"], 4200, 3099, 18, "ram",
     {"Capacity": "16GB", "Speed": "3200MHz", "Type": "DDR4 SODIMM"}),
    ("Kingston 480GB SATA SSD", "किंग्स्टन 480GB SSD", "computer-parts", "SSD", "kingston",
     ["Universal 2.5 inch SATA"], 3600, 2599, 18, "ram",
     {"Capacity": "480GB", "Interface": "SATA III", "Warranty": "3 Years"}),
    ("WD 1TB Desktop Hard Disk", "WD 1TB हार्ड डिस्क", "computer-parts", "Hard Disk", "generic",
     ["Universal Desktop SATA"], 3800, 2999, 18, "ram",
     {"Capacity": "1TB", "RPM": "7200", "Interface": "SATA III"}),
    ("Corsair 550W SMPS Power Supply", "कोर्सेर 550W पावर सप्लाई", "computer-parts", "Power Supply", "generic",
     ["ATX Desktop"], 3800, 2799, 18, "computer",
     {"Wattage": "550W", "Certification": "80+ Bronze"}),

    ("Dell Latitude E5470 Laptop Battery", "डेल लैपटॉप बैटरी", "laptop-parts", "Battery", "dell",
     ["Dell Latitude E5470", "Dell Latitude E5270", "Dell Latitude 3490"], 4500, 2999, 18, "adapter",
     {"Capacity": "4-Cell", "Voltage": "7.6V", "Warranty": "6 Months"}),
    ("Lenovo ThinkPad E480 Battery", "लेनोवो बैटरी", "laptop-parts", "Battery", "lenovo",
     ["Lenovo ThinkPad E480", "Lenovo ThinkPad E470"], 4200, 2799, 18, "adapter",
     {"Capacity": "3-Cell", "Warranty": "6 Months"}),
    ("HP / Dell 65W Laptop Adapter", "लैपटॉप अडैप्टर 65W", "laptop-parts", "Adapter / Charger", "generic",
     ["HP Pavilion", "Dell Inspiron", "HP 15", "Dell Vostro"], 1400, 749, 18, "adapter",
     {"Output": "19.5V 3.34A", "Wattage": "65W", "Warranty": "3 Months"}),
    ("Lenovo Laptop Keyboard (US)", "लेनोवो कीबोर्ड", "laptop-parts", "Keyboard", "lenovo",
     ["Lenovo IdeaPad 330", "Lenovo ThinkPad E480"], 1600, 999, 18, "laptop",
     {"Layout": "US", "Type": "Internal"}),
    ("Universal Laptop Cooling Fan", "लैपटॉप कूलिंग फैन", "laptop-parts", "Cooling Fan", "generic",
     ["HP 15", "Dell Inspiron 15", "Lenovo IdeaPad"], 950, 549, 18, "laptop",
     {"Voltage": "5V", "Connector": "4-Pin"}),

    ("TP-Link 8-Port Gigabit Switch", "टीपी-लिंक 8-पोर्ट स्विच", "networking-it", "Switches", "tp-link",
     ["Universal"], 1500, 1099, 18, "network", {"Ports": "8", "Speed": "Gigabit", "Warranty": "3 Years"}),
    ("TP-Link Archer C6 Dual Band Router", "टीपी-लिंक राउटर", "networking-it", "Routers", "tp-link",
     ["Universal"], 2800, 1799, 18, "network", {"Band": "Dual", "Speed": "AC1200"}),
    ("D-Link DGS-1005A 5-Port Switch", "डी-लिंक 5-पोर्ट स्विच", "networking-it", "Switches", "d-link",
     ["Universal"], 1100, 799, 18, "network", {"Ports": "5", "Speed": "Gigabit"}),
    ("Cat6 Ethernet Cable 5m", "कैट6 ईथरनेट केबल", "cables-power", "Ethernet Cable", "generic",
     ["Universal"], 350, 169, 18, "network", {"Length": "5m", "Category": "Cat6"}),
    ("Universal Power Cable 1.5m (3-Pin)", "पावर केबल", "cables-power", "Power Cable", "generic",
     ["Desktop / Printer / Monitor"], 220, 119, 18, "network", {"Length": "1.5m", "Type": "3-Pin"}),
    ("Printer USB 2.0 Cable 1.5m", "प्रिंटर USB केबल", "cables-power", "USB Cable", "generic",
     ["HP / Canon / Epson / Brother Printers"], 250, 129, 18, "network", {"Length": "1.5m", "Type": "A-to-B"}),
    ("65-in-1 Precision Screwdriver Kit", "स्क्रूड्राइवर किट", "tools-service", "Screwdriver Kits", "generic",
     ["Universal Electronics Repair"], 1200, 649, 18, "computer", {"Pieces": "65", "Use": "Electronics Repair"}),
    ("Electronics Cleaning Kit", "क्लीनिंग किट", "tools-service", "Cleaning Kits", "generic",
     ["Universal"], 600, 349, 18, "computer", {"Includes": "Brush, Blower, IPA Cloth"}),
    ("Soldering Iron 25W Kit", "सोल्डरिंग आयरन किट", "tools-service", "Soldering Tools", "generic",
     ["Universal"], 850, 549, 18, "computer", {"Power": "25W", "Includes": "Iron + Wire + Stand"}),
]

# Popular printer models for "Shop by Printer" sections
PRINTER_MODELS = [
    {"brand": "HP", "model": "HP LaserJet 1020"}, {"brand": "HP", "model": "HP LaserJet M1005 MFP"},
    {"brand": "HP", "model": "HP LaserJet M1136 MFP"}, {"brand": "HP", "model": "HP LaserJet P1108"},
    {"brand": "Canon", "model": "Canon LBP2900"}, {"brand": "Canon", "model": "Canon MF3010"},
    {"brand": "Canon", "model": "Canon iR2520"}, {"brand": "Epson", "model": "Epson L3110"},
    {"brand": "Epson", "model": "Epson L360"}, {"brand": "Epson", "model": "Epson L380"},
    {"brand": "Brother", "model": "Brother HL-L2321D"}, {"brand": "Brother", "model": "Brother DCP-L2520D"},
]

BLOG = [
    ("How to Replace a Printer Pickup Roller", "A step-by-step guide to fixing paper feed issues by replacing your printer's pickup roller safely.", "printer-maintenance"),
    ("Toner vs Ink: Which Cartridge Should You Buy?", "Understand the difference between laser toner and inkjet ink, and how to pick the right consumable for your printer.", "buying-guide"),
    ("Top 5 Signs Your Laptop Battery Needs Replacement", "Learn the warning signs of a failing laptop battery and how to find a compatible replacement.", "laptop-care"),
    ("HP LaserJet 1020 Common Problems & Fixes", "Paper jams, faded prints and pickup issues on the HP LaserJet 1020 — and the exact parts that fix them.", "printer-maintenance"),
]

PINCODES = [
    {"pincode": "110001", "zone": "North - Delhi NCR", "shipping_charge": 0, "cod_available": True, "free_above": 999},
    {"pincode": "400001", "zone": "West - Mumbai", "shipping_charge": 49, "cod_available": True, "free_above": 1499},
    {"pincode": "560001", "zone": "South - Bengaluru", "shipping_charge": 49, "cod_available": True, "free_above": 1499},
    {"pincode": "700001", "zone": "East - Kolkata", "shipping_charge": 79, "cod_available": True, "free_above": 1999},
    {"pincode": "600001", "zone": "South - Chennai", "shipping_charge": 59, "cod_available": False, "free_above": 1999},
    {"pincode": "500001", "zone": "South - Hyderabad", "shipping_charge": 59, "cod_available": True, "free_above": 1499},
]

SETTINGS = {
    "id": "global", "store_name": "PartStation.in", "tagline": "Your Parts Destination",
    "support_email": "support@partstation.in", "whatsapp_number": "919999999999", "phone": "+91 99999 99999",
    "address": "PartStation Warehouse, New Delhi, India", "gstin": "07AABCP1234C1Z5",
    "default_shipping_charge": 99, "free_shipping_above": 2499, "default_cod_available": True,
    "social": {"instagram": "", "facebook": "", "youtube": "", "linkedin": ""}, "ga4_id": "",
    "hero_title": "Genuine Printer & IT Spare Parts, Delivered Across India",
    "hero_subtitle": "Toners, ink, printer heads, formatter boards, fusers, laptop & computer parts — GST invoice, COD & fast delivery.",
}


async def reseed_if_needed(db):
    meta = await db.meta.find_one({"id": "seed"})
    if meta and meta.get("version") == SEED_VERSION:
        return
    for c in ["products", "categories", "brands", "blog_posts", "pincode_rules", "printer_models"]:
        await db[c].delete_many({})
    await _seed(db)
    await db.meta.update_one({"id": "seed"}, {"$set": {"id": "seed", "version": SEED_VERSION, "at": now_iso()}}, upsert=True)


async def _seed(db):
    cat_map = {}
    for i, c in enumerate(CATEGORIES):
        doc = {"id": _id(), "slug": c["slug"], "name_en": c["name_en"], "name_hi": c["name_hi"],
               "image": IMG[c["img"]][0], "subcategories": c["subs"], "order": i, "created_at": now_iso()}
        cat_map[c["slug"]] = doc
        await db.categories.insert_one({**doc})

    for b in BRANDS:
        await db.brands.insert_one({"id": _id(), "slug": b["slug"], "name": b["name"], "created_at": now_iso()})

    for idx, p in enumerate(PRODUCTS):
        name_en, name_hi, cat_slug, sub, brand_slug, models, mrp, price, gst, imgkey, specs = p
        brand_name = next((b["name"] for b in BRANDS if b["slug"] == brand_slug), "Generic")
        cat = cat_map[cat_slug]
        await db.products.insert_one({
            "id": _id(), "sku": f"PS-{1000 + idx}", "part_number": f"PN-{cat_slug[:3].upper()}-{1000 + idx}",
            "name_en": name_en, "name_hi": name_hi, "slug": slugify(name_en) + f"-{1000 + idx}",
            "short_description": f"{name_en} — genuine quality part compatible with {models[0]}.",
            "long_description": f"{name_en} is a high-quality replacement compatible with {', '.join(models)}. "
                                f"Comes with GST invoice and India-wide shipping. Category: {cat['name_en']} > {sub}.",
            "brand": brand_name, "brand_slug": brand_slug, "category": cat["name_en"], "category_slug": cat_slug,
            "subcategory": sub, "compatible_models": models, "technical_specs": specs, "images": IMG[imgkey],
            "mrp": mrp, "selling_price": price, "gst_rate": gst,
            "stock_qty": 30 if idx % 6 else 4, "stock_status": "in_stock" if idx % 9 else "low_stock",
            "weight": 0.5, "cod_allowed": True, "pincode_shipping_group": "default",
            "tags": [cat["name_en"], brand_name, sub] + models,
            "seo_title": f"Buy {name_en} Online at Best Price | PartStation.in",
            "seo_description": f"{name_en} for {models[0]}. GST invoice, COD, fast shipping across India.",
            "publish_status": "published", "featured": idx % 4 == 0, "new_arrival": idx % 3 == 0,
            "return_eligible": True, "warranty": specs.get("Warranty", "Limited"),
            "rating": round(3.9 + (idx % 6) * 0.18, 1), "review_count": 8 + idx * 2, "created_at": now_iso(),
        })

    for m in PRINTER_MODELS:
        await db.printer_models.insert_one({"id": _id(), **m, "created_at": now_iso()})

    for title, excerpt, cat in BLOG:
        await db.blog_posts.insert_one({
            "id": _id(), "title": title, "slug": slugify(title), "excerpt": excerpt, "category": cat,
            "content": f"<p>{excerpt}</p><p>This guide from the PartStation.in resource center helps technicians and "
                       f"businesses choose and install the right parts with confidence.</p><h3>Key Points</h3>"
                       f"<ul><li>Always power off before servicing.</li><li>Use genuine compatible parts.</li>"
                       f"<li>Keep your GST invoice for warranty claims.</li></ul>",
            "cover_image": IMG["printer"][0], "author": "PartStation Team", "published": True, "created_at": now_iso(),
        })

    for pc in PINCODES:
        await db.pincode_rules.insert_one({"id": _id(), **pc, "created_at": now_iso()})

    await db.settings.update_one({"id": "global"}, {"$set": SETTINGS}, upsert=True)


async def seed_all(db):
    await reseed_if_needed(db)
