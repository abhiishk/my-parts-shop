import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, MapPin, Heart, Headphones } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { api } from "../../lib/api";
import { BRAND } from "../../lib/brand";

export const Header = ({ settings }) => {
  const { count } = useCart();
  const { user } = useAuth();
  const { t, lang, toggle } = useI18n();
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => { api.categories().then(setCats).catch(() => {}); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setMobileOpen(false); }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="bg-brand-dark text-white/90 text-xs hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><MapPin size={13} /> Deliver across India · GST Invoice on every order</span>
          <div className="flex items-center gap-5">
            <button data-testid="lang-toggle" onClick={toggle} className="hover:text-white font-semibold">{lang === "en" ? "हिन्दी" : "English"}</button>
            <Link to="/account" className="hover:text-white">Track Order</Link>
            <a href={`https://wa.me/${settings?.whatsapp_number || "919999999999"}`} className="hover:text-white flex items-center gap-1"><Headphones size={13} /> {settings?.phone}</a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-brand text-white">
        <div className="max-w-[1400px] mx-auto px-3 lg:px-8 h-14 md:h-16 flex items-center gap-3">
          <button className="lg:hidden p-1" onClick={() => setMobileOpen(true)} data-testid="mobile-menu-btn"><Menu size={24} /></button>

          <Link to="/" data-testid="logo-link" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-md overflow-hidden flex items-center justify-center p-0.5">
              <img src={BRAND.logoIcon} alt="PartStation.in" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-white">PartStation<span className="text-brand-orange">.in</span></span>
              <span className="block text-[9px] uppercase tracking-[0.15em] text-white/70 mt-0.5">{BRAND.tagline}</span>
            </div>
          </Link>

          {/* Desktop search */}
          <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:flex bg-white rounded-md overflow-hidden">
            <input data-testid="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_placeholder")}
              className="flex-1 h-10 px-4 text-sm text-ink focus:outline-none" />
            <button data-testid="search-submit-button" type="submit" className="h-10 px-5 bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors flex items-center gap-2">
              <Search size={18} /> <span className="hidden lg:inline text-sm font-semibold">Search</span>
            </button>
          </form>

          <div className="flex items-center gap-1 sm:gap-4 ml-auto">
            <Link to="/wishlist" data-testid="wishlist-link" className="p-1.5 hover:text-white/80 hidden sm:flex flex-col items-center text-[11px]">
              <Heart size={20} /> <span className="hidden lg:block">Wishlist</span>
            </Link>
            <Link to={user ? "/account" : "/login"} data-testid="account-link" className="p-1.5 hover:text-white/80 flex flex-col items-center text-[11px]">
              <User size={20} /> <span className="hidden lg:block">{user ? user.name.split(" ")[0] : t("login")}</span>
            </Link>
            <Link to="/cart" data-testid="cart-link" className="p-1.5 hover:text-white/80 relative flex flex-col items-center text-[11px]">
              <div className="relative">
                <ShoppingCart size={20} />
                {count > 0 && <span data-testid="cart-count" className="absolute -top-1.5 -right-2 bg-brand-orange text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">{count}</span>}
              </div>
              <span className="hidden lg:block">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={onSearch} className="md:hidden px-3 pb-2.5 flex bg-white rounded-md mx-3 mb-2 overflow-hidden">
          <input data-testid="search-input-mobile" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_placeholder")}
            className="flex-1 h-9 px-3 text-sm text-ink focus:outline-none" />
          <button type="submit" className="h-9 px-3 text-brand"><Search size={18} /></button>
        </form>
      </div>

      {/* Category nav (desktop) */}
      <nav className="border-b border-slate-200 bg-white hidden lg:block shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center gap-0.5">
          <Link to="/shop" className="px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-brand transition-colors">All Products</Link>
          {cats.map((c) => (
            <div key={c.id} className="relative" onMouseEnter={() => setOpenCat(c.id)} onMouseLeave={() => setOpenCat(null)}>
              <Link to={`/shop?category=${c.slug}`} data-testid={`nav-cat-${c.slug}`} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-brand transition-colors flex items-center gap-1">
                {c.name_en} <ChevronDown size={13} className="opacity-50" />
              </Link>
              {openCat === c.id && c.subcategories?.length > 0 && (
                <div className="absolute top-full left-0 bg-white border border-slate-200 shadow-lg rounded-md w-56 py-2 z-50">
                  {c.subcategories.map((s) => (
                    <Link key={s} to={`/shop?category=${c.slug}&subcategory=${encodeURIComponent(s)}`} className="block px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand transition-colors">{s}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/blog" className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-brand transition-colors ml-auto">Blog</Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-white overflow-y-auto">
            <div className="bg-brand text-white p-4 flex items-center justify-between">
              <span className="font-display font-extrabold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <div className="p-3">
              <button onClick={toggle} className="w-full text-left py-2 px-2 text-sm font-medium text-brand">{lang === "en" ? "Switch to हिन्दी" : "Switch to English"}</button>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-2.5 px-2 font-semibold border-t border-slate-100">All Products</Link>
              {cats.map((c) => (
                <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="block py-2.5 px-2 text-sm text-slate-700 border-t border-slate-100">{c.name_en}</Link>
              ))}
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-2.5 px-2 font-semibold border-t border-slate-100">Blog</Link>
              <Link to={user ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className="block py-2.5 px-2 font-semibold border-t border-slate-100">{user ? "My Account" : "Login / Sign Up"}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
