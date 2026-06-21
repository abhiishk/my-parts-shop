import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MapPin, CreditCard, Banknote } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { toast } from "sonner";

const empty = { full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(empty);
  const [ship, setShip] = useState(null);
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const placedRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/checkout");
    if (!loading && items.length === 0 && !placedRef.current) navigate("/cart");
    if (user) setAddress((a) => ({ ...a, full_name: user.name, phone: user.phone || "" }));
  }, [user, loading, items.length, navigate]);

  useEffect(() => {
    if (address.pincode.length === 6) {
      api.shippingCheck({ pincode: address.pincode, cart_total: subtotal })
        .then(setShip).catch(() => setShip(null));
    } else setShip(null);
  }, [address.pincode, subtotal]);

  const gst = items.reduce((s, i) => { const line = i.selling_price * i.qty; return s + (line - line / (1 + i.gst_rate / 100)); }, 0);
  const shipping = ship ? ship.shipping_charge : 0;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    for (const k of ["full_name", "phone", "line1", "city", "state", "pincode"]) {
      if (!address[k]) return toast.error("Please fill all address fields");
    }
    if (payment === "cod" && ship && !ship.cod_available) return toast.error("COD not available for this pincode");
    setPlacing(true);
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        address,
        payment_method: payment,
      });
      placedRef.current = true;
      navigate(`/order-success/${order.id}`);
      clearCart();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const field = (name, label, span = false) => (
    <div className={span ? "col-span-2" : ""}>
      <label className="label-xs block mb-1">{label}</label>
      <input
        data-testid={`addr-${name}`}
        value={address[name]}
        onChange={(e) => setAddress({ ...address, [name]: name === "pincode" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value })}
        className="w-full h-10 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link to="/" className="font-cabinet font-black text-xl">Part<span className="text-brand">Station</span><span className="text-brand-orange">.in</span></Link>
      <h1 className="font-cabinet text-2xl md:text-3xl font-bold mt-4 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-sm p-5">
            <h2 className="flex items-center gap-2 font-cabinet font-bold text-lg mb-4"><MapPin size={18} className="text-brand" /> Shipping Address</h2>
            <div className="grid grid-cols-2 gap-3">
              {field("full_name", "Full Name")}
              {field("phone", "Phone")}
              {field("line1", "Address Line 1", true)}
              {field("line2", "Address Line 2 (optional)", true)}
              {field("city", "City")}
              {field("state", "State")}
              {field("pincode", "Pincode")}
            </div>
            {ship && (
              <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1" data-testid="checkout-ship-info">
                <Check size={14} /> Deliverable to {ship.zone} • Shipping {shipping === 0 ? "FREE" : inr(shipping)} • COD {ship.cod_available ? "available" : "unavailable"}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-sm p-5">
            <h2 className="font-cabinet font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label data-testid="checkout-cod-radio" className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer ${payment === "cod" ? "border-brand bg-blue-50/50" : "border-gray-200"}`}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="accent-brand" />
                <Banknote size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-sm">Cash on Delivery</div>
                  <div className="text-xs text-gray-500">Pay when your order arrives</div>
                </div>
              </label>
              <label data-testid="checkout-phonepe-radio" className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer ${payment === "phonepe" ? "border-brand bg-blue-50/50" : "border-gray-200"}`}>
                <input type="radio" name="payment" checked={payment === "phonepe"} onChange={() => setPayment("phonepe")} className="accent-brand" />
                <CreditCard size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-sm">PhonePe / UPI <span className="text-amber-600 text-[11px]">(coming soon)</span></div>
                  <div className="text-xs text-gray-500">Online payment — integration pending</div>
                </div>
              </label>
            </div>
            {payment === "phonepe" && (
              <p className="text-xs text-amber-600 mt-2">PhonePe gateway will be activated in a later phase. For now, please use COD.</p>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 self-start border border-gray-200 rounded-sm p-5 h-fit">
          <h2 className="font-cabinet font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-3 no-scrollbar">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate pr-2">{i.name_en} × {i.qty}</span>
                <span className="shrink-0">{inr(i.selling_price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
            <div className="flex justify-between"><span className="text-gray-600">Taxable Value</span><span>{inr((subtotal - gst).toFixed(2))}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{inr(gst.toFixed(2))}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{ship ? (shipping === 0 ? "FREE" : inr(shipping)) : "—"}</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-cabinet font-bold text-lg">
              <span>Total</span><span data-testid="checkout-total">{inr(total)}</span>
            </div>
          </div>
          <button
            data-testid="place-order-button"
            disabled={placing || (payment === "phonepe")}
            onClick={placeOrder}
            className="w-full h-11 mt-4 bg-brand text-white rounded-sm font-medium hover:bg-brand-hover disabled:bg-gray-300"
          >
            {placing ? "Placing Order…" : "Place Order"}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">GST invoice will be available in your account.</p>
        </div>
      </div>
    </div>
  );
}
