/**
 * shown to new Google OAuth users after sign-up.
 * lets them set a username before accessing the app.
 * uses the user's Google avatar and name from AuthContext.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button, Logo } from "../components/ui";
import api from "../services/api";

const CompleteProfilePage = () => {
  const navigate      = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast }     = useToast();

  const [username, setUsername]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [checking, setChecking]   = useState(false);
  const [available, setAvailable] = useState(null); // null | true | false

  // Live username availability check (debounced feel via blur)
  const handleUsernameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, ""); // auto-strip invalid chars
    setUsername(val);
    setError("");
    setAvailable(null);
  };

  const checkAvailability = async () => {
    if (username.length < 2) return;
    setChecking(true);
    try {
      await api.post("/user/complete-profile", { username }); // dry-run not ideal but quick
      // If it would succeed, name is available — but we don't actually commit yet
      // Better: just show neutral, validate on submit
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (username.length < 2) return "Username must be at least 2 characters.";
    if (username.length > 30) return "Username cannot exceed 30 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers and underscores allowed.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const { data } = await api.post("/user/complete-profile", { username });
      updateUser(data.user);
      toast.success("Profile complete! Welcome to SalesMind AI 🎉");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] page-enter">
        <div className="mb-8 flex justify-center"><Logo /></div>

        <div className="card p-8 space-y-6">
          {/* Avatar + welcome */}
          <div className="text-center space-y-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full mx-auto border-2 border-surface-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto text-xl font-semibold text-brand-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {user?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                One last step — choose a username for your SalesMind AI account.
              </p>
            </div>
          </div>

          {/* Pre-filled info */}
          <div className="bg-surface-50 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Name</span>
              <span className="text-xs font-medium text-gray-900">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-xs font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Signed in with</span>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
                Google
              </span>
            </div>
          </div>

          {/* Username input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Choose a username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="yourusername"
                  maxLength={30}
                  autoFocus
                  className={`input-base pl-7 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              {!error && username.length > 0 && (
                <p className="text-xs text-gray-400">
                  Only letters, numbers and underscores · {30 - username.length} chars left
                </p>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Setting up your account..." : "Complete setup →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
