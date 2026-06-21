import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from "lucide-react";
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

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="bg-ink text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between">
          <span className="hidden sm:inline tracking-wide">GST Invoice • COD Available • India-wide Shipping</span>
          <div className="flex items-center gap-4">
            <button data-testid="lang-toggle" onClick={toggle} className="hover:text-brand transition-colors font-medium">
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
            <span className="hidden sm:inline">{settings?.phone}</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
        <button className="lg:hidden" onClick={() => setMobileOpen(true)} data-testid="mobile-menu-btn">
          <Menu size={24} />
        </button>
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm overflow-hidden">
            <img src={BRAND.logoIcon} alt="PartStation.in" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-cabinet font-black text-xl tracking-tight">
              Part<span className="text-brand">Station</span><span className="text-brand-orange">.in</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.18em] text-gray-400 mt-0.5">{BRAND.tagline}</span>
          </div>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:flex">
          <input
            data-testid="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 h-11 border border-gray-300 border-r-0 rounded-l-sm px-4 text-sm focus:outline-none focus:border-brand"
          />
          <button data-testid="search-submit-button" type="submit" className="h-11 px-5 bg-brand text-white rounded-r-sm hover:bg-brand-hover transition-colors flex items-center gap-2">
            <Search size={18} /> <span className="hidden lg:inline text-sm font-medium">Search</span>
          </button>
        </form>

        <div className="flex items-center gap-1 sm:gap-3 ml-auto">
          <Link to="/wishlist" data-testid="wishlist-link" className="p-2 hover:text-brand transition-colors hidden sm:block">
            <Heart size={22} />
          </Link>
          <Link to={user ? "/account" : "/login"} data-testid="account-link" className="p-2 hover:text-brand transition-colors flex items-center gap-1">
            <User size={22} />
            <span className="hidden lg:inline text-sm">{user ? user.name.split(" ")[0] : t("login")}</span>
          </Link>
          <Link to="/cart" data-testid="cart-link" className="p-2 hover:text-brand transition-colors relative">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span data-testid="cart-count" className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={onSearch} className="md:hidden px-4 pb-3 flex">
        <input
          data-testid="search-input-mobile"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search_placeholder")}
          className="flex-1 h-10 border border-gray-300 border-r-0 rounded-l-sm px-3 text-sm focus:outline-none focus:border-brand"
        />
        <button type="submit" className="h-10 px-4 bg-brand text-white rounded-r-sm">
          <Search size={18} />
        </button>
      </form>

      {/* Category nav */}
      <nav className="border-t border-gray-100 bg-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-1">
          <Link to="/shop" className="px-3 py-2.5 text-sm font-medium hover:text-brand transition-colors">
            {t("shop")}
          </Link>
          {cats.map((c) => (
            <div
              key={c.id}
              className="relative"
              onMouseEnter={() => setOpenCat(c.id)}
              onMouseLeave={() => setOpenCat(null)}
            >
              <Link
                to={`/shop?category=${c.slug}`}
                data-testid={`nav-cat-${c.slug}`}
                className="px-3 py-2.5 text-sm font-medium hover:text-brand transition-colors flex items-center gap-1"
              >
                {c.name_en} <ChevronDown size={14} className="opacity-50" />
              </Link>
              {openCat === c.id && c.subcategories?.length > 0 && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-sm w-56 py-2 z-50">
                  {c.subcategories.map((s) => (
                    <Link
                      key={s}
                      to={`/shop?category=${c.slug}&subcategory=${encodeURIComponent(s)}`}
                      className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/blog" className="px-3 py-2.5 text-sm font-medium hover:text-brand transition-colors ml-auto">
            {t("blog")}
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cabinet font-black text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-2 font-medium">All Products</Link>
            {cats.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700 border-t border-gray-100">
                {c.name_en}
              </Link>
            ))}
            <Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-2 font-medium border-t border-gray-100">Blog</Link>
          </div>
        </div>
      )}
    </header>
  );
};
