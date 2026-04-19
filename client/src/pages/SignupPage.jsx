import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Input, Button, Alert, Logo } from "../components/ui";

const GoogleButton = () => {
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`;
  };
  return (
    <button
      onClick={handleGoogleSignup}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-surface-50 hover:border-gray-400 transition-all duration-150 active:scale-[0.98]"
    >
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

const Divider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-surface-200" />
    <span className="text-xs text-gray-400 font-medium">or</span>
    <div className="flex-1 h-px bg-surface-200" />
  </div>
);

const SignupPage = () => {
  const navigate   = useNavigate();
  const { signup } = useAuth();
  const { toast }  = useToast();

  const [form, setForm]               = useState({ name: "", email: "", password: "" });
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
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters required";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = "Must include uppercase, lowercase, and a number";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signup(form);
      toast.success("Account created! Welcome to SalesMind AI.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
    const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <Logo size="md" />

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight">
              Start closing deals smarter, not harder.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Join sales teams using AI to personalize outreach and follow up at scale.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "3x",   label: "More replies" },
              { value: "60%",  label: "Less writing time" },
              { value: "100%", label: "Free to start" },
              { value: "∞",    label: "Leads supported" },
            ].map(({ value, label }) => (
              <div key={label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs relative z-10">
          © {new Date().getFullYear()} SalesMind AI
        </p>
      </div>

      {/* Right: signup form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] page-enter">

          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="space-y-1.5 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-gray-500">Free forever. No credit card required.</p>
          </div>

          {/* Google sign-up */}
          <GoogleButton />

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Alert message={serverError} />

            <Input
              label="Full name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              error={errors.name}
              autoComplete="name"
              autoFocus
            />

            <Input
              label="Work email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              error={errors.email}
              autoComplete="email"
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                error={errors.password}
                autoComplete="new-password"
              />
              {strength && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-surface-200"
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strength.label}</p>
                </div>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-xs text-center text-gray-400 leading-relaxed">
              By signing up, you agree to our{" "}
              <span className="text-gray-600 underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;