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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Legal Workspace
            </span>
            <AiIndicator status="idle" label="AI System Ready" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{displayName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {totalCount === 0 ? (
              <span>
                Your document repository is currently empty. Upload your first commercial contract or NDA to start automated AI clause extraction.
              </span>
            ) : (
              <span>
                Your repository has{' '}
                <span className="text-rose-600 dark:text-rose-400 font-medium font-mono">
                  {highRiskCount} high-risk {highRiskCount === 1 ? 'anomaly' : 'anomalies'}
                </span>{' '}
                requiring review. {analyzedCount} of {totalCount} {totalCount === 1 ? 'contract' : 'contracts'} fully parsed and indexed.
              </span>
            )}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onUploadClick}
            className="btn btn-primary btn-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <Link to="/app/assistant" className="btn btn-secondary btn-md">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Ask AI Co-Pilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
