import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Input, Button, Alert, Logo } from "../components/ui";

// ─── Google button ─────────────────────────────────────────────────────────
const GoogleButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-surface-50 hover:border-gray-400 transition-all duration-150 active:scale-[0.98]"
    >
      {/* Google SVG icon */}
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
};

// ─── Divider ───────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-surface-200" />
    <span className="text-xs text-gray-400 font-medium">or</span>
    <div className="flex-1 h-px bg-surface-200" />
  </div>
);

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm]               = useState({ email: "", password: "" });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await login(form);
      if (data?.mfaRequired) {
        navigate("/mfa", { state: { userId: data.userId } });
        return;
      }
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

        <Logo size="md" />

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight">
              Close more deals with AI-powered outreach.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Generate personalized messages, score leads, and track conversations — all in one place.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "AI outreach message generator",
              "Smart lead scoring (0–100)",
              "Automated follow-up suggestions",
              "Conversation history tracking",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-brand-400" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-xs relative z-10">
          © {new Date().getFullYear()} SalesMind AI. Built for modern sales teams.
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] page-enter">

          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="space-y-1.5 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          {/* Google sign-in */}
          <GoogleButton />

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Alert message={serverError} />

            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              error={errors.email}
              autoComplete="email"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <Link to="/forgot-password"
                  className="text-xs text-brand-600 hover:text-brand-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
