import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.blogList().then(setPosts).catch(() => {}); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-cabinet text-3xl font-black tracking-tight">Resource Center</h1>
      <p className="text-gray-500 mt-1 mb-8">Guides, tips and buying advice for printer & IT parts.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link key={p.id} to={`/blog/${p.slug}`} data-testid={`blog-card-${p.slug}`} className="group border border-gray-200 rounded-sm overflow-hidden hover:border-brand transition-colors">
            <div className="aspect-[16/10] overflow-hidden bg-gray-50">
              <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-4">
              <span className="label-xs text-brand">{p.category}</span>
              <h2 className="font-cabinet font-bold text-lg mt-1 leading-snug group-hover:text-brand">{p.title}</h2>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
