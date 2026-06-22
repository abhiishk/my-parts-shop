import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, LogOut, User, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { ADMIN_BASE } from "../lib/routes";

const statusColor = {
  placed: "bg-blue-50 text-brand", confirmed: "bg-indigo-50 text-indigo-600",
  shipped: "bg-amber-50 text-amber-600", delivered: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function Account() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (user) {
      api.myOrders().then(setOrders).catch(() => {});
      api.addresses().then(setAddresses).catch(() => {});
    }
  }, [user, loading, navigate]);

  if (!user) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cabinet text-2xl md:text-3xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link to={ADMIN_BASE} className="h-10 px-4 bg-ink text-white rounded-sm text-sm font-medium flex items-center gap-2"><ShieldCheck size={16} /> Admin</Link>
          )}
          <button onClick={() => { logout(); navigate("/"); }} data-testid="logout-button" className="h-10 px-4 border border-gray-300 rounded-sm text-sm font-medium flex items-center gap-2 hover:border-red-400 hover:text-red-600">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[[Package, "Orders", orders.length], [MapPin, "Addresses", addresses.length], [User, "Member", "Active"]].map(([Icon, label, val], i) => (
          <div key={i} className="border border-gray-200 rounded-sm p-4 flex items-center gap-3">
            <Icon size={24} className="text-brand" />
            <div><div className="font-cabinet font-bold text-xl">{val}</div><div className="text-xs text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      <h2 className="font-cabinet font-bold text-xl mb-3">My Orders</h2>
      {orders.length === 0 ? (
        <div className="border border-gray-200 rounded-sm p-8 text-center text-gray-500">
          No orders yet. <Link to="/shop" className="text-brand">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/account/orders/${o.id}`} data-testid={`order-row-${o.order_number}`} className="block border border-gray-200 rounded-sm p-4 hover:border-brand transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-cabinet font-bold">{o.order_number}</div>
                  <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString("en-IN")} • {o.items.length} item(s)</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-medium capitalize ${statusColor[o.status] || "bg-gray-100"}`}>{o.status}</span>
                  <span className="font-cabinet font-bold">{inr(o.total)}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {addresses.length > 0 && (
        <>
          <h2 className="font-cabinet font-bold text-xl mb-3 mt-8">Saved Addresses</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {addresses.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-sm p-4 text-sm">
                <div className="font-medium">{a.full_name} • {a.phone}</div>
                <div className="text-gray-600">{a.line1}, {a.line2} {a.city}, {a.state} - {a.pincode}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
