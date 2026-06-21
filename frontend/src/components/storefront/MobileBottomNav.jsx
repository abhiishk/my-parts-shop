import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../context/CartContext";

const items = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/shop", icon: LayoutGrid, label: "Categories" },
  { to: "/cart", icon: ShoppingCart, label: "Cart", cart: true },
  { to: "/account", icon: User, label: "Account" },
];

export const MobileBottomNav = () => {
  const { count } = useCart();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            data-testid={`bottomnav-${it.label.toLowerCase()}`}
            className={({ isActive }) => `flex flex-col items-center justify-center py-2 text-[11px] gap-0.5 ${isActive ? "text-brand" : "text-slate-500"}`}
          >
            <div className="relative">
              <it.icon size={21} />
              {it.cart && count > 0 && <span className="absolute -top-1.5 -right-2.5 bg-brand-orange text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-1">{count}</span>}
            </div>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
