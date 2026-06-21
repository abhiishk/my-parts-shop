import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { api } from "../lib/api";

const content = {
  about: { title: "About PartStation.in", body: [
    "PartStation.in — Your Parts Destination — is India's dedicated marketplace for genuine printer spare parts, printer consumables, computer parts, laptop parts and IT accessories.",
    "We serve technicians, repair shops, businesses and individuals across India with a clean technical catalog, GST invoices, COD options and fast, tracked shipping.",
    "Our mission is to make sourcing the right compatible part simple — searchable by SKU, part number and printer model.",
  ]},
  contact: { title: "Contact Us", body: [] },
  faq: { title: "Frequently Asked Questions", body: [] },
  "shipping-policy": { title: "Shipping Policy", body: [
    "We ship across India. Shipping charges are calculated by pincode at checkout. Orders are typically dispatched within 1-3 business days.",
    "Free shipping is available on orders above the threshold shown at checkout. A tracking number is shared once your order is shipped.",
  ]},
  returns: { title: "Return & Refund Policy", body: [
    "Eligible items can be returned within 7 days of delivery if unused and in original packaging. Defective parts are covered as per the warranty stated on the product page.",
    "Refunds for prepaid orders are processed to the original payment method within 5-7 business days of return approval.",
  ]},
  privacy: { title: "Privacy Policy", body: [
    "We collect only the information needed to process your orders and provide support. We never sell your data.",
    "Payment information is handled securely by our payment partners. You can request deletion of your account data anytime.",
  ]},
  terms: { title: "Terms & Conditions", body: [
    "By using PartStation.in you agree to our terms of sale, including pricing, GST, shipping and return policies as published on this site.",
    "Product compatibility information is provided as guidance; please verify your model and part number before ordering.",
  ]},
};

const faqs = [
  ["Do you provide GST invoices?", "Yes, every order includes a GST tax invoice available in your account."],
  ["Is Cash on Delivery available?", "COD is available on most pincodes. You can check availability on the product page or at checkout."],
  ["How do I find a part for my printer model?", "Use the search bar to search by printer model, or browse by compatible model on any product page."],
  ["What is the warranty?", "Warranty varies by product and is mentioned on each product page. Keep your GST invoice for claims."],
];

export default function StaticPage() {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); api.settings().then(setSettings).catch(() => {}); }, [slug]);
  const page = content[slug] || { title: "Page", body: ["Content coming soon."] };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <h1 className="font-cabinet text-3xl md:text-4xl font-black tracking-tight">{page.title}</h1>
      <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
        {page.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {slug === "contact" && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {[[Mail, "Email", settings?.support_email], [Phone, "Phone", settings?.phone], [MapPin, "Address", settings?.address], [MessageCircle, "WhatsApp", settings?.whatsapp_number]].map(([Icon, label, val], i) => (
            <div key={i} className="border border-gray-200 rounded-sm p-4 flex items-start gap-3">
              <Icon size={20} className="text-brand mt-0.5" />
              <div><div className="text-xs text-gray-500">{label}</div><div className="text-sm font-medium">{val}</div></div>
            </div>
          ))}
        </div>
      )}

      {slug === "faq" && (
        <div className="mt-6 space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={i} className="border border-gray-200 rounded-sm p-4">
              <div className="font-medium">{q}</div>
              <div className="text-sm text-gray-600 mt-1">{a}</div>
            </div>
          ))}
        </div>
      )}

      <Link to="/shop" className="inline-block mt-8 text-brand font-medium">← Back to shop</Link>
    </div>
  );
}
