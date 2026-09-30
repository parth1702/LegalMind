import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white dark:from-[#090d16] dark:to-[#090d16] pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column — Text */}
          <div className="space-y-6">
            {/* Product Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-sky-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 animate-pulse" />
              AI Powered Legal Analysis
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1]">
                Understand Legal Documents
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-600 dark:text-sky-400 leading-[1.1]">
                In Minutes, Not Hours.
              </h1>
            </div>

            {/* Sub-text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Upload contracts, agreements, and policies. Get AI-powered summaries, detect risky clauses, and chat with your documents instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/app/documents' : '/auth/login'}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {isAuthenticated ? (
                <Link to="/app/dashboard" className="btn btn-outline btn-lg w-full sm:w-auto">
                  <span>Go to Console</span>
                </Link>
              ) : (
                <Link to="/auth/login" className="btn btn-outline btn-lg w-full sm:w-auto">
                  <span>Learn More</span>
                </Link>
              )}
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Automated Clause Extraction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>4-Tier Risk Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>RAG Legal Co-Pilot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Enterprise Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column — Document Preview Card */}
          <div className="relative hidden lg:flex justify-center">
            {/* Main card */}
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-5 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-10 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Employment Contract.pdf</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI Analysis Complete</p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Risk Score: Low</span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-lg px-3 py-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Summary Generated</span>
              </div>

              {/* Floating warning badge */}
              <div className="absolute -bottom-4 -left-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/50 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-md">
                <span className="text-base">⚠️</span>
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">3 Risky Clauses Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
