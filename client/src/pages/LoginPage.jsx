import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Input, Button, Alert, Logo } from "../components/ui";

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]     = useState(false);

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
      await login(form);
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

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        {/* Glow */}
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

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] page-enter">

          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="space-y-1.5 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

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
              autoFocus
            />

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

// /**
//  * LoginPage.jsx
//  * Login form with validation, error handling, and redirect on success.
//  */

// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Input, Button, Alert, Logo } from "../components/ui";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth();

//   // Redirects to where the user was trying to go, or dashboard
//   const from = location.state?.from?.pathname || "/dashboard";

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     // Clear field error on change
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!form.email) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
//     if (!form.password) newErrors.password = "Password is required";
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setServerError("");

//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length) {
//       setErrors(validationErrors);
//       return;
//     }

//     setLoading(true);
//     try {
//       await login(form);
//       navigate(from, { replace: true });
//     } catch (err) {
//       const msg = err.response?.data?.message || "Login failed. Please try again.";
//       setServerError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-surface-50 flex">
//       {/* Left: Branding Panel */}
//       <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
//         {/* Subtle background pattern */}
//         <div className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
//             backgroundSize: "32px 32px",
//           }}
//         />
//         {/* Accent glow */}
//         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

//         <Logo size="md" />

//         <div className="relative z-10 space-y-6">
//           <div className="space-y-3">
//             <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight">
//               Close more deals with AI-powered outreach.
//             </h1>
//             <p className="text-gray-400 text-base leading-relaxed">
//               Generate personalized messages, score leads, and track conversations — all in one place.
//             </p>
//           </div>

//           {/* Feature bullets */}
//           <ul className="space-y-3">
//             {[
//               "AI outreach message generator",
//               "Smart lead scoring (0–100)",
//               "Automated follow-up suggestions",
//               "Conversation history tracking",
//             ].map((item) => (
//               <li key={item} className="flex items-center gap-3 text-sm text-gray-400">
//                 <span className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center flex-shrink-0">
//                   <svg className="w-2.5 h-2.5 text-brand-400" fill="currentColor" viewBox="0 0 8 8">
//                     <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z"/>
//                   </svg>
//                 </span>
//                 {item}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <p className="text-gray-600 text-xs relative z-10">
//           © {new Date().getFullYear()} SalesMind AI. Built for modern sales teams.
//         </p>
//       </div>

//       {/* Right: Login Form */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="w-full max-w-[400px] page-enter">
//           {/* Mobile logo */}
//           <div className="lg:hidden mb-8">
//             <Logo />
//           </div>

//           <div className="space-y-1.5 mb-8">
//             <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
//               Welcome back
//             </h2>
//             <p className="text-sm text-gray-500">
//               Sign in to your account to continue
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4" noValidate>
//             <Alert message={serverError} />

//             <Input
//               label="Email address"
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="you@company.com"
//               error={errors.email}
//               autoComplete="email"
//               autoFocus
//             />

//             <div>
//               <Input
//                 label="Password"
//                 type="password"
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 error={errors.password}
//                 autoComplete="current-password"
//               />
//             </div>

//             <Button
//               type="submit"
//               fullWidth
//               loading={loading}
//               className="mt-2"
//             >
//               {loading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>

//           <p className="mt-6 text-center text-sm text-gray-500">
//             Don't have an account?{" "}
//             <Link
//               to="/signup"
//               className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
//             >
//               Create one free
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
