import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const load = () => api.brands().then(setBrands).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => { if (!name) return; await api.adminCreateBrand({ name }); setName(""); toast.success("Brand added"); load(); };
  const del = async (id) => { if (!window.confirm("Delete brand?")) return; await api.adminDeleteBrand(id); load(); };

  return (
    <div className="max-w-2xl">
      <h1 className="font-cabinet text-2xl font-bold mb-5">Brands</h1>
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand name" className="flex-1 h-9 border border-gray-300 rounded-sm px-3 text-sm" />
        <button onClick={create} className="h-9 px-4 bg-brand text-white rounded-sm text-sm font-medium flex items-center gap-1"><Plus size={16} /> Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-sm bg-white">
            <span className="text-sm font-medium">{b.name}</span>
            <button onClick={() => del(b.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
