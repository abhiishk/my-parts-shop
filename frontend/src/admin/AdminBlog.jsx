import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

const blank = { title: "", category: "general", excerpt: "", content: "", cover_image: "", published: true };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.adminBlog().then(setPosts).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title) return toast.error("Title required");
    if (editing.id) await api.adminUpdateBlog(editing.id, editing);
    else await api.adminCreateBlog(editing);
    toast.success("Saved");
    setEditing(null); load();
  };
  const del = async (id) => { if (!window.confirm("Delete post?")) return; await api.adminDeleteBlog(id); load(); };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cabinet text-2xl font-bold">Blog</h1>
        <button onClick={() => setEditing(blank)} className="h-10 px-4 bg-brand text-white rounded-sm text-sm font-medium flex items-center gap-2"><Plus size={16} /> New Post</button>
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="border border-gray-200 rounded-sm p-3 bg-white flex items-center gap-3">
            {p.cover_image && <img src={p.cover_image} alt="" className="w-12 h-12 object-cover rounded-sm" />}
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-gray-500">{p.category} • {p.published ? "Published" : "Draft"}</div>
            </div>
            <button onClick={() => setEditing(p)} className="text-gray-500 hover:text-brand"><Edit size={16} /></button>
            <button onClick={() => del(p.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-cabinet font-bold text-lg">{editing.id ? "Edit" : "New"} Post</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full h-10 border border-gray-300 rounded-sm px-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="h-10 border border-gray-300 rounded-sm px-3 text-sm" />
                <input placeholder="Cover image URL" value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} className="h-10 border border-gray-300 rounded-sm px-3 text-sm" />
              </div>
              <textarea placeholder="Excerpt" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" />
              <textarea placeholder="Content (HTML allowed)" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="accent-brand" /> Published</label>
            </div>
            <button onClick={save} className="h-10 px-5 bg-brand text-white rounded-sm text-sm font-medium mt-4">Save Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
