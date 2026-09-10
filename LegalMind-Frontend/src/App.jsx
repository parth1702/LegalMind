import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UploadProvider } from './context/UploadProvider';
import { Sparkles, Shield, Cpu, Lock } from 'lucide-react';
import LogoMark from './components/brand/LogoMark';

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
  const [step, setStep] = useState(0);
  const loadingSteps = [
    'Initializing LegalMind AI Core Engine...',
    'Loading Statutory Rules (Indian Contract Act 1872, DPDP 2023)...',
    'Configuring Vector Embedding Indexes...',
    'Establishing Encrypted Co-Pilot Session...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [loadingSteps.length]);

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Glassmorphic Loading Container */}
      <div className="relative z-10 card-elevated max-w-md w-full p-8 bg-[#0b1021]/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl space-y-6 text-center">
        {/* Animated Brand Logo & Rings */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 blur-md animate-pulse" />
          <div className="absolute -inset-2 rounded-full border border-cyan-500/30 animate-[spin_8s_linear_infinite] border-t-cyan-400 border-r-transparent" />
          <LogoMark size="lg" animated />
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>LEGALMIND CORE AI v2.4</span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide font-mono h-6 flex items-center justify-center">
            {loadingSteps[step]}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Enterprise Contract Intelligence & Statutory Compliance Engine
          </p>
        </div>

        {/* Glowing Progress Indicator */}
        <div className="space-y-2">
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-2 overflow-hidden p-0.5 relative">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 animate-pulse transition-all duration-500 w-3/4" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted
            </span>
            <span>Indian Law Framework</span>
          </div>
        </div>

        {/* Footer Features Badges */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> DPDP 2023 Ready
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-400" /> RAG Vector Rerank
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UploadProvider>
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
