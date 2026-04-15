/**
 * VerifyEmailPage.jsx
 * Path: client/src/pages/VerifyEmailPage.jsx
 *
 * UPDATED: Better handling for already-verified tokens and expired links.
 */

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Logo } from "../components/ui";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get("token");

  const [status, setStatus]   = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token found. Please check your email link.");
        return;
      }

      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (err) {
        const msg = err.response?.data?.message || "Verification failed.";

        // If already verified — treat as success not error
        if (msg.toLowerCase().includes("already verified")) {
          setStatus("already");
        } else if (err.response?.status === 400) {
          // Token used or expired
          setStatus("expired");
        } else {
          setStatus("error");
        }
        setMessage(msg);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] page-enter">
        <div className="mb-8 flex justify-center"><Logo /></div>

        <div className="card p-8 text-center space-y-5">

          {/* Loading */}
          {status === "loading" && (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Verifying your email...</p>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Email verified!</h2>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <Link to="/dashboard"
                className="inline-block px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors">
                Go to dashboard →
              </Link>
            </>
          )}

          {/* Already verified */}
          {status === "already" && (
            <>
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Already verified</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your email is already verified. You're all set!
                </p>
              </div>
              <Link to="/dashboard"
                className="inline-block px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors">
                Go to dashboard →
              </Link>
            </>
          )}

          {/* Expired / used token */}
          {status === "expired" && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Link expired or already used</h2>
                <p className="text-sm text-gray-500 mt-1">
                  This verification link has already been used or has expired.
                  If your email still shows unverified, request a new link from Settings.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/dashboard"
                  className="inline-block px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors">
                  Go to dashboard
                </Link>
                <Link to="/settings"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  Go to Settings to resend →
                </Link>
              </div>
            </>
          )}

          {/* Generic error */}
          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <Link to="/login" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
                Back to login
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

