import { useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Package, Upload, FolderTree, Tag, ShoppingBag, Users, MapPin, FileText, Settings, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../lib/brand";

const nav = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/import", icon: Upload, label: "Bulk Import" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories" },
  { to: "/admin/brands", icon: Tag, label: "Brands" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/pincodes", icon: MapPin, label: "Shipping / Pincodes" },
  { to: "/admin/blog", icon: FileText, label: "Blog" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/login?redirect=/admin");
  }, [user, loading, navigate]);

  if (loading || !user) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-ink text-gray-300 flex flex-col fixed h-full">
        <div className="p-4 flex items-center gap-2 border-b border-white/10">
          <div className="w-9 h-9 bg-black rounded-sm overflow-hidden flex items-center justify-center">
            <img src={BRAND.logoIcon} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="font-cabinet font-black text-white leading-none">
            PartStation<span className="text-brand-orange">.in</span>
            <span className="block text-[9px] text-gray-500 tracking-wider mt-0.5">ADMIN PANEL</span>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.label.toLowerCase().split(" ")[0]}`}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-brand text-white" : "hover:bg-white/5 hover:text-white"}`}
            >
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-2 py-2 text-sm hover:text-white"><ExternalLink size={16} /> View Store</Link>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 px-2 py-2 text-sm hover:text-red-400 w-full"><LogOut size={16} /> Logout</button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-6">
        <Outlet />
      </main>
    </div>
  );
}
