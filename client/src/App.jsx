import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }       from "./context/AuthContext";
import { ToastProvider }      from "./context/ToastContext";
import ProtectedRoute         from "./components/ProtectedRoute";
import AppLayout              from "./components/layout/AppLayout";

import LoginPage              from "./pages/LoginPage";
import SignupPage             from "./pages/SignupPage";
import ForgotPasswordPage     from "./pages/ForgotPasswordPage";
import ResetPasswordPage      from "./pages/ResetPasswordPage";
import MFAPage                from "./pages/MFAPage";
import VerifyEmailPage        from "./pages/VerifyEmailPage";
import GoogleAuthSuccess      from "./pages/GoogleAuthSuccess";
import CompleteProfilePage    from "./pages/CompleteProfilePage";
import DashboardPage          from "./pages/DashboardPage";
import LeadsPage              from "./pages/LeadsPage";
import AIToolsPage            from "./pages/AIToolsPage";
import AnalyticsPage          from "./pages/AnalyticsPage";
import SettingsPage           from "./pages/SettingsPage";

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/signup"              element={<SignupPage />} />
          <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
          <Route path="/reset-password"      element={<ResetPasswordPage />} />
          <Route path="/mfa"                 element={<MFAPage />} />
          <Route path="/verify-email"        element={<VerifyEmailPage />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

          {/* Semi-protected: needs auth but not full profile */}
          <Route path="/complete-profile"    element={<CompleteProfilePage />} />

          {/* Fully protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leads"     element={<LeadsPage />} />
              <Route path="/ai-tools"  element={<AIToolsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings"  element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

export default App;