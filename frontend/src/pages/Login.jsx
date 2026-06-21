import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
    setError("");
    setBusy(true);
    try {
      const user = mode === "login"
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      toast.success(`Welcome${user.name ? ", " + user.name.split(" ")[0] : ""}!`);
      navigate(user.role === "admin" ? "/admin" : redirect);
    } catch (e) {
      const d = e.response?.data?.detail;
      setError(typeof d === "string" ? d : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link to="/" className="block text-center font-cabinet font-black text-2xl mb-6">Part<span className="text-brand">Station</span><span className="text-brand-orange">.in</span></Link>
      <div className="border border-gray-200 rounded-sm p-6">
        <div className="flex border border-gray-200 rounded-sm mb-6 overflow-hidden">
          <button onClick={() => setMode("login")} data-testid="tab-login" className={`flex-1 py-2.5 text-sm font-medium ${mode === "login" ? "bg-brand text-white" : "bg-white text-gray-600"}`}>Login</button>
          <button onClick={() => setMode("register")} data-testid="tab-register" className={`flex-1 py-2.5 text-sm font-medium ${mode === "register" ? "bg-brand text-white" : "bg-white text-gray-600"}`}>Sign Up</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <>
              <input data-testid="reg-name" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand" />
              <input data-testid="reg-phone" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand" />
            </>
          )}
          <input data-testid="login-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand" />
          <input data-testid="login-password" required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 border border-gray-300 rounded-sm px-3 text-sm focus:outline-none focus:border-brand" />
          {error && <p className="text-sm text-red-600" data-testid="auth-error">{error}</p>}
          <button data-testid="auth-submit" disabled={busy} type="submit" className="w-full h-11 bg-brand text-white rounded-sm font-medium hover:bg-brand-hover disabled:bg-gray-300">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <button disabled className="w-full h-11 border border-gray-300 rounded-sm text-sm text-gray-400 cursor-not-allowed">Continue with Google (coming soon)</button>
          <button disabled className="w-full h-11 border border-gray-300 rounded-sm text-sm text-gray-400 cursor-not-allowed">Login with Mobile OTP (coming soon)</button>
        </div>
      </div>
    </div>
  );
}
