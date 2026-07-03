import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Edit, Trash2, X, Eye, EyeOff, Upload, Link2, Loader2 } from "lucide-react";
import { api, BACKEND_URL } from "../lib/api";
import { inr } from "../lib/format";
import { toast } from "sonner";

const blank = {
  name_en: "", name_hi: "", sku: "", part_number: "", brand: "", category_slug: "", category: "", subcategory: "",
  mrp: "", selling_price: "", gst_rate: 18, stock_qty: 0, min_order_qty: 1, free_shipping_qty: 0, weight: 0.5,
  warranty: "", publish_status: "published", featured: false, new_arrival: false,
  compatible_models_str: "", tags_str: "", specs_str: "", short_description: "", long_description: "",
  images: [],
};

function ProductForm({ initial, cats, brands, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const fileRef = useRef();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const activeCat = cats.find((c) => c.slug === f.category_slug);

  const addUrl = () => {
    if (imgUrl.trim().startsWith("http")) { set("images", [...f.images, imgUrl.trim()]); setImgUrl(""); }
    else toast.error("Enter a valid image URL");
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api.adminUploadImage(fd);
        urls.push(`${BACKEND_URL}${r.file_url}`);
      } catch (err) { toast.error(err.response?.data?.detail || `Upload failed: ${file.name}`); }
    }
    set("images", [...f.images, ...urls]);
    setUploading(false);
    if (urls.length) toast.success(`${urls.length} image(s) uploaded`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImg = (i) => set("images", f.images.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!f.name_en) return toast.error("Product name is required");
    if (!f.selling_price) return toast.error("Selling price is required");
    if (!f.category_slug) return toast.error("Please select a category");
    setBusy(true);
    const specs = {};
    (f.specs_str || "").split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) specs[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    const payload = {
      ...f, category: activeCat ? activeCat.name_en : f.category,
      category_id: activeCat ? activeCat.id : (f.category_id || ""),
      mrp: Number(f.mrp) || 0, selling_price: Number(f.selling_price), gst_rate: Number(f.gst_rate),
      stock_qty: Number(f.stock_qty), min_order_qty: Number(f.min_order_qty) || 1, free_shipping_qty: Number(f.free_shipping_qty) || 0,
      weight: Number(f.weight),
      compatible_models: (f.compatible_models_str || "").split(",").map((s) => s.trim()).filter(Boolean),
      tags: (f.tags_str || "").split(",").map((s) => s.trim()).filter(Boolean),
      technical_specs: specs,
    };
    try {
      if (f.id) await api.adminUpdateProduct(f.id, payload);
      else await api.adminCreateProduct(payload);
      toast.success("Product saved");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
    finally { setBusy(false); }
  };

  const input = (k, label, type = "text", ph = "") => (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      <input data-testid={`pf-${k}`} type={type} placeholder={ph} value={f[k]} onChange={(e) => set(k, e.target.value)} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm focus:outline-none focus:border-brand" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[94vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-lg">{f.id ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basics */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">1. Product Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">{input("name_en", "Product Name (English)", "text", "e.g. HP 88A Toner Cartridge")}</div>
              <div>
                <label className="label-xs block mb-1">Brand</label>
                <select data-testid="pf-brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm">
                  <option value="">Select brand</option>
                  {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xs block mb-1">SKU (auto-generated if blank)</label>
                <input data-testid="pf-sku" placeholder="Auto: BRAND-CAT-0001" value={f.sku} onChange={(e) => set("sku", e.target.value)} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm" />
              </div>
              <div>
                <label className="label-xs block mb-1">Category</label>
                <select data-testid="pf-category" value={f.category_slug} onChange={(e) => { set("category_slug", e.target.value); set("subcategory", ""); }} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm">
                  <option value="">Select category</option>
                  {cats.map((c) => <option key={c.id} value={c.slug}>{c.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xs block mb-1">Subcategory</label>
                <select data-testid="pf-subcategory" value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} disabled={!activeCat} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm disabled:bg-slate-50">
                  <option value="">{activeCat ? "Select subcategory" : "Pick a category first"}</option>
                  {activeCat?.subcategories?.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Compatibility */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">2. Compatibility — Which printers / devices does it work with?</h3>
            <label className="label-xs block mb-1">Compatible Models (comma separated)</label>
            <input data-testid="pf-models" value={f.compatible_models_str} onChange={(e) => set("compatible_models_str", e.target.value)} placeholder="HP LaserJet 1020, HP LaserJet M1005 MFP" className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm" />
          </section>

          {/* Pricing & stock */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">3. Pricing, Stock & Delivery Rules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {input("mrp", "MRP (₹)", "number")}
              {input("selling_price", "Selling Price (₹)", "number")}
              {input("gst_rate", "GST %", "number")}
              {input("stock_qty", "Stock Quantity", "number")}
              {input("min_order_qty", "Min Order Qty", "number")}
              {input("free_shipping_qty", "Free Delivery at Qty", "number", "0 = off")}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Min Order Qty is useful for low-priced items. "Free Delivery at Qty" = order this many units of this product and shipping is free (0 disables it).</p>
          </section>

          {/* Images */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">4. Images (upload or paste a link)</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {f.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 border border-slate-200 rounded-md overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImg(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={12} /></button>
                </div>
              ))}
              {f.images.length === 0 && <span className="text-xs text-slate-400 py-6">No images yet</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="pf-upload-btn" className="h-9 px-3 border border-slate-300 rounded-md text-sm flex items-center gap-1.5 hover:border-brand disabled:opacity-50">
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload Images
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" data-testid="pf-file-input" />
              <div className="flex gap-1 flex-1 min-w-[200px]">
                <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Paste image URL (e.g. from Google)" className="flex-1 h-9 border border-slate-300 rounded-md px-2 text-sm" data-testid="pf-img-url" />
                <button type="button" onClick={addUrl} className="h-9 px-3 bg-slate-100 rounded-md text-sm flex items-center gap-1"><Link2 size={15} /> Add</button>
              </div>
            </div>
          </section>

          {/* Descriptions & meta */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">5. Description & Extras</h3>
            <div className="space-y-3">
              <div>
                <label className="label-xs block mb-1">Short Description</label>
                <input value={f.short_description} onChange={(e) => set("short_description", e.target.value)} className="w-full h-9 border border-slate-300 rounded-md px-2 text-sm" />
              </div>
              <div>
                <label className="label-xs block mb-1">Long Description</label>
                <textarea value={f.long_description} onChange={(e) => set("long_description", e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {input("warranty", "Warranty")}
                {input("tags_str", "Tags (comma separated)")}
              </div>
              <div>
                <label className="label-xs block mb-1">Specs (one per line, Key: Value)</label>
                <textarea value={f.specs_str} onChange={(e) => set("specs_str", e.target.value)} rows={3} placeholder={"Yield: 1500 pages\nColour: Black"} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm font-mono" />
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-brand" /> Featured</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.new_arrival} onChange={(e) => set("new_arrival", e.target.checked)} className="accent-brand" /> New Arrival</label>
                <label className="flex items-center gap-2 text-sm ml-auto">Status
                  <select value={f.publish_status} onChange={(e) => set("publish_status", e.target.value)} className="h-9 border border-slate-300 rounded-md px-2 text-sm">
                    <option value="published">Published</option><option value="draft">Hidden (Draft)</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="flex gap-2 px-5 py-3 border-t border-slate-200 sticky bottom-0 bg-white">
          <button data-testid="pf-save" disabled={busy} onClick={save} className="h-10 px-6 bg-brand text-white rounded-md text-sm font-semibold disabled:bg-slate-300">{busy ? "Saving…" : "Save Product"}</button>
          <button onClick={onClose} className="h-10 px-5 border border-slate-300 rounded-md text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const stockFilter = params.get("stock") || "";
  const statusFilter = params.get("status") || "";

  const load = () => api.adminProducts({ q, page, limit: 20, stock: stockFilter || undefined, status: statusFilter || undefined }).then(setData).catch(() => {});
  useEffect(() => { load(); }, [q, page, stockFilter, statusFilter]);
  useEffect(() => { api.categories().then(setCats).catch(() => {}); api.brands().then(setBrands).catch(() => {}); }, []);

  const setFilter = (key, val) => { const n = new URLSearchParams(params); if (val) n.set(key, val); else n.delete(key); setParams(n); setPage(1); };

  const openEdit = (p) => setEditing({
    ...blank, ...p, category_slug: p.category_slug || "",
    compatible_models_str: (p.compatible_models || []).join(", "),
    tags_str: (p.tags || []).join(", "),
    specs_str: Object.entries(p.technical_specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n"),
    images: p.images || [],
  });

  const del = async (id) => { if (!window.confirm("Delete this product?")) return; await api.adminDeleteProduct(id); toast.success("Deleted"); load(); };
  const toggleVis = async (p) => { const r = await api.adminToggleVisibility(p.id); toast.success(r.publish_status === "published" ? "Product is now visible" : "Product hidden"); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold">Products <span className="text-slate-400 text-base">({data.total})</span></h1>
        <button data-testid="admin-new-product-btn" onClick={() => setEditing(blank)} className="h-10 px-4 bg-brand text-white rounded-md text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input data-testid="admin-product-search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, SKU, brand, category, model…" className="w-full h-9 border border-slate-300 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:border-brand" />
        </div>
        <select value={stockFilter} onChange={(e) => setFilter("stock", e.target.value)} className="h-9 border border-slate-300 rounded-md px-2 text-sm" data-testid="filter-stock">
          <option value="">All Stock</option><option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option>
        </select>
        <select value={statusFilter} onChange={(e) => setFilter("status", e.target.value)} className="h-9 border border-slate-300 rounded-md px-2 text-sm" data-testid="filter-status">
          <option value="">All Status</option><option value="published">Published</option><option value="draft">Hidden</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5">SKU</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5 text-right">Price</th><th className="px-4 py-2.5">Stock</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100" data-testid={`admin-product-${p.sku}`}>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2"><img src={p.images?.[0]} alt="" className="w-9 h-9 object-cover rounded border border-slate-100" /><span className="font-medium line-clamp-1 max-w-[220px]">{p.name_en}</span></div></td>
                <td className="px-4 py-2.5 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-2.5 text-xs">{p.category}</td>
                <td className="px-4 py-2.5 text-right">{inr(p.selling_price)}</td>
                <td className="px-4 py-2.5"><span className={p.stock_status === "out_of_stock" ? "text-red-600" : p.stock_status === "low_stock" ? "text-amber-600" : "text-emerald-600"}>{p.stock_qty}</span></td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${p.publish_status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{p.publish_status === "published" ? "Visible" : "Hidden"}</span></td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => toggleVis(p)} data-testid={`toggle-vis-${p.sku}`} title={p.publish_status === "published" ? "Hide" : "Show"} className="text-slate-500 hover:text-brand">{p.publish_status === "published" ? <Eye size={17} /> : <EyeOff size={17} />}</button>
                    <button onClick={() => openEdit(p)} data-testid={`edit-${p.sku}`} className="text-slate-500 hover:text-brand"><Edit size={16} /></button>
                    <button onClick={() => del(p.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No products found</td></tr>}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex gap-1 mt-4 flex-wrap">
          {Array.from({ length: data.pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-md text-sm border ${page === i + 1 ? "bg-brand text-white border-brand" : "border-slate-300"}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {editing && <ProductForm initial={editing} cats={cats} brands={brands} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
