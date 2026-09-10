import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinalCtaSection() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <section className="py-16 sm:py-24 bg-[#050814] relative overflow-hidden border-t border-slate-800/80">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-100">
            Transform Your Legal Document Review Today
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate manual contract oversight. Experience AI-powered clause extraction, automated risk scoring, and intelligent legal co-pilot support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={isAuthenticated ? "/app/documents" : "/auth/login"}
            className="btn btn-primary btn-lg w-full sm:w-auto shadow-xl shadow-cyan-500/25"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze a Document Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/app/dashboard" className="btn btn-secondary btn-lg w-full sm:w-auto text-cyan-300 font-semibold">
                <span>Go to Console</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-lg w-full sm:w-auto text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <Link to="/auth/register" className="btn btn-secondary btn-lg w-full sm:w-auto">
              <span>Create Free Account</span>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>No credit card required • Instant setup • Enterprise encryption</span>
        </div>
      </div>
    </section>
  );
}
