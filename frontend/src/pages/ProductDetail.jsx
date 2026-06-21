import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, Star, ChevronRight, Check, MapPin } from "lucide-react";
import { api } from "../lib/api";
import { inr, discountPct, stockLabel } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { ProductCard } from "../components/storefront/ProductCard";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { pn } = useI18n();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [pincode, setPincode] = useState("");
  const [ship, setShip] = useState(null);
  const [shipErr, setShipErr] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    api.product(slug).then((p) => { setProduct(p); setActiveImg(0); }).catch(() => navigate("/shop"));
  }, [slug, navigate]);

  const checkPincode = async () => {
    setShipErr("");
    setShip(null);
    try {
      const r = await api.shippingCheck({ pincode, cart_total: product.selling_price });
      setShip(r);
    } catch (e) {
      setShipErr(e.response?.data?.detail || "Could not check pincode");
    }
  };

  const toggleWish = async () => {
    if (!user) return navigate("/login");
    try {
      const r = await api.toggleWishlist(product.id);
      toast.success(r.active ? "Added to wishlist" : "Removed from wishlist");
    } catch { toast.error("Failed"); }
  };

  if (!product) return <div className="max-w-7xl mx-auto px-8 py-20 text-center text-gray-400">Loading…</div>;

  const disc = discountPct(product.mrp, product.selling_price);
  const stock = stockLabel(product.stock_status);
  const out = product.stock_status === "out_of_stock";
  const base = (product.selling_price / (1 + product.gst_rate / 100));
  const gstAmt = product.selling_price - base;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-up">
      <div className="text-xs text-gray-500 flex items-center gap-1 mb-5 flex-wrap">
        <Link to="/" className="hover:text-brand">Home</Link> <ChevronRight size={12} />
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-brand">{product.category}</Link> <ChevronRight size={12} />
        <span className="text-gray-700">{product.subcategory}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="aspect-square border border-gray-200 rounded-sm overflow-hidden bg-gray-50">
            <img src={product.images?.[activeImg]} alt={product.name_en} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 border rounded-sm overflow-hidden ${activeImg === i ? "border-brand" : "border-gray-200"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="sku-tag">SKU: {product.sku}</span>
            <span className="sku-tag">{product.part_number}</span>
          </div>
          <h1 className="font-cabinet text-2xl md:text-3xl font-bold tracking-tight">{pn(product)}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">by <span className="font-medium text-gray-700">{product.brand}</span></span>
            <span className="flex items-center gap-1 text-sm text-amber-500">
              <Star size={14} fill="currentColor" /> {product.rating} <span className="text-gray-400">({product.review_count})</span>
            </span>
          </div>

          <div className={`inline-flex items-center gap-1 text-sm font-medium mt-3 px-2 py-0.5 rounded-sm ${stock.bg} ${stock.color}`}>
            ● {stock.text}
          </div>

          {/* Price */}
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-cabinet text-3xl font-black">{inr(product.selling_price)}</span>
              {product.mrp > product.selling_price && (
                <>
                  <span className="text-gray-400 line-through">{inr(product.mrp)}</span>
                  <span className="text-brand-orange font-semibold text-sm">{disc}% OFF</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Incl. {product.gst_rate}% GST ({inr(gstAmt.toFixed(2))}) • Base {inr(base.toFixed(2))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              data-testid="add-to-cart-button"
              disabled={out}
              onClick={() => addItem(product)}
              className="flex-1 h-12 bg-brand text-white font-medium rounded-sm flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors disabled:bg-gray-300"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              data-testid="buy-now-button"
              disabled={out}
              onClick={() => { addItem(product); navigate("/cart"); }}
              className="flex-1 h-12 bg-brand-orange text-white font-medium rounded-sm flex items-center justify-center gap-2 hover:bg-brand-orange-hover transition-colors disabled:bg-gray-300"
            >
              Buy Now
            </button>
            <button onClick={toggleWish} data-testid="wishlist-button" className="w-12 h-12 border border-gray-300 rounded-sm flex items-center justify-center hover:border-brand hover:text-brand transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Pincode checker */}
          <div className="mt-5 p-4 border border-gray-200 rounded-sm">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin size={16} className="text-brand" /> Check Delivery & COD
            </div>
            <div className="flex gap-2">
              <input
                data-testid="pincode-check-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="flex-1 h-10 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand"
              />
              <button data-testid="pincode-check-btn" onClick={checkPincode} className="h-10 px-4 bg-ink text-white rounded-sm text-sm font-medium hover:bg-gray-800">Check</button>
            </div>
            {shipErr && <p className="text-xs text-red-600 mt-2">{shipErr}</p>}
            {ship && (
              <div className="text-xs mt-3 space-y-1" data-testid="pincode-result">
                <p className="text-emerald-600 flex items-center gap-1"><Check size={14} /> Deliverable to {ship.zone}</p>
                <p className="text-gray-600">Shipping: {ship.shipping_charge === 0 ? "FREE" : inr(ship.shipping_charge)}</p>
                <p className="text-gray-600">COD: {ship.cod_available ? "Available" : "Not available"}</p>
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[[Truck, "Fast Shipping"], [ShieldCheck, `${product.warranty || "Warranty"}`], [RotateCcw, product.return_eligible ? "Returnable" : "No Return"]].map(([Icon, label], i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-sm text-center">
                <Icon size={18} className="text-brand" />
                <span className="text-[11px] text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Compatible models */}
          {product.compatible_models?.length > 0 && (
            <div className="mt-5">
              <h3 className="label-xs mb-2">Compatible Models</h3>
              <div className="flex flex-wrap gap-2">
                {product.compatible_models.map((m) => (
                  <Link key={m} to={`/shop?model=${encodeURIComponent(m)}`} className="px-2.5 py-1 bg-gray-100 rounded-sm text-xs text-gray-700 hover:bg-brand hover:text-white transition-colors">
                    {m}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description & Specs */}
      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <div>
          <h2 className="font-cabinet text-xl font-bold mb-3">Description</h2>
          <p className="text-gray-700 leading-relaxed text-sm">{product.long_description}</p>
        </div>
        <div>
          <h2 className="font-cabinet text-xl font-bold mb-3">Technical Specifications</h2>
          <table className="w-full text-sm border border-gray-200">
            <tbody>
              {Object.entries(product.technical_specs || {}).map(([k, v]) => (
                <tr key={k} className="border-b border-gray-200">
                  <td className="px-4 py-2.5 bg-gray-50 font-medium text-gray-600 w-1/3">{k}</td>
                  <td className="px-4 py-2.5 text-gray-800 font-mono text-xs">{v}</td>
                </tr>
              ))}
              <tr className="border-b border-gray-200"><td className="px-4 py-2.5 bg-gray-50 font-medium text-gray-600">Weight</td><td className="px-4 py-2.5 font-mono text-xs">{product.weight} kg</td></tr>
              <tr><td className="px-4 py-2.5 bg-gray-50 font-medium text-gray-600">Brand</td><td className="px-4 py-2.5 font-mono text-xs">{product.brand}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Related */}
      {product.related?.length > 0 && (
        <div className="mt-12">
          <h2 className="font-cabinet text-2xl font-bold mb-5">Related Parts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
