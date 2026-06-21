import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { toast } from "sonner";

const blank = { pincode: "", zone: "", shipping_charge: 0, free_above: 2499, cod_available: true };

export default function AdminPincodes() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(blank);
  const load = () => api.adminPincodes().then(setRules).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!/^\d{6}$/.test(form.pincode)) return toast.error("Enter a valid 6-digit pincode");
    await api.adminCreatePincode({ ...form, shipping_charge: Number(form.shipping_charge), free_above: Number(form.free_above) });
    toast.success("Pincode rule added");
    setForm(blank); load();
  };
  const del = async (id) => { if (!window.confirm("Delete rule?")) return; await api.adminDeletePincode(id); load(); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-cabinet text-2xl font-bold mb-2">Shipping / Pincode Rules</h1>
      <p className="text-sm text-gray-500 mb-5">Set shipping charge, free-shipping threshold and COD availability per pincode.</p>

      <div className="border border-gray-200 rounded-sm p-4 bg-white mb-6 grid md:grid-cols-6 gap-2 items-end">
        <div><label className="label-xs block mb-1">Pincode</label><input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Zone</label><input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Charge ₹</label><input type="number" value={form.shipping_charge} onChange={(e) => setForm({ ...form, shipping_charge: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <div><label className="label-xs block mb-1">Free above ₹</label><input type="number" value={form.free_above} onChange={(e) => setForm({ ...form, free_above: e.target.value })} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        <label className="flex items-center gap-2 text-sm h-9"><input type="checkbox" checked={form.cod_available} onChange={(e) => setForm({ ...form, cod_available: e.target.checked })} className="accent-brand" /> COD</label>
        <button onClick={create} className="h-9 bg-brand text-white rounded-sm text-sm font-medium flex items-center justify-center gap-1"><Plus size={16} /> Add</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2.5">Pincode</th><th className="px-4 py-2.5">Zone</th><th className="px-4 py-2.5">Charge</th><th className="px-4 py-2.5">Free Above</th><th className="px-4 py-2.5">COD</th><th className="px-4 py-2.5"></th></tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5 font-mono">{r.pincode}</td>
                <td className="px-4 py-2.5">{r.zone}</td>
                <td className="px-4 py-2.5">{r.shipping_charge === 0 ? "FREE" : inr(r.shipping_charge)}</td>
                <td className="px-4 py-2.5">{inr(r.free_above)}</td>
                <td className="px-4 py-2.5">{r.cod_available ? "✓" : "✕"}</td>
                <td className="px-4 py-2.5"><button onClick={() => del(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
