import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UploadProvider } from './context/UploadProvider';
import LogoMark from './components/brand/LogoMark';
import RouteProgressBar from './components/layout/RouteProgressBar';

// Lazy-loaded route pages for bundle code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthLayout = lazy(() => import('./components/auth/AuthLayout'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyPage = lazy(() => import('./pages/auth/VerifyPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminRoute = lazy(() => import('./components/auth/AdminRoute'));

// Fallback spinner for lazy chunk loading
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-xs w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-center shadow-md">
        <div className="mx-auto w-10 h-10 flex items-center justify-center">
          <LogoMark size="md" animated />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">LegalMind AI</h2>
          <p className="text-xs text-slate-500">Loading workspace components...</p>
        </div>
        <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UploadProvider>
      {/* Global top-of-page progress bar — fires on every route change */}
      <RouteProgressBar />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Landing, Contact, & About Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication Pages */}
          <Route path="/auth/admin-login" element={<AdminLoginPage />} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Authenticated Application Shell Layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="analysis/:id" element={<AnalysisPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </UploadProvider>
  );
}
