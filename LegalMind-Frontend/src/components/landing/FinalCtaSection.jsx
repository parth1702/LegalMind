import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinalCtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-10 sm:py-14 bg-slate-50 dark:bg-[#050814] px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-xl space-y-6">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white mx-auto shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Transform Your Legal Document Review Today
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Eliminate manual contract oversight. Experience AI-powered clause extraction, automated risk scoring, and intelligent legal co-pilot support.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={isAuthenticated ? '/app/documents' : '/auth/login'}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-xs shadow-md"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Analyze a Document Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-blue-700/80 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-xs border border-blue-400/40"
              >
                Go to Console
              </Link>
            ) : (
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center bg-blue-700/80 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-xs border border-blue-400/40"
              >
                Create Free Account
              </Link>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-200 font-mono pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>No credit card required • Instant setup • Enterprise encryption</span>
          </div>
        </div>
      </div>
    </section>
  );
}
