import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Linkedin, ShieldCheck, Truck, BadgeIndianRupee, CreditCard } from "lucide-react";
import { BRAND } from "../../lib/brand";

const trust = [
  { icon: BadgeIndianRupee, title: "GST Invoice", desc: "On every order" },
  { icon: Truck, title: "India-wide Shipping", desc: "Fast & tracked" },
  { icon: CreditCard, title: "COD Available", desc: "Pay on delivery" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "PhonePe & more" },
];

export const Footer = ({ settings }) => (
  <footer className="bg-ink text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 py-10 border-b border-white/10">
      {trust.map((tr) => (
        <div key={tr.title} className="flex items-center gap-3">
          <tr.icon size={28} className="text-brand shrink-0" />
          <div>
            <div className="font-semibold text-white text-sm">{tr.title}</div>
            <div className="text-xs text-gray-400">{tr.desc}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-black rounded-sm overflow-hidden flex items-center justify-center">
            <img src={BRAND.logoIcon} alt="PartStation.in" className="w-full h-full object-contain" />
          </div>
          <div className="font-cabinet font-black text-xl text-white leading-none">
            Part<span className="text-brand">Station</span><span className="text-brand-orange">.in</span>
            <span className="block text-[9px] uppercase tracking-[0.18em] text-gray-500 mt-1">{BRAND.tagline}</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{settings?.address || "Genuine printer & IT spare parts shipped across India."}</p>
        <p className="text-xs text-gray-500 mt-3">GSTIN: {settings?.gstin}</p>
      </div>
      <div>
        <h4 className="label-xs text-gray-500 mb-3">Shop</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-brand">All Products</Link></li>
          <li><Link to="/shop?category=printer-parts" className="hover:text-brand">Printer Parts</Link></li>
          <li><Link to="/shop?category=computer-parts" className="hover:text-brand">Computer Parts</Link></li>
          <li><Link to="/shop?category=laptop-parts" className="hover:text-brand">Laptop Parts</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="label-xs text-gray-500 mb-3">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/page/about" className="hover:text-brand">About Us</Link></li>
          <li><Link to="/page/contact" className="hover:text-brand">Contact Us</Link></li>
          <li><Link to="/blog" className="hover:text-brand">Blog</Link></li>
          <li><Link to="/page/faq" className="hover:text-brand">FAQ</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="label-xs text-gray-500 mb-3">Policies</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/page/shipping-policy" className="hover:text-brand">Shipping Policy</Link></li>
          <li><Link to="/page/returns" className="hover:text-brand">Return & Refund</Link></li>
          <li><Link to="/page/privacy" className="hover:text-brand">Privacy Policy</Link></li>
          <li><Link to="/page/terms" className="hover:text-brand">Terms & Conditions</Link></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-gray-500">© {new Date().getFullYear()} PartStation.in — Your Parts Destination. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href={settings?.social?.instagram || "#"} className="hover:text-brand"><Instagram size={18} /></a>
          <a href={settings?.social?.facebook || "#"} className="hover:text-brand"><Facebook size={18} /></a>
          <a href={settings?.social?.youtube || "#"} className="hover:text-brand"><Youtube size={18} /></a>
          <a href={settings?.social?.linkedin || "#"} className="hover:text-brand"><Linkedin size={18} /></a>
        </div>
      </div>
    </div>
  </footer>
);
