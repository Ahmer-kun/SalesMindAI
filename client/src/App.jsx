/**
 * App.jsx
 * Path: client/src/App.jsx
 * UPDATED IN PART 2 PHASES 3+4: Added /forgot-password and /reset-password routes
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { ToastProvider }   from "./context/ToastContext";
import ProtectedRoute      from "./components/ProtectedRoute";
import AppLayout           from "./components/layout/AppLayout";

import LoginPage           from "./pages/LoginPage";
import SignupPage          from "./pages/SignupPage";
import ForgotPasswordPage  from "./pages/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/ResetPasswordPage";
import DashboardPage       from "./pages/DashboardPage";
import LeadsPage           from "./pages/LeadsPage";
import AIToolsPage         from "./pages/AIToolsPage";
import AnalyticsPage       from "./pages/AnalyticsPage";
import SettingsPage        from "./pages/SettingsPage";

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/signup"          element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* Protected */}
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
