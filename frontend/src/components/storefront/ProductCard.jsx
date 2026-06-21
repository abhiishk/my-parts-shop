import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { inr, discountPct, stockLabel } from "../../lib/format";
import { useCart } from "../../context/CartContext";
import { useI18n } from "../../context/I18nContext";

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { pn } = useI18n();
  const disc = discountPct(product.mrp, product.selling_price);
  const stock = stockLabel(product.stock_status);
  const out = product.stock_status === "out_of_stock";

  return (
    <div data-testid={`product-card-${product.slug}`} className="group bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50 p-2">
        <img src={product.images?.[0]} alt={product.name_en} loading="lazy" className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300" />
        {disc > 0 && <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">{disc}% OFF</span>}
      </Link>

      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{product.brand}</span>
        </div>
        <Link to={`/product/${product.slug}`} className="text-[13px] sm:text-sm font-medium text-slate-800 leading-snug line-clamp-2 hover:text-brand transition-colors min-h-[2.5rem]">
          {pn(product)}
        </Link>

        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="bg-success text-white text-[11px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: "#16A34A" }}>
            {product.rating} <Star size={9} fill="white" />
          </span>
          <span className="text-[11px] text-slate-400">({product.review_count})</span>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="font-display font-bold text-base sm:text-lg text-ink">{inr(product.selling_price)}</span>
          {product.mrp > product.selling_price && <span className="text-xs text-slate-400 line-through">{inr(product.mrp)}</span>}
        </div>
        <span className="text-[10px] text-slate-400">incl. {product.gst_rate}% GST</span>
        <span className={`text-[11px] font-medium mt-0.5 ${stock.color}`}>{stock.text}</span>

        <button data-testid={`add-to-cart-${product.slug}`} disabled={out} onClick={() => addItem(product)}
          className="mt-2.5 w-full h-9 bg-brand-orange text-white text-xs sm:text-sm font-semibold rounded-md flex items-center justify-center gap-1.5 hover:bg-brand-orange-hover transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
          <ShoppingCart size={15} /> {out ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
