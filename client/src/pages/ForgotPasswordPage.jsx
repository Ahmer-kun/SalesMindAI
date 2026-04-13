/**
 * ForgotPasswordPage.jsx
 * Path: client/src/pages/ForgotPasswordPage.jsx
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert, Logo } from "../components/ui";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email."); return; }

    setLoading(true);
    setError("");
    try {
      await api.post("/password/forgot", { email });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] page-enter">
        <div className="mb-8"><Logo /></div>

        {submitted ? (
          <div className="card p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500 mt-1">
                If <span className="font-medium text-gray-700">{email}</span> has an account,
                you'll receive a reset link shortly.
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Didn't get it? Check your spam folder or{" "}
              <button onClick={() => setSubmitted(false)} className="text-brand-600 hover:underline">
                try again
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Forgot your password?
              </h2>
              <p className="text-sm text-gray-500">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Alert message={error} />
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@company.com"
                autoFocus
              />
              <Button type="submit" fullWidth loading={loading}>
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember it?{" "}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
