/**
 * handles redirect from backend after Google OAuth.
 * existing users → /dashboard
 * new users → /complete-profile (to set username)
 */

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { Logo } from "../components/ui";

const GoogleAuthSuccess = () => {
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();
  const { loginWithToken } = useAuth();
  const { toast }          = useToast();

  useEffect(() => {
    const handleSuccess = async () => {
      const token     = searchParams.get("token");
      const isNewUser = searchParams.get("isNewUser") === "true";
      const error     = searchParams.get("error");

      if (error || !token) {
        toast.error("Google sign-in failed. Please try again.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        localStorage.setItem("accessToken", token);
        const { user } = await authService.getMe();
        loginWithToken(token, user);

        if (isNewUser || !user.profileComplete) {
          // New Google user — needs to set username
          navigate("/complete-profile", { replace: true });
        } else {
          toast.success(`Welcome back, ${user.name}!`);
          navigate("/dashboard", { replace: true });
        }
      } catch {
        localStorage.removeItem("accessToken");
        toast.error("Failed to complete sign-in. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    handleSuccess();
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-gray-500">Completing sign-in with Google...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;