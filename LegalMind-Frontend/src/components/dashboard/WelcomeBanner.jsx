import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UploadCloud, Shield, ArrowRight } from 'lucide-react';
import AiIndicator from '../brand/AiIndicator';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeBanner({
  onUploadClick,
  totalCount = 0,
  analyzedCount = 0,
  highRiskCount = 0,
}) {
  const { user } = useAuth();
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Legal Counsel');

  return (
    <div className="card-elevated p-6 sm:p-8 bg-gradient-to-r from-[#0b1021] via-[#0e162e] to-[#0b1021] border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Subtle Accent */}
      <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Legal Workspace Console
            </span>
            <AiIndicator status="idle" label="AI Active" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Welcome back, <span className="text-cyan-400">{displayName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {totalCount === 0 ? (
              <span>
                Your document repository is currently empty. Upload your first commercial contract or NDA to start automated AI clause extraction.
              </span>
            ) : (
              <span>
                Your document repository has{' '}
                <span className="text-rose-400 font-semibold font-mono">
                  {highRiskCount} high-risk {highRiskCount === 1 ? 'anomaly' : 'anomalies'}
                </span>{' '}
                requiring senior review. {analyzedCount} of {totalCount} {totalCount === 1 ? 'contract has' : 'contracts have'} been fully parsed and indexed.
              </span>
            )}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onUploadClick}
            className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <Link to="/app/assistant" className="btn btn-secondary btn-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ask AI Co-Pilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
