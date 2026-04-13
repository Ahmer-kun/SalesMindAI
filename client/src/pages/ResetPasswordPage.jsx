/**
 * ResetPasswordPage.jsx
 * Path: client/src/pages/ResetPasswordPage.jsx
 *
 * User arrives here from the email link with ?token=xxx
 * Validates token then lets user set a new password.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input, Button, Alert, Logo } from "../components/ui";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const ResetPasswordPage = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { toast }       = useToast();
  const token           = searchParams.get("token");

  const [tokenValid, setTokenValid]   = useState(null); // null=checking, true=valid, false=invalid
  const [form, setForm]               = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }

    api.get(`/password/validate/${token}`)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = "Password is required";
    else if (form.newPassword.length < 8) e.newPassword = "At least 8 characters required";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword))
      e.newPassword = "Must include uppercase, lowercase, and a number";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post(`/password/reset/${token}`, { newPassword: form.newPassword });
      toast.success("Password reset! Please sign in with your new password.");
      navigate("/login");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Checking token validity
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center page-enter">
          <div className="mb-8"><Logo /></div>
          <div className="card p-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Link expired or invalid</h2>
              <p className="text-sm text-gray-500 mt-1">
                This reset link is no longer valid. Reset links expire after 1 hour.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button fullWidth>Request a new reset link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid token — show reset form
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] page-enter">
        <div className="mb-8"><Logo /></div>

        <div className="space-y-1.5 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Set new password
          </h2>
          <p className="text-sm text-gray-500">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alert message={serverError} />

          <div className="space-y-2">
            <Input
              label="New password"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              error={errors.newPassword}
              autoFocus
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {form.newPassword && (() => {
              let score = 0;
              if (form.newPassword.length >= 8) score++;
              if (/[A-Z]/.test(form.newPassword)) score++;
              if (/[a-z]/.test(form.newPassword)) score++;
              if (/\d/.test(form.newPassword)) score++;
              if (/[^A-Za-z0-9]/.test(form.newPassword)) score++;
              const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"];
              return (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-surface-200"}`} />
                  ))}
                </div>
              );
            })()}
          </div>

          <Input
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
