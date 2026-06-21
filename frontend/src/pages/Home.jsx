import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Printer, BadgeIndianRupee, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { api } from "../lib/api";
import { ProductCard } from "../components/storefront/ProductCard";

const HERO = "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=1200&q=80";

const Rail = ({ title, link, products }) => (
  <section className="bg-white rounded-lg border border-slate-200 mt-3">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <h2 className="font-display text-lg sm:text-xl font-bold text-ink">{title}</h2>
      {link && <Link to={link} className="text-sm font-semibold text-brand flex items-center gap-1">View All <ChevronRight size={16} /></Link>}
    </div>
    <div className="flex gap-3 overflow-x-auto no-scrollbar p-3 sm:grid sm:grid-cols-3 lg:grid-cols-6">
      {products.map((p) => (
        <div key={p.id} className="min-w-[160px] sm:min-w-0"><ProductCard product={p} /></div>
      ))}
    </div>
  </section>
);

export default function Home() {
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
    api.brands().then(setBrands).catch(() => {});
    api.printerModels().then(setModels).catch(() => {});
    api.products({ featured: true, limit: 12 }).then((d) => setFeatured(d.items)).catch(() => {});
    api.products({ new_arrival: true, limit: 12, sort: "newest" }).then((d) => setNewArr(d.items)).catch(() => {});
    api.settings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-8 py-3">
      {/* Hero */}
      <section className="relative rounded-lg overflow-hidden bg-brand-dark">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative px-5 sm:px-10 py-8 sm:py-12 max-w-2xl">
          <span className="inline-block bg-brand-orange text-white text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide">India's Spare Parts Marketplace</span>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-3 leading-[1.1]">
            {settings?.hero_title || "Genuine Printer & IT Spare Parts, Delivered Across India"}
          </h1>
          <p className="text-white/80 mt-3 text-sm sm:text-base">
            {settings?.hero_subtitle || "Toners, ink, printer heads, fusers, laptop & computer parts — GST invoice, COD & fast delivery."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/shop" data-testid="hero-shop-btn" className="h-11 px-6 bg-brand-orange text-white rounded-md font-semibold flex items-center gap-2 hover:bg-brand-orange-hover transition-colors">Shop Now <ArrowRight size={18} /></Link>
            <Link to="/shop?category=printer-consumables" className="h-11 px-6 bg-white/15 border border-white/25 text-white rounded-md font-semibold flex items-center hover:bg-white/25 transition-colors">Toner & Ink</Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {[[BadgeIndianRupee, "GST Invoice"], [Truck, "India-wide Shipping"], [CreditCard, "COD Available"], [ShieldCheck, "Genuine Parts"]].map(([Icon, label], i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-2.5">
            <Icon size={22} className="text-brand shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Category circles */}
      <section className="bg-white rounded-lg border border-slate-200 mt-3 p-4">
        <h2 className="font-display text-lg sm:text-xl font-bold text-ink mb-4">Shop by Category</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {cats.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} data-testid={`home-cat-${c.slug}`} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-brand transition-colors">
                <img src={c.image} alt={c.name_en} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] sm:text-xs text-center text-slate-700 font-medium leading-tight line-clamp-2">{c.name_en}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by printer model */}
      <section className="bg-white rounded-lg border border-slate-200 mt-3 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Printer size={20} className="text-brand" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink">Shop by Printer Model</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
          {models.map((m) => (
            <Link key={m.id} to={`/shop?model=${encodeURIComponent(m.model)}`} className="shrink-0 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:border-brand hover:text-brand transition-colors">
              {m.model}
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Best Sellers" link="/shop?sort=rating" products={featured.slice(0, 12)} />

      {/* Brand strip */}
      <section className="bg-white rounded-lg border border-slate-200 mt-3 p-4">
        <h2 className="font-display text-lg sm:text-xl font-bold text-ink mb-4">Top Brands</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
          {brands.map((b) => (
            <Link key={b.id} to={`/shop?brand=${b.slug}`} className="shrink-0 px-5 py-3 border border-slate-200 rounded-md font-display font-bold text-slate-600 hover:border-brand hover:text-brand transition-colors bg-white text-sm">
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <Rail title="New Arrivals" link="/shop?sort=newest" products={newArr.slice(0, 12)} />

      {/* Blog CTA */}
      <section className="bg-brand-dark text-white rounded-lg mt-3 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold">Repair Guides & Buying Tips</h2>
          <p className="text-white/70 text-sm mt-1">Learn which part fixes your printer — from our resource center.</p>
        </div>
        <Link to="/blog" className="h-11 px-6 bg-white text-brand rounded-md font-semibold flex items-center gap-2 shrink-0">Read the Blog <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
