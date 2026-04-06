/**
 * ui/index.jsx
 * Small, reusable UI primitives used across the app.
 */

import React from "react";

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = React.forwardRef(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={ref}
        className={`input-base ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    danger:
      "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl transition-all duration-150 hover:bg-red-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
  };

  return (
    <button
      className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
};

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ type = "error", message }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-brand-50 border-brand-200 text-brand-700",
  };

  return (
    <div className={`px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      {message}
    </div>
  );
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const Logo = ({ size = "md" }) => {
  const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  return (
    <div className={`flex items-center gap-2 font-semibold ${sizes[size]}`}>
      <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
        S
      </div>
      <span className="text-gray-900 tracking-tight">
        SalesMind <span className="text-brand-600">AI</span>
      </span>
    </div>
  );
};
