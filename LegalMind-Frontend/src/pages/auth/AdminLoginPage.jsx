import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import LogoMark from '../../components/brand/LogoMark';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await login({ email, password });
      if (res && (res.token || res.user)) {
        if (res.user?.role !== 'admin') {
          setErrorMessage('Access Denied: Account exists but is not registered as a System Admin.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Admin Authentication Verified! Redirecting to Admin Console...');
        setTimeout(() => {
          navigate('/app/admin');
        }, 1000);
      } else {
        setErrorMessage(res?.message || 'Invalid admin credentials. Check email and password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Admin authentication failed. Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillSeedCredentials = () => {
    setEmail('admin@legalmind.ai');
    setPassword('Admin@LegalMind2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-rose-100/60 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-100/60 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20" />
            <LogoMark size="lg" animated />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-[11px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SYSTEM SUPER ADMIN PORTAL</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              Admin Authenticated Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              System database control, role security &amp; server management
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-green-50 dark:bg-emerald-950/60 border border-green-200 dark:border-emerald-800/80 text-xs font-mono text-green-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Quick Seed Credentials Trigger */}
        <button
          type="button"
          onClick={handleFillSeedCredentials}
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all flex items-center justify-between shadow-sm group"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:animate-spin" />
            <span>Auto-Fill Seed Admin Credentials</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold underline">Click to Fill</span>
        </button>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@legalmind.ai"
                className="input-base text-xs pl-10 pr-4 py-3 rounded-xl"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Admin Master Key / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-base text-xs pl-10 pr-4 py-3 rounded-xl"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn btn-danger btn-md w-full justify-center font-mono font-bold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Authenticating Admin Token...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Authenticate Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 dark:text-slate-500">
          <Link to="/auth/login" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
            ← Standard User Login
          </Link>
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
            Main Site →
          </Link>
        </div>
      </div>
    </div>
  );
}
