import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name_en: "", name_hi: "", image: "", subs: "" });

  const load = () => api.categories().then(setCats).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name_en) return toast.error("Name required");
    await api.adminCreateCategory({
      name_en: form.name_en, name_hi: form.name_hi, image: form.image,
      subcategories: form.subs.split(",").map((s) => s.trim()).filter(Boolean),
    });
    toast.success("Category added");
    setForm({ name_en: "", name_hi: "", image: "", subs: "" });
    load();
  };

  const del = async (id) => { if (!window.confirm("Delete category?")) return; await api.adminDeleteCategory(id); load(); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-cabinet text-2xl font-bold mb-5">Categories</h1>
      <div className="border border-gray-200 rounded-sm p-4 bg-white mb-6 grid md:grid-cols-5 gap-2 items-end">
        <div><label className="label-xs block mb-1">Name (EN)</label><input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Name (HI)</label><input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Subcats (comma)</label><input value={form.subs} onChange={(e) => setForm({ ...form, subs: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <button onClick={create} className="h-9 bg-brand text-white rounded-sm text-sm font-medium flex items-center justify-center gap-1"><Plus size={16} /> Add</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {cats.map((c) => (
          <div key={c.id} className="border border-gray-200 rounded-sm p-4 bg-white flex gap-3">
            {c.image && <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-sm" />}
            <div className="flex-1">
              <div className="font-medium">{c.name_en} <span className="text-gray-400 text-sm">{c.name_hi}</span></div>
              <div className="text-xs text-gray-500 mt-1">{c.subcategories?.join(", ")}</div>
            </div>
            <button onClick={() => del(c.id)} className="text-gray-400 hover:text-red-600 self-start"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
