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
  const { user, login } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

  // When profile updates, sync to local state
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Also update AuthContext so topbar/sidebar reflects new name
    // We do this by re-fetching via /api/auth/me on next load
    // For instant update we patch localStorage indirectly via the context
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account preferences and security.
        </p>
      </div>

      {/* Account info card */}
      <div className="card px-6 py-4 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-lg font-semibold text-brand-700 flex-shrink-0">
          {currentUser?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
          <p className="text-xs text-gray-500">{currentUser?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {new Date(currentUser?.createdAt).toLocaleDateString("en-US", {
              month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <ProfileSection user={currentUser} onUpdate={handleProfileUpdate} />
        <PasswordSection />
        <DangerZoneSection />
      </div>
    </div>
  );
};

export default SettingsPage;
