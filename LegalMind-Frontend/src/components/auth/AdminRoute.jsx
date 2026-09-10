import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import LogoMark from '../brand/LogoMark';

/**
 * AdminRoute Guard — Ensures only authenticated users with role === 'admin' can access restricted Admin routes.
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040711] flex flex-col items-center justify-center space-y-4">
        <LogoMark size="lg" animated />
        <span className="text-xs font-mono text-cyan-400">Verifying Admin Role Authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_24px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
            <Lock className="w-3.5 h-3.5" /> 403 ACCESS DENIED
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-mono">Restricted Admin Portal</h1>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Your user role <span className="text-cyan-300 font-bold font-mono">({user?.role || 'user'})</span> does not possess System Super Admin permissions. Contact your Enterprise Administrator to request role escalation.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <a href="/app/dashboard" className="btn btn-secondary btn-md flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Dashboard</span>
          </a>
          <a href="/auth/admin-login" className="btn btn-primary btn-md flex items-center gap-2">
            <span>Admin Sign In</span>
          </a>
        </div>
      </div>
    );
  }

  return children;
}
