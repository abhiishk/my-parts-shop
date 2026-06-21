import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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
    <div
      data-testid={`product-card-${product.slug}`}
      className="group bg-white border border-gray-200 rounded-sm flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-400"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
        <img
          src={product.images?.[0]}
          alt={product.name_en}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-brand-orange text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
            -{disc}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-2 right-2 bg-ink text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
            Featured
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <span className="sku-tag self-start mb-1.5">{product.sku}</span>
        <Link to={`/product/${product.slug}`} className="text-sm font-medium leading-snug line-clamp-2 hover:text-brand transition-colors min-h-[2.5rem]">
          {pn(product)}
        </Link>
        <div className="text-xs text-gray-500 mt-1">{product.brand}</div>

        <div className={`text-[11px] font-medium mt-2 ${stock.color}`}>● {stock.text}</div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-cabinet font-bold text-lg">{inr(product.selling_price)}</span>
          {product.mrp > product.selling_price && (
            <span className="text-xs text-gray-400 line-through">{inr(product.mrp)}</span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">incl. {product.gst_rate}% GST</span>

        <button
          data-testid={`add-to-cart-${product.slug}`}
          disabled={out}
          onClick={() => addItem(product)}
          className="mt-3 w-full h-9 bg-brand text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} /> {out ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
