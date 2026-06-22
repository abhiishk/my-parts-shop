import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ps_cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ps_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty) => {
    const q = qty || product.min_order_qty || 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => (i.product_id === product.id ? { ...i, qty: i.qty + q } : i));
      }
      return [
        ...prev,
        {
          product_id: product.id,
          sku: product.sku,
          name_en: product.name_en,
          name_hi: product.name_hi,
          slug: product.slug,
          image: product.images?.[0] || "",
          selling_price: product.selling_price,
          mrp: product.mrp,
          gst_rate: product.gst_rate,
          min_order_qty: product.min_order_qty || 1,
          qty,
        },
      ];
    });
    toast.success("Added to cart");
  };

  const updateQty = (product_id, qty) => {
    setItems((prev) => prev.map((i) => {
      if (i.product_id !== product_id) return i;
      const min = i.min_order_qty || 1;
      if (qty < min) return i;
      return { ...i, qty };
    }));
  };

  const removeItem = (product_id) => setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  const clearCart = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.selling_price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
