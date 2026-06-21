import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, Users, IndianRupee, AlertTriangle, Clock } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";

const statusColor = {
  placed: "bg-blue-50 text-brand", confirmed: "bg-indigo-50 text-indigo-600",
  shipped: "bg-amber-50 text-amber-600", delivered: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.adminStats().then(setStats).catch(() => {}); }, []);
  if (!stats) return <div className="text-gray-400">Loading…</div>;

  const cards = [
    { icon: IndianRupee, label: "Revenue", value: inr(stats.revenue), color: "text-emerald-600" },
    { icon: ShoppingBag, label: "Orders", value: stats.orders, color: "text-brand" },
    { icon: Package, label: "Products", value: stats.products, color: "text-indigo-600" },
    { icon: Users, label: "Customers", value: stats.customers, color: "text-amber-600" },
    { icon: Clock, label: "Pending Orders", value: stats.pending_orders, color: "text-orange-600" },
    { icon: AlertTriangle, label: "Low Stock", value: stats.low_stock, color: "text-red-600" },
  ];

  return (
    <div>
      <h1 className="font-cabinet text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-sm p-4">
            <c.icon size={22} className={c.color} />
            <div className="font-cabinet font-black text-2xl mt-2">{c.value}</div>
            <div className="text-xs text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-cabinet font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-brand">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="text-xs uppercase tracking-wider text-gray-500">
              <th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-2.5">{o.user_name}</td>
                <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-sm text-xs capitalize ${statusColor[o.status]}`}>{o.status}</span></td>
                <td className="px-4 py-2.5 text-right font-medium">{inr(o.total)}</td>
              </tr>
            ))}
            {stats.recent_orders.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
