import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, Truck, CheckCircle2, Clock, FileText } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";

const steps = ["placed", "confirmed", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    api.order(id).then(setOrder).catch(() => {});
  }, [id]);

  const loadInvoice = async () => {
    if (!invoice) {
      const inv = await api.invoice(id);
      setInvoice(inv);
    }
    setShowInvoice(true);
  };

  if (!order) return <div className="py-20 text-center text-gray-400">Loading…</div>;
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Link to="/account" className="text-sm text-gray-500 hover:text-brand">← Back to account</Link>
      <div className="flex items-center justify-between flex-wrap gap-3 mt-3 mb-6">
        <div>
          <h1 className="font-cabinet text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString("en-IN")}</p>
        </div>
        <button onClick={loadInvoice} data-testid="view-invoice-btn" className="h-10 px-4 border border-gray-300 rounded-sm text-sm font-medium flex items-center gap-2 hover:border-brand">
          <FileText size={16} /> GST Invoice
        </button>
      </div>

      {/* Tracking timeline */}
      {order.status !== "cancelled" ? (
        <div className="border border-gray-200 rounded-sm p-5 mb-6">
          <div className="flex justify-between">
            {steps.map((s, i) => {
              const Icon = [Clock, CheckCircle2, Truck, Package][i];
              const done = i <= currentStep;
              return (
                <div key={s} className="flex-1 flex flex-col items-center text-center relative">
                  {i > 0 && <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStep ? "bg-brand" : "bg-gray-200"}`} />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${done ? "bg-brand text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-xs mt-1.5 capitalize ${done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{s}</span>
                </div>
              );
            })}
          </div>
          {order.tracking_number && <p className="text-sm text-center mt-4 text-gray-600">Tracking: <span className="font-mono">{order.tracking_number}</span></p>}
        </div>
      ) : (
        <div className="border border-red-200 bg-red-50 rounded-sm p-4 mb-6 text-red-600 text-sm">This order was cancelled.</div>
      )}

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div className="border border-gray-200 rounded-sm p-5">
          <h2 className="font-cabinet font-bold mb-3">Items</h2>
          <div className="space-y-3">
            {order.items.map((it) => (
              <div key={it.product_id} className="flex gap-3">
                <img src={it.image} alt="" className="w-14 h-14 object-cover border border-gray-100 rounded-sm" />
                <div className="flex-1">
                  <Link to={`/product/${it.slug}`} className="text-sm font-medium hover:text-brand">{it.name_en}</Link>
                  <div className="text-xs text-gray-500">Qty {it.qty} • {inr(it.selling_price)}</div>
                </div>
                <span className="font-medium text-sm">{inr(it.selling_price * it.qty)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-sm p-5">
            <h2 className="font-cabinet font-bold mb-3">Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Taxable</span><span>{inr(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{inr(order.tax_total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{order.shipping_charge === 0 ? "FREE" : inr(order.shipping_charge)}</span></div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold"><span>Total</span><span>{inr(order.total)}</span></div>
              <div className="text-xs text-gray-500 pt-1">Payment: {order.payment_method.toUpperCase()} ({order.payment_status})</div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-sm p-5 text-sm">
            <h2 className="font-cabinet font-bold mb-2">Delivery Address</h2>
            <p className="text-gray-600">{order.address.full_name}<br />{order.address.line1}, {order.address.line2}<br />{order.address.city}, {order.address.state} - {order.address.pincode}<br />{order.address.phone}</p>
          </div>
        </div>
      </div>

      {/* Invoice modal */}
      {showInvoice && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInvoice(false)} />
          <div className="relative bg-white rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-3">
              <div>
                <h2 className="font-cabinet font-black text-xl">TAX INVOICE</h2>
                <p className="text-xs text-gray-500">{invoice.order.order_number}</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold">{invoice.seller.name}</div>
                <div className="text-gray-500">GSTIN: {invoice.seller.gstin}</div>
                <div className="text-gray-500 max-w-[200px]">{invoice.seller.address}</div>
              </div>
            </div>
            <table className="w-full text-xs border border-gray-200 mb-3">
              <thead className="bg-gray-50">
                <tr><th className="px-2 py-1.5 text-left">Item</th><th className="px-2 py-1.5">Qty</th><th className="px-2 py-1.5 text-right">Taxable</th><th className="px-2 py-1.5 text-right">GST</th><th className="px-2 py-1.5 text-right">Total</th></tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => (
                  <tr key={l.product_id} className="border-t border-gray-100">
                    <td className="px-2 py-1.5">{l.name_en}</td>
                    <td className="px-2 py-1.5 text-center">{l.qty}</td>
                    <td className="px-2 py-1.5 text-right">{inr(l.taxable_value)}</td>
                    <td className="px-2 py-1.5 text-right">{inr(l.gst_amount)} ({l.gst_rate}%)</td>
                    <td className="px-2 py-1.5 text-right">{inr(l.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm space-y-1">
              <div>Taxable Value: {inr(invoice.order.subtotal)}</div>
              <div>Total GST: {inr(invoice.order.tax_total)}</div>
              <div>Shipping: {inr(invoice.order.shipping_charge)}</div>
              <div className="font-cabinet font-bold text-lg">Grand Total: {inr(invoice.order.total)}</div>
            </div>
            <button onClick={() => window.print()} className="mt-4 h-10 px-4 bg-brand text-white rounded-sm text-sm">Print / Save PDF</button>
            <button onClick={() => setShowInvoice(false)} className="mt-4 ml-2 h-10 px-4 border border-gray-300 rounded-sm text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
