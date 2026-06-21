import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function AdminSettings() {
  const [s, setS] = useState(null);
  useEffect(() => { api.settings().then((d) => setS({ social: {}, ...d })).catch(() => {}); }, []);

  const save = async () => { await api.adminUpdateSettings(s); toast.success("Settings saved"); };
  if (!s) return <div className="text-gray-400">Loading…</div>;
  const set = (k, v) => setS({ ...s, [k]: v });
  const setSocial = (k, v) => setS({ ...s, social: { ...s.social, [k]: v } });

  const field = (k, label) => (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      <input data-testid={`set-${k}`} value={s[k] || ""} onChange={(e) => set(k, e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-cabinet text-2xl font-bold mb-5">Business Settings</h1>

      <div className="border border-gray-200 rounded-sm p-5 bg-white mb-4">
        <h2 className="font-cabinet font-bold mb-3">Store & GST</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {field("store_name", "Store Name")}
          {field("tagline", "Tagline")}
          {field("gstin", "GSTIN")}
          {field("support_email", "Support Email")}
          {field("phone", "Phone")}
          {field("whatsapp_number", "WhatsApp Number")}
          <div className="md:col-span-2">{field("address", "Address")}</div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-sm p-5 bg-white mb-4">
        <h2 className="font-cabinet font-bold mb-3">Shipping Defaults</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="label-xs block mb-1">Default Shipping Charge ₹</label><input type="number" value={s.default_shipping_charge || 0} onChange={(e) => set("default_shipping_charge", Number(e.target.value))} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
          <div><label className="label-xs block mb-1">Free Shipping Above ₹</label><input type="number" value={s.free_shipping_above || 0} onChange={(e) => set("free_shipping_above", Number(e.target.value))} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-sm p-5 bg-white mb-4">
        <h2 className="font-cabinet font-bold mb-3">Homepage Hero</h2>
        <div className="space-y-3">
          {field("hero_title", "Hero Title")}
          <div><label className="label-xs block mb-1">Hero Subtitle</label><textarea value={s.hero_subtitle || ""} onChange={(e) => set("hero_subtitle", e.target.value)} rows={2} className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm" /></div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-sm p-5 bg-white mb-4">
        <h2 className="font-cabinet font-bold mb-3">Social & Analytics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="label-xs block mb-1">Instagram</label><input value={s.social?.instagram || ""} onChange={(e) => setSocial("instagram", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
          <div><label className="label-xs block mb-1">Facebook</label><input value={s.social?.facebook || ""} onChange={(e) => setSocial("facebook", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
          <div><label className="label-xs block mb-1">YouTube</label><input value={s.social?.youtube || ""} onChange={(e) => setSocial("youtube", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
          <div><label className="label-xs block mb-1">LinkedIn</label><input value={s.social?.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm" /></div>
          {field("ga4_id", "Google Analytics 4 ID")}
        </div>
      </div>

      <button data-testid="save-settings-btn" onClick={save} className="h-10 px-6 bg-brand text-white rounded-sm text-sm font-medium">Save Settings</button>
    </div>
  );
}
