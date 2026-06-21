import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useI18n } from "../context/I18nContext";
import { inr } from "../lib/format";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { pn } = useI18n();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-300" />
        <h1 className="font-cabinet text-2xl font-bold mt-4">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Browse our catalog and add parts to get started.</p>
        <Link to="/shop" className="inline-flex mt-6 h-11 px-6 bg-brand text-white rounded-sm font-medium items-center gap-2 hover:bg-brand-hover">
          Browse Parts <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const gst = items.reduce((s, i) => { const line = i.selling_price * i.qty; return s + (line - line / (1 + i.gst_rate / 100)); }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-cabinet text-2xl md:text-3xl font-bold mb-6">Shopping Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.product_id} data-testid={`cart-item-${it.product_id}`} className="flex gap-4 p-3 border border-gray-200 rounded-sm">
              <Link to={`/product/${it.slug}`} className="w-24 h-24 shrink-0 bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
                <img src={it.image} alt={it.name_en} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <span className="sku-tag">{it.sku}</span>
                <Link to={`/product/${it.slug}`} className="block font-medium text-sm mt-1 hover:text-brand line-clamp-2">{pn(it)}</Link>
                <div className="text-xs text-gray-400">incl. {it.gst_rate}% GST</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-300 rounded-sm">
                    <button onClick={() => updateQty(it.product_id, it.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm" data-testid={`qty-${it.product_id}`}>{it.qty}</span>
                    <button onClick={() => updateQty(it.product_id, it.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><Plus size={14} /></button>
                  </div>
                  <span className="font-cabinet font-bold">{inr(it.selling_price * it.qty)}</span>
                </div>
              </div>
              <button onClick={() => removeItem(it.product_id)} data-testid={`remove-${it.product_id}`} className="text-gray-400 hover:text-red-600 self-start"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 self-start border border-gray-200 rounded-sm p-5 h-fit">
          <h2 className="font-cabinet font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal (excl. GST)</span><span>{inr(subtotal - gst)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{inr(gst.toFixed(2))}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="text-gray-400">At checkout</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-cabinet font-bold text-lg">
              <span>Total</span><span>{inr(subtotal)}</span>
            </div>
          </div>
          <button data-testid="checkout-button" onClick={() => navigate("/checkout")} className="w-full h-11 mt-4 bg-brand text-white rounded-sm font-medium flex items-center justify-center gap-2 hover:bg-brand-hover">
            Proceed to Checkout <ArrowRight size={18} />
          </button>
          <Link to="/shop" className="block text-center text-sm text-gray-500 mt-3 hover:text-brand">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
