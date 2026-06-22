import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, Star, ChevronRight, Check, MapPin, Tag, Zap } from "lucide-react";
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
    setShipErr(""); setShip(null);
    try { setShip(await api.shippingCheck({ pincode, cart_total: product.selling_price })); }
    catch (e) { setShipErr(e.response?.data?.detail || "Could not check pincode"); }
  };

  const toggleWish = async () => {
    if (!user) return navigate("/login");
    try { const r = await api.toggleWishlist(product.id); toast.success(r.active ? "Added to wishlist" : "Removed"); }
    catch { toast.error("Failed"); }
  };

  if (!product) return <div className="max-w-7xl mx-auto px-8 py-20 text-center text-slate-400">Loading…</div>;

  const disc = discountPct(product.mrp, product.selling_price);
  const stock = stockLabel(product.stock_status);
  const out = product.stock_status === "out_of_stock";
  const base = product.selling_price / (1 + product.gst_rate / 100);
  const gstAmt = product.selling_price - base;
  const saving = product.mrp - product.selling_price;

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-8 py-3 animate-fade-up pb-24 lg:pb-3">
      <div className="text-xs text-slate-500 flex items-center gap-1 mb-3 flex-wrap px-1">
        <Link to="/" className="hover:text-brand">Home</Link> <ChevronRight size={12} />
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-brand">{product.category}</Link> <ChevronRight size={12} />
        <span className="text-slate-700">{product.subcategory}</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 grid lg:grid-cols-2 gap-6 lg:gap-10 p-4 lg:p-6">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="aspect-square border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-3">
            <img src={product.images?.[activeImg]} alt={product.name_en} className="w-full h-full object-cover rounded" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 border rounded-md overflow-hidden p-0.5 ${activeImg === i ? "border-brand" : "border-slate-200"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover rounded" />
                </button>
              ))}
            </div>
          )}
          <div className="hidden lg:flex gap-3 mt-4">
            <button data-testid="add-to-cart-button" disabled={out} onClick={() => addItem(product)} className="flex-1 h-12 bg-brand text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors disabled:bg-slate-300">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button data-testid="buy-now-button" disabled={out} onClick={() => { addItem(product); navigate("/cart"); }} className="flex-1 h-12 bg-brand-orange text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-brand-orange-hover transition-colors disabled:bg-slate-300">
              <Zap size={18} /> Buy Now
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="sku-tag">SKU: {product.sku}</span>
            <span className="sku-tag">{product.part_number}</span>
            <button onClick={toggleWish} data-testid="wishlist-button" className="ml-auto text-slate-400 hover:text-brand-orange"><Heart size={20} /></button>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">{pn(product)}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-[#16A34A] text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">{product.rating} <Star size={11} fill="white" /></span>
            <span className="text-sm text-slate-500">{product.review_count} Ratings</span>
            <span className="text-sm text-slate-400">· by <span className="font-medium text-slate-700">{product.brand}</span></span>
          </div>

          <div className={`inline-flex items-center gap-1 text-sm font-semibold mt-3 px-2 py-0.5 rounded ${stock.bg} ${stock.color}`}>● {stock.text}</div>

          {/* Price */}
          <div className="mt-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl font-extrabold text-ink">{inr(product.selling_price)}</span>
              {product.mrp > product.selling_price && <span className="text-slate-400 line-through text-lg">{inr(product.mrp)}</span>}
              {disc > 0 && <span className="text-[#16A34A] font-bold">{disc}% off</span>}
            </div>
            <div className="text-xs text-slate-500 mt-1">Inclusive of {product.gst_rate}% GST ({inr(gstAmt.toFixed(2))}) · Base {inr(base.toFixed(2))}</div>
            {saving > 0 && <div className="text-sm text-[#16A34A] font-medium mt-0.5">You save {inr(saving)}</div>}
          </div>

          {/* Offers */}
          <div className="mt-4 border border-slate-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2"><Tag size={15} className="text-brand-orange" /> Available Offers</div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• GST Invoice available for input tax credit</li>
              <li>• Cash on Delivery available on eligible pincodes</li>
              {product.min_order_qty > 1 && <li>• Minimum order quantity: <b>{product.min_order_qty} units</b></li>}
              {product.free_shipping_qty > 0 && <li>• <b>Free delivery</b> on ordering {product.free_shipping_qty}+ units</li>}
              <li>• {product.warranty || "Limited"} warranty — keep your invoice for claims</li>
            </ul>
          </div>

          {/* Pincode */}
          <div className="mt-4 border border-slate-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2"><MapPin size={15} className="text-brand" /> Delivery & COD</div>
            <div className="flex gap-2">
              <input data-testid="pincode-check-input" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit pincode" className="flex-1 h-10 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
              <button data-testid="pincode-check-btn" onClick={checkPincode} className="h-10 px-4 bg-brand text-white rounded-md text-sm font-semibold hover:bg-brand-hover">Check</button>
            </div>
            {shipErr && <p className="text-xs text-red-600 mt-2">{shipErr}</p>}
            {ship && (
              <div className="text-xs mt-3 space-y-1" data-testid="pincode-result">
                <p className="text-[#16A34A] flex items-center gap-1"><Check size={14} /> Deliverable to {ship.zone}</p>
                <p className="text-slate-600">Shipping: {ship.shipping_charge === 0 ? "FREE" : inr(ship.shipping_charge)} · COD: {ship.cod_available ? "Available" : "Not available"}</p>
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[[Truck, "Fast Shipping"], [ShieldCheck, product.warranty || "Warranty"], [RotateCcw, product.return_eligible ? "7-Day Return" : "No Return"]].map(([Icon, label], i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2.5 border border-slate-200 rounded-md text-center">
                <Icon size={18} className="text-brand" /><span className="text-[11px] text-slate-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Compatible models */}
          {product.compatible_models?.length > 0 && (
            <div className="mt-4">
              <h3 className="label-xs mb-2">Compatible Printer / Device Models</h3>
              <div className="flex flex-wrap gap-2">
                {product.compatible_models.map((m) => (
                  <Link key={m} to={`/shop?model=${encodeURIComponent(m)}`} className="px-2.5 py-1 bg-slate-100 rounded-md text-xs text-slate-700 hover:bg-brand hover:text-white transition-colors">{m}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Highlights + Specs + Description */}
      <div className="bg-white rounded-lg border border-slate-200 mt-3 p-4 lg:p-6 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Specifications</h2>
          <table className="w-full text-sm border border-slate-200 rounded-md overflow-hidden">
            <tbody>
              {Object.entries(product.technical_specs || {}).map(([k, v]) => (
                <tr key={k} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 bg-slate-50 font-medium text-slate-500 w-1/3">{k}</td>
                  <td className="px-4 py-2.5 text-slate-800">{v}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-100"><td className="px-4 py-2.5 bg-slate-50 font-medium text-slate-500">Brand</td><td className="px-4 py-2.5">{product.brand}</td></tr>
              <tr><td className="px-4 py-2.5 bg-slate-50 font-medium text-slate-500">Weight</td><td className="px-4 py-2.5">{product.weight} kg</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Description</h2>
          <p className="text-slate-600 leading-relaxed text-sm">{product.long_description}</p>
        </div>
      </div>

      {/* Related */}
      {product.related?.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 mt-3 p-4 lg:p-6">
          <h2 className="font-display text-xl font-bold mb-4">Related Parts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-14 left-0 right-0 z-30 lg:hidden bg-white border-t border-slate-200 p-2 flex gap-2 shadow-[0_-6px_16px_-4px_rgba(0,0,0,0.12)]">
        <button data-testid="add-to-cart-button-mobile" disabled={out} onClick={() => addItem(product)} className="flex-1 h-11 bg-brand text-white font-semibold rounded-md flex items-center justify-center gap-1.5 disabled:bg-slate-300"><ShoppingCart size={17} /> Add</button>
        <button disabled={out} onClick={() => { addItem(product); navigate("/cart"); }} className="flex-1 h-11 bg-brand-orange text-white font-semibold rounded-md flex items-center justify-center gap-1.5 disabled:bg-slate-300"><Zap size={17} /> Buy Now</button>
      </div>
    </div>
  );
}
