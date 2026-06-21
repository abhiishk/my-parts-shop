export const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const discountPct = (mrp, price) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const stockLabel = (status) => {
  if (status === "in_stock") return { text: "In Stock", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (status === "low_stock") return { text: "Low Stock", color: "text-amber-600", bg: "bg-amber-50" };
  return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
};
