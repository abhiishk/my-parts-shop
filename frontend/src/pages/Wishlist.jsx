import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/storefront/ProductCard";

export default function Wishlist() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/wishlist");
    if (user) api.wishlist().then(setItems).catch(() => {});
  }, [user, loading, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-cabinet text-2xl md:text-3xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Heart size={48} className="mx-auto text-gray-300" />
          <p className="mt-3">Your wishlist is empty.</p>
          <Link to="/shop" className="text-brand">Browse parts</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
