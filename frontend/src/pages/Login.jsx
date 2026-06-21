import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, Truck, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../lib/brand";
import { toast } from "sonner";

const SIDE = "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=900&q=80";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/account";
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const u = mode === "login" ? await login({ email: form.email, password: form.password }) : await register(form);
      toast.success(`Welcome${u.name ? ", " + u.name.split(" ")[0] : ""}!`);
      navigate(u.role === "admin" ? "/admin" : redirect);
    } catch (e) {
      const d = e.response?.data?.detail;
      setError(typeof d === "string" ? d : "Authentication failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid md:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-brand-dark text-white p-8 relative">
          <img src={SIDE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="relative">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-md overflow-hidden p-0.5"><img src={BRAND.logoIcon} alt="" className="w-full h-full object-contain" /></div>
              <span className="font-display font-extrabold text-xl">PartStation<span className="text-brand-orange">.in</span></span>
            </Link>
            <h2 className="font-display text-3xl font-extrabold mt-8 leading-tight">India's destination for genuine printer & IT spare parts.</h2>
            <p className="text-white/70 mt-3 text-sm">Login to track orders, download GST invoices and check out faster.</p>
          </div>
          <div className="relative space-y-3 mt-8">
            {[[BadgeIndianRupee, "GST invoice on every order"], [Truck, "Fast India-wide shipping"], [ShieldCheck, "Genuine, compatible parts"]].map(([Icon, t], i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/90"><Icon size={18} className="text-brand-orange" /> {t}</div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="p-6 sm:p-8">
          <Link to="/" className="md:hidden block text-center font-display font-extrabold text-2xl mb-5">PartStation<span className="text-brand-orange">.in</span></Link>
          <h1 className="font-display text-2xl font-bold text-ink">{mode === "login" ? "Login" : "Create your account"}</h1>
          <p className="text-sm text-slate-500 mt-1">{mode === "login" ? "Welcome back! Please enter your details." : "Join PartStation.in in seconds."}</p>

          <div className="flex border border-slate-200 rounded-md mt-5 mb-5 overflow-hidden">
            <button onClick={() => setMode("login")} data-testid="tab-login" className={`flex-1 py-2.5 text-sm font-semibold ${mode === "login" ? "bg-brand text-white" : "bg-white text-slate-600"}`}>Login</button>
            <button onClick={() => setMode("register")} data-testid="tab-register" className={`flex-1 py-2.5 text-sm font-semibold ${mode === "register" ? "bg-brand text-white" : "bg-white text-slate-600"}`}>Sign Up</button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <input data-testid="reg-name" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
                <input data-testid="reg-phone" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
              </>
            )}
            <input data-testid="login-email" required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
            <input data-testid="login-password" required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
            {error && <p className="text-sm text-red-600" data-testid="auth-error">{error}</p>}
            <button data-testid="auth-submit" disabled={busy} type="submit" className="w-full h-11 bg-brand-orange text-white rounded-md font-semibold hover:bg-brand-orange-hover disabled:bg-slate-300 flex items-center justify-center gap-2">
              {busy ? "Please wait…" : mode === "login" ? "Login" : "Create Account"} {!busy && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <button disabled className="w-full h-11 border border-slate-300 rounded-md text-sm text-slate-400 cursor-not-allowed">Continue with Google (coming soon)</button>
            <button disabled className="w-full h-11 border border-slate-300 rounded-md text-sm text-slate-400 cursor-not-allowed">Login with Mobile OTP (coming soon)</button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">Are you an administrator? <Link to="/admin/login" className="text-brand font-semibold">Admin Login</Link></p>
        </div>
      </div>
    </div>
  );
}
