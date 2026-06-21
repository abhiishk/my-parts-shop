import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); api.blog(slug).then(setPost).catch(() => {}); }, [slug]);

  if (!post) return <div className="py-20 text-center text-gray-400">Loading…</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <Link to="/blog" className="text-sm text-gray-500 hover:text-brand">← All articles</Link>
      <span className="label-xs text-brand block mt-4">{post.category}</span>
      <h1 className="font-cabinet text-3xl md:text-4xl font-black tracking-tight mt-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mt-2">By {post.author} • {new Date(post.created_at).toLocaleDateString("en-IN")}</p>
      <div className="aspect-[16/9] rounded-sm overflow-hidden my-6 bg-gray-50">
        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="prose max-w-none text-gray-700 leading-relaxed [&_h3]:font-cabinet [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
