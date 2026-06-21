import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { toast } from "sonner";

const blank = {
  sku: "", part_number: "", name_en: "", name_hi: "", short_description: "", long_description: "",
  brand: "", category: "", category_slug: "", subcategory: "", mrp: "", selling_price: "", gst_rate: 18,
  stock_qty: 0, weight: 0.5, warranty: "", publish_status: "published", featured: false, new_arrival: false,
  compatible_models_str: "", images_str: "", tags_str: "", specs_str: "",
};

function ProductForm({ initial, cats, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF({ ...f, [k]: v });

  const save = async () => {
    if (!f.name_en || !f.selling_price) return toast.error("Name and selling price are required");
    setBusy(true);
    const specs = {};
    (f.specs_str || "").split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) specs[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    const cat = cats.find((c) => c.slug === f.category_slug);
    const payload = {
      ...f,
      category: cat ? cat.name_en : f.category,
      mrp: Number(f.mrp) || 0, selling_price: Number(f.selling_price), gst_rate: Number(f.gst_rate),
      stock_qty: Number(f.stock_qty), weight: Number(f.weight),
      compatible_models: (f.compatible_models_str || "").split(",").map((s) => s.trim()).filter(Boolean),
      images: (f.images_str || "").split(",").map((s) => s.trim()).filter(Boolean),
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

  const input = (k, label, type = "text") => (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      <input data-testid={`pf-${k}`} type={type} value={f[k]} onChange={(e) => set(k, e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm focus:outline-none focus:border-brand" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-cabinet font-bold text-lg">{f.id ? "Edit" : "New"} Product</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {input("name_en", "Name (English)")}
          {input("name_hi", "Name (Hindi)")}
          {input("sku", "SKU")}
          {input("part_number", "Part Number")}
          <div>
            <label className="label-xs block mb-1">Category</label>
            <select value={f.category_slug} onChange={(e) => set("category_slug", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm">
              <option value="">Select</option>
              {cats.map((c) => <option key={c.id} value={c.slug}>{c.name_en}</option>)}
            </select>
          </div>
          {input("subcategory", "Subcategory")}
          {input("brand", "Brand")}
          {input("warranty", "Warranty")}
          {input("mrp", "MRP", "number")}
          {input("selling_price", "Selling Price", "number")}
          {input("gst_rate", "GST %", "number")}
          {input("stock_qty", "Stock Qty", "number")}
          <div className="col-span-2">
            <label className="label-xs block mb-1">Short Description</label>
            <input value={f.short_description} onChange={(e) => set("short_description", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label-xs block mb-1">Long Description</label>
            <textarea value={f.long_description} onChange={(e) => set("long_description", e.target.value)} rows={3} className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label-xs block mb-1">Image URLs (comma separated)</label>
            <input data-testid="pf-images" value={f.images_str} onChange={(e) => set("images_str", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label-xs block mb-1">Compatible Models (comma separated)</label>
            <input value={f.compatible_models_str} onChange={(e) => set("compatible_models_str", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label-xs block mb-1">Specs (one per line, Key: Value)</label>
            <textarea value={f.specs_str} onChange={(e) => set("specs_str", e.target.value)} rows={3} placeholder="Type: Roller&#10;Warranty: 6 Months" className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm font-mono" />
          </div>
          <div className="col-span-2 flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-brand" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.new_arrival} onChange={(e) => set("new_arrival", e.target.checked)} className="accent-brand" /> New Arrival</label>
            <select value={f.publish_status} onChange={(e) => set("publish_status", e.target.value)} className="h-9 border border-gray-300 rounded-sm px-2 text-sm ml-auto">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button data-testid="pf-save" disabled={busy} onClick={save} className="h-10 px-5 bg-brand text-white rounded-sm text-sm font-medium disabled:bg-gray-300">{busy ? "Saving…" : "Save Product"}</button>
          <button onClick={onClose} className="h-10 px-5 border border-gray-300 rounded-sm text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const load = () => api.adminProducts({ q, page, limit: 20 }).then(setData).catch(() => {});
  useEffect(() => { load(); }, [q, page]);
  useEffect(() => { api.categories().then(setCats).catch(() => {}); }, []);

  const openEdit = (p) => setEditing({
    ...blank, ...p,
    compatible_models_str: (p.compatible_models || []).join(", "),
    images_str: (p.images || []).join(", "),
    tags_str: (p.tags || []).join(", "),
    specs_str: Object.entries(p.technical_specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n"),
  });

  const del = async (id) => { if (!window.confirm("Delete this product?")) return; await api.adminDeleteProduct(id); toast.success("Deleted"); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cabinet text-2xl font-bold">Products <span className="text-gray-400 text-base">({data.total})</span></h1>
        <button data-testid="admin-new-product-btn" onClick={() => setEditing(blank)} className="h-10 px-4 bg-brand text-white rounded-sm text-sm font-medium flex items-center gap-2"><Plus size={16} /> New Product</button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input data-testid="admin-product-search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or SKU" className="w-full h-9 border border-gray-300 rounded-sm pl-9 pr-3 text-sm" />
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5">SKU</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5 text-right">Price</th><th className="px-4 py-2.5">Stock</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5"></th></tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100" data-testid={`admin-product-${p.sku}`}>
                <td className="px-4 py-2.5 flex items-center gap-2">
                  <img src={p.images?.[0]} alt="" className="w-9 h-9 object-cover rounded-sm border border-gray-100" />
                  <span className="font-medium line-clamp-1 max-w-[200px]">{p.name_en}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-2.5 text-xs">{p.category}</td>
                <td className="px-4 py-2.5 text-right">{inr(p.selling_price)}</td>
                <td className="px-4 py-2.5">{p.stock_qty}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-sm ${p.publish_status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>{p.publish_status}</span></td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} data-testid={`edit-${p.sku}`} className="text-gray-500 hover:text-brand"><Edit size={16} /></button>
                    <button onClick={() => del(p.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex gap-1 mt-4">
          {Array.from({ length: data.pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-sm text-sm border ${page === i + 1 ? "bg-brand text-white border-brand" : "border-gray-300"}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {editing && <ProductForm initial={editing} cats={cats} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
