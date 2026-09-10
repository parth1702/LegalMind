import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 leading-[1.15]">
            AI-Powered Legal Document <span className="bg-gradient-to-r from-cyan-400 via-brand-300 to-indigo-400 bg-clip-text text-transparent">Understanding & Intelligence</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Upload complex legal agreements, extract critical clauses automatically, detect compliance risks with precision, and interrogate contracts using an interactive AI legal co-pilot.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={isAuthenticated ? "/app/documents" : "/auth/login"}
            className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze a Document</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/app/dashboard" className="btn btn-secondary btn-lg w-full sm:w-auto font-semibold text-cyan-300">
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
            <>
              <Link to="/auth/login" className="btn btn-secondary btn-lg w-full sm:w-auto">
                <span>Log In</span>
              </Link>

              <Link to="/auth/register" className="btn btn-outline btn-lg w-full sm:w-auto">
                <span>Sign Up / Create Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Core Value Micro-Pill List */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant Clause Extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>4-Tier Risk Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Conversational AI Co-Pilot</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Enterprise-Grade Encryption</span>
          </div>
        </div>
      </div>
    </section>
  );
}
