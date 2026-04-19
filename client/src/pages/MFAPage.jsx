import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { Button, Logo } from "../components/ui";

const MFAPage = () => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const { loginWithToken } = useAuth();
  const { toast }          = useToast();

  const userId    = location.state?.userId;
  const inputRefs = useRef([]);

  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!userId) navigate("/login");
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits."); return; }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verify-mfa", { userId, otp: code });

      // Use loginWithToken — sets BOTH token AND user in AuthContext
      // This ensures ProtectedRoute sees isAuthenticated: true immediately
      loginWithToken(data.accessToken, data.user);

      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] page-enter">
        <div className="mb-8 flex justify-center"><Logo /></div>

        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Check your email</h2>
            <p className="text-sm text-gray-500 mt-1">
              We sent a 6-digit code to your email. Enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-lg font-semibold rounded-xl border bg-white outline-none transition-all duration-150 ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-surface-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Verifying..." : "Verify code"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFAPage;
