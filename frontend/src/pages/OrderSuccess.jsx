import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.order(id).then(setOrder).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-up">
      <CheckCircle2 size={64} className="mx-auto text-emerald-500" />
      <h1 className="font-cabinet text-3xl font-black mt-4">Order Placed!</h1>
      <p className="text-gray-600 mt-2">Thank you for your order. A confirmation email has been sent.</p>

      {order && (
        <div className="mt-8 border border-gray-200 rounded-sm p-6 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="font-cabinet font-bold" data-testid="order-number">{order.order_number}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="uppercase font-medium">{order.payment_method}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-cabinet font-bold text-lg">{inr(order.total)}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-500">Status</span>
            <span className="px-2 py-0.5 bg-blue-50 text-brand rounded-sm text-xs font-medium capitalize">{order.status}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center mt-8">
        <Link to={`/account/orders/${id}`} className="h-11 px-5 bg-brand text-white rounded-sm font-medium flex items-center gap-2 hover:bg-brand-hover">
          <Package size={18} /> Track Order
        </Link>
        <Link to="/shop" className="h-11 px-5 border border-gray-300 rounded-sm font-medium flex items-center gap-2 hover:border-brand">
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
