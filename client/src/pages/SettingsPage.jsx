/**
 * SettingsPage.jsx
 * Path: client/src/pages/SettingsPage.jsx
 *
 * Account settings page with three sections:
 *  1. Profile — update name and email
 *  2. Password — change password
 *  3. Danger zone — delete account permanently
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { Input, Button } from "../components/ui";
import api from "../services/api";

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, description, children }) => (
  <div className="card overflow-hidden">
    <div className="px-6 py-4 border-b border-surface-100">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ─── Profile Section ──────────────────────────────────────────────────────────
const ProfileSection = ({ user, onUpdate }) => {
  const { toast } = useToast();
  const [form, setForm]     = useState({ name: user?.name || "", email: user?.email || "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Only send changed fields
    const updates = {};
    if (form.name.trim() !== user?.name) updates.name = form.name.trim();
    if (form.email.trim().toLowerCase() !== user?.email) updates.email = form.email.trim();

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setLoading(true);
    try {
      const data = await userService.updateProfile(updates);
      onUpdate(data.user);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Profile" description="Update your name and email address.">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Your name"
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@company.com"
        />
        <Button type="submit" loading={loading}>
          Save changes
        </Button>
      </form>
    </Section>
  );
};

// ─── Password Section ─────────────────────────────────────────────────────────
const PasswordSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Current password is required";
    if (!form.newPassword) e.newPassword = "New password is required";
    else if (form.newPassword.length < 8) e.newPassword = "At least 8 characters required";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword))
      e.newPassword = "Must include uppercase, lowercase, and a number";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = () => {
    const p = form.newPassword;
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
    <Section title="Password" description="Use a strong password with at least 8 characters.">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          label="Current password"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className="space-y-2">
          <Input
            label="New password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {strength && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-surface-200"
                  }`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">{strength.label}</p>
            </div>
          )}
        </div>

        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading}>
          Change password
        </Button>
      </form>
    </Section>
  );
};

// ─── Email Verification Section ───────────────────────────────────────────────
const EmailVerificationSection = ({ user }) => {
  const { toast }       = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  if (user?.isEmailVerified) {
    return (
      <Section title="Email verification" description="Your identity has been confirmed.">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{user.email}</span> is verified.
          </p>
        </div>
      </Section>
    );
  }

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
      toast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Email verification" description="Verify your email to secure your account.">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">Email not verified</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {user?.email} — check your inbox for the verification link.
          </p>
        </div>
      </div>
      {sent ? (
        <p className="text-sm text-green-600 font-medium">✓ Verification email sent — check your inbox.</p>
      ) : (
        <Button onClick={handleResend} loading={loading} variant="ghost">
          Resend verification email
        </Button>
      )}
    </Section>
  );
};

// ─── MFA Section ──────────────────────────────────────────────────────────────
const MFASection = ({ user, onUpdate }) => {
  const { toast }             = useToast();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(user?.mfaEnabled || false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/toggle-mfa");
      setEnabled(data.mfaEnabled);
      onUpdate({ ...user, mfaEnabled: data.mfaEnabled });
      toast.success(`MFA ${data.mfaEnabled ? "enabled" : "disabled"} successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle MFA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Two-factor authentication"
      description="Add an extra layer of security to your account."
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-6">
          <p className="text-sm text-gray-700 font-medium">
            {enabled ? "MFA is enabled" : "MFA is disabled"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {enabled
              ? "A 6-digit code will be sent to your email each time you log in."
              : "Enable to require a 6-digit email code on every login."}
          </p>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
            enabled ? "bg-brand-600" : "bg-surface-300"
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>

      {enabled && (
        <p className="text-xs text-brand-600 mt-3 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Active — you'll be prompted for a code on your next login.
        </p>
      )}
    </Section>
  );
};

// ─── Danger Zone Section ──────────────────────────────────────────────────────
const DangerZoneSection = () => {
  const { logout } = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();
  const [open, setOpen]       = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("Password is required to confirm deletion.");
      return;
    }

    setLoading(true);
    try {
      await userService.deleteAccount(password);
      await logout();
      toast.info("Your account has been permanently deleted.");
      navigate("/signup");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Danger zone" description="These actions are permanent and cannot be undone.">
      {!open ? (
        <Button
          variant="danger"
          onClick={() => setOpen(true)}
        >
          Delete my account
        </Button>
      ) : (
        <div className="space-y-4 max-w-md">
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-medium text-red-700 mb-1">
              This will permanently delete:
            </p>
            <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
              <li>Your account and profile</li>
              <li>All your leads and their data</li>
              <li>All AI-generated messages</li>
              <li>All analytics history</li>
            </ul>
          </div>

          <Input
            label="Enter your password to confirm"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="••••••••"
            error={error}
          />

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => { setOpen(false); setPassword(""); setError(""); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={loading}
              onClick={handleDelete}
              className="flex-1"
            >
              {loading ? "Deleting..." : "Yes, delete everything"}
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user }    = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

  const handleUpdate = (updatedUser) => setCurrentUser(updatedUser);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and security.</p>
      </div>

      {/* Account info card */}
      <div className="card px-6 py-4 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-lg font-semibold text-brand-700 flex-shrink-0">
          {currentUser?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
            {currentUser?.isEmailVerified
              ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Verified</span>
              : <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Unverified</span>
            }
          </div>
          <p className="text-xs text-gray-500">{currentUser?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {new Date(currentUser?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <ProfileSection user={currentUser} onUpdate={handleUpdate} />
        <EmailVerificationSection user={currentUser} />
        <MFASection user={currentUser} onUpdate={handleUpdate} />
        <PasswordSection />
        <DangerZoneSection />
      </div>
    </div>
  );
};

export default SettingsPage;