import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../lib/brand";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user?.role === "admin") navigate("/admin"); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const u = await login(form);
      if (u.role !== "admin") { setError("This account is not an administrator."); setBusy(false); return; }
      navigate("/admin");
    } catch (e) {
      const d = e.response?.data?.detail;
      setError(typeof d === "string" ? d : "Invalid credentials");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 bg-white rounded-md overflow-hidden p-1"><img src={BRAND.logoIcon} alt="" className="w-full h-full object-contain" /></div>
            <span className="font-display font-extrabold text-2xl text-white">PartStation<span className="text-brand-orange">.in</span></span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-orange"><ShieldCheck size={14} /> Secure Admin Portal</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-8 shadow-2xl">
          <h1 className="font-display text-xl font-bold text-white flex items-center gap-2"><Lock size={18} /> Administrator Login</h1>
          <p className="text-sm text-slate-400 mt-1">Authorized personnel only.</p>

          <form onSubmit={submit} className="space-y-3 mt-5">
            <input data-testid="admin-login-email" required type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 bg-slate-900 border border-slate-600 rounded-md px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-orange" />
            <input data-testid="admin-login-password" required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 bg-slate-900 border border-slate-600 rounded-md px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-orange" />
            {error && <p className="text-sm text-red-400" data-testid="admin-auth-error">{error}</p>}
            <button data-testid="admin-auth-submit" disabled={busy} type="submit" className="w-full h-11 bg-brand-orange text-white rounded-md font-semibold hover:bg-brand-orange-hover disabled:bg-slate-600 flex items-center justify-center gap-2">
              {busy ? "Verifying…" : "Sign In"} {!busy && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">Not an admin? <Link to="/login" className="text-slate-300 hover:text-white">Customer Login</Link> · <Link to="/" className="text-slate-300 hover:text-white">Back to Store</Link></p>
      </div>
    </div>
  );
}
