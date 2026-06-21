import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Printer, Cpu, Laptop, Network } from "lucide-react";
import { api } from "../lib/api";
import { ProductCard } from "../components/storefront/ProductCard";
import { useI18n } from "../context/I18nContext";

const HERO_IMG = "https://images.pexels.com/photos/9574569/pexels-photo-9574569.jpeg?auto=compress&w=1000";

const Section = ({ title, sub, link, children }) => (
  <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="font-cabinet text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      </div>
      {link && (
        <Link to={link} className="text-sm font-medium text-brand hover:underline flex items-center gap-1 shrink-0">
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
    {children}
  </section>
);

export default function Home() {
  const { t } = useI18n();
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
    api.brands().then(setBrands).catch(() => {});
    api.products({ featured: true, limit: 8 }).then((d) => setFeatured(d.items)).catch(() => {});
    api.products({ new_arrival: true, limit: 8, sort: "newest" }).then((d) => setNewArr(d.items)).catch(() => {});
    api.settings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-5 gap-8 items-center py-12 md:py-16">
          <div className="lg:col-span-3">
            <span className="label-xs text-brand">India's Spare Parts Marketplace</span>
            <h1 className="font-cabinet text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-3 leading-[1.05]">
              {settings?.hero_title || "Genuine Printer & IT Spare Parts, Shipped Across India"}
            </h1>
            <p className="text-gray-300 mt-4 text-base md:text-lg max-w-xl">
              {settings?.hero_subtitle || "Printer heads, formatter boards, fusers, laptop & computer parts — with GST invoice, COD and fast delivery."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" data-testid="hero-shop-btn" className="h-12 px-6 bg-brand text-white rounded-sm font-medium flex items-center gap-2 hover:bg-brand-hover transition-colors">
                Browse Parts <ArrowRight size={18} />
              </Link>
              <Link to="/shop?category=printer-parts" className="h-12 px-6 bg-white/10 border border-white/20 text-white rounded-sm font-medium flex items-center hover:bg-white/20 transition-colors">
                Printer Parts
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              <span>✓ GST Invoice</span><span>✓ COD Available</span><span>✓ India-wide Shipping</span><span>✓ Secure Payments</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="aspect-[4/3] rounded-sm overflow-hidden border border-white/10">
              <img src={HERO_IMG} alt="Industrial printing equipment" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories - bento */}
      <Section title="Shop by Category" sub="Find parts fast by category" link="/shop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              data-testid={`home-cat-${c.slug}`}
              className="group relative aspect-[4/3] rounded-sm overflow-hidden border border-gray-200 bg-gray-900"
            >
              <img src={c.image} alt={c.name_en} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <span className="text-white font-cabinet font-bold text-base md:text-lg leading-tight">{c.name_en}</span>
                <span className="text-white/70 text-xs mt-0.5">{c.subcategories?.length} types →</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Best selling */}
      <Section title="Best Selling Parts" sub="Most ordered by technicians & businesses" link="/shop?sort=rating">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* Brands strip */}
      <Section title="Popular Brands" sub="Compatible parts for top printer & IT brands">
        <div className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              to={`/shop?brand=${b.slug}`}
              className="px-5 py-3 border border-gray-200 rounded-sm font-cabinet font-bold text-gray-700 hover:border-brand hover:text-brand transition-colors bg-white"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </Section>

      {/* New arrivals */}
      <Section title="New Arrivals" sub="Latest additions to our catalog" link="/shop?sort=newest">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArr.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* Compatibility CTA */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-cabinet text-2xl md:text-3xl font-bold tracking-tight">Shop by Printer Model</h2>
            <p className="text-gray-600 mt-2">Search your exact printer or laptop model to find guaranteed-compatible spare parts.</p>
            <div className="mt-5 flex gap-2 max-w-md">
              <Link to="/shop?model=HP%20LaserJet" className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm hover:border-brand">HP LaserJet</Link>
              <Link to="/shop?model=Canon" className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm hover:border-brand">Canon</Link>
              <Link to="/shop?model=Epson" className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm hover:border-brand">Epson</Link>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[Printer, Cpu, Laptop, Network].map((Icon, i) => (
              <div key={i} className="aspect-square bg-white border border-gray-200 rounded-sm flex items-center justify-center">
                <Icon size={32} className="text-brand" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
