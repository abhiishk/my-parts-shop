import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { toast } from "sonner";

const STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
const statusColor = {
  placed: "bg-blue-50 text-brand", confirmed: "bg-indigo-50 text-indigo-600",
  shipped: "bg-amber-50 text-amber-600", delivered: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(null);
  const [tracking, setTracking] = useState("");

  const load = () => api.adminOrders(filter ? { status: filter } : {}).then(setOrders).catch(() => {});
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status, extra = {}) => {
    await api.adminUpdateOrder(id, { status, ...extra });
    toast.success("Order updated");
    load();
    if (active) setActive({ ...active, status, ...extra });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cabinet text-2xl font-bold">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 border border-gray-300 rounded-sm px-2 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Customer</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Payment</th><th className="px-4 py-2.5 text-right">Total</th><th className="px-4 py-2.5">Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => { setActive(o); setTracking(o.tracking_number || ""); }} data-testid={`admin-order-${o.order_number}`}>
                <td className="px-4 py-2.5 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-2.5">{o.user_name}<div className="text-xs text-gray-400">{o.user_email}</div></td>
                <td className="px-4 py-2.5 text-xs">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2.5 text-xs uppercase">{o.payment_method}</td>
                <td className="px-4 py-2.5 text-right font-medium">{inr(o.total)}</td>
                <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-sm text-xs capitalize ${statusColor[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders</td></tr>}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActive(null)} />
          <div className="relative bg-white rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-cabinet font-bold text-lg">{active.order_number}</h2>
              <button onClick={() => setActive(null)}><X size={20} /></button>
            </div>
            <div className="text-sm space-y-1 mb-4">
              <div>{active.user_name} • {active.user_email}</div>
              <div className="text-gray-600">{active.address.line1}, {active.address.city}, {active.address.state} - {active.address.pincode}</div>
              <div className="text-gray-600">Phone: {active.address.phone}</div>
            </div>
            <div className="border border-gray-200 rounded-sm divide-y divide-gray-100 mb-4">
              {active.items.map((it) => (
                <div key={it.product_id} className="flex justify-between p-2 text-sm">
                  <span>{it.name_en} × {it.qty}</span><span>{inr(it.selling_price * it.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between p-2 font-bold"><span>Total</span><span>{inr(active.total)}</span></div>
            </div>

            <label className="label-xs block mb-1">Tracking Number</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm mb-3" />

            <label className="label-xs block mb-2">Update Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} data-testid={`set-status-${s}`} onClick={() => updateStatus(active.id, s, { tracking_number: tracking, payment_status: s === "delivered" && active.payment_method === "cod" ? "paid" : active.payment_status })} className={`px-3 py-1.5 rounded-sm text-sm capitalize border ${active.status === s ? "bg-brand text-white border-brand" : "border-gray-300 hover:border-brand"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
