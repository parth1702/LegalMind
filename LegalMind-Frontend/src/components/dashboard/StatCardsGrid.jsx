import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

export default function StatCardsGrid({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Documents */}
      <div className="card-base p-5 space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Documents
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.totalDocuments.value}</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> {stats.totalDocuments.change}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{stats.totalDocuments.label}</div>
      </div>

      {/* 2. Documents Analyzed */}
      <div className="card-base p-5 space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Documents Analyzed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.documentsAnalyzed.value}</div>
          <span className="badge badge-low text-[10px]">{stats.documentsAnalyzed.percentage} Complete</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">Indexed for semantic search & Q&A</div>
      </div>

      {/* 3. High-Risk Documents */}
      <div className="card-base p-5 space-y-3 bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-500/30 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-rose-700 dark:text-rose-300 uppercase tracking-wider font-semibold">
            High Risk Flags
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{stats.highRiskDocuments.value}</div>
          <span className="badge badge-critical text-[10px]">{stats.highRiskDocuments.critical} Critical</span>
        </div>
        <div className="text-[11px] text-rose-600/80 dark:text-rose-300/80">Requires immediate legal counsel review</div>
      </div>

      {/* 4. Pending Analysis */}
      <div className="card-base p-5 space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Queue
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.pendingAnalysis.value}</div>
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{stats.pendingAnalysis.estimatedTime}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">Currently processing in pipeline</div>
      </div>
    </div>
  );
}
