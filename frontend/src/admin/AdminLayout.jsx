import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Package, Upload, FolderTree, Tag, ShoppingBag, Users, MapPin, FileText, Settings, LogOut, ExternalLink, Menu, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/admin/login");
  }, [user, loading, navigate]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-slate-400 bg-slate-900">Loading…</div>;

  const Sidebar = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-white/10">
        <div className="w-9 h-9 bg-white rounded-md overflow-hidden p-0.5 flex items-center justify-center"><img src={BRAND.logoIcon} alt="" className="w-full h-full object-contain" /></div>
        <div className="font-display font-extrabold text-white leading-none text-sm">PartStation<span className="text-brand-orange">.in</span><span className="block text-[9px] text-slate-500 tracking-wider mt-0.5">ADMIN PANEL</span></div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} data-testid={`admin-nav-${n.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-brand text-white" : "hover:bg-white/5 hover:text-white"}`}>
            <n.icon size={18} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 text-sm hover:text-white"><ExternalLink size={16} /> View Store</Link>
        <button onClick={() => { logout(); navigate("/admin/login"); }} className="flex items-center gap-2 px-2 py-2 text-sm hover:text-red-400 w-full"><LogOut size={16} /> Logout</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:block fixed h-full">{Sidebar}</div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white h-14 flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} data-testid="admin-menu-btn"><Menu size={24} /></button>
        <span className="font-display font-extrabold">PartStation<span className="text-brand-orange">.in</span> Admin</span>
        <button onClick={() => { logout(); navigate("/admin/login"); }}><LogOut size={20} /></button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <button onClick={() => setOpen(false)} className="absolute top-3 -right-10 text-white"><X size={24} /></button>
            {Sidebar}
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pt-18 lg:pt-6 mt-14 lg:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
