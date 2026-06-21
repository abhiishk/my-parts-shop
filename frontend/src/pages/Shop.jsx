import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { ProductCard } from "../components/storefront/ProductCard";
import { inr } from "../lib/format";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = params.get("category") || "";
  const subcategory = params.get("subcategory") || "";
  const brand = params.get("brand") || "";
  const model = params.get("model") || "";
  const q = params.get("q") || "";
  const sort = params.get("sort") || "relevance";
  const maxPrice = params.get("max_price") || "";
  const page = parseInt(params.get("page") || "1");

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
    api.brands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = { sort, page, limit: 12 };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (q) query.q = q;
    if (maxPrice) query.max_price = maxPrice;
    api.products(query).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [category, subcategory, brand, model, q, sort, maxPrice, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams(q ? { q } : {}));
  const activeCat = cats.find((c) => c.slug === category);
  const heading = q ? `Search: "${q}"` : activeCat ? activeCat.name_en : "All Products";

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="label-xs mb-2">Categories</h3>
        <div className="space-y-1">
          <button onClick={() => setParam("category", "")} className={`block text-sm ${!category ? "text-brand font-medium" : "text-gray-600"} hover:text-brand`}>
            All Categories
          </button>
          {cats.map((c) => (
            <div key={c.id}>
              <button
                data-testid={`filter-cat-${c.slug}`}
                onClick={() => { setParam("category", c.slug); setParam("subcategory", ""); }}
                className={`block text-sm ${category === c.slug ? "text-brand font-medium" : "text-gray-600"} hover:text-brand`}
              >
                {c.name_en}
              </button>
              {category === c.slug && (
                <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                  {c.subcategories.map((s) => (
                    <button
                      key={s}
                      onClick={() => setParam("subcategory", subcategory === s ? "" : s)}
                      className={`block text-xs ${subcategory === s ? "text-brand font-medium" : "text-gray-500"} hover:text-brand`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="label-xs mb-2">Brands</h3>
        <div className="space-y-1">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setParam("brand", brand === b.slug ? "" : b.slug)}
              className={`block text-sm ${brand === b.slug ? "text-brand font-medium" : "text-gray-600"} hover:text-brand`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="label-xs mb-2">Max Price</h3>
        <div className="space-y-1">
          {[999, 1999, 4999, 9999].map((p) => (
            <button
              key={p}
              onClick={() => setParam("max_price", maxPrice == p ? "" : p)}
              className={`block text-sm ${maxPrice == p ? "text-brand font-medium" : "text-gray-600"} hover:text-brand`}
            >
              Under {inr(p)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={clearAll} className="text-sm text-gray-500 underline hover:text-brand">Clear all filters</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
        <Link to="/" className="hover:text-brand">Home</Link> <ChevronRight size={12} /> <span>{heading}</span>
      </div>

      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-cabinet text-2xl md:text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="text-sm text-gray-500 mt-1">{data.total} products found</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(true)} className="lg:hidden h-9 px-3 border border-gray-300 rounded-sm text-sm flex items-center gap-1">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            data-testid="sort-select"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-9 border border-gray-300 rounded-sm px-2 text-sm focus:outline-none focus:border-brand"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden lg:block">
          <FilterPanel />
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products match your filters.</div>
          ) : (
            <>
              <div data-testid="product-grid" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {data.pages > 1 && (
                <div className="flex justify-center gap-1 mt-8">
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setParam("page", i + 1)}
                      className={`w-9 h-9 rounded-sm text-sm border ${page === i + 1 ? "bg-brand text-white border-brand" : "border-gray-300 hover:border-brand"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cabinet font-bold text-lg">Filters</span>
              <button onClick={() => setShowFilters(false)}><X size={22} /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
