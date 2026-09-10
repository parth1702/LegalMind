import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

export default function StatCardsGrid({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Documents */}
      <div className="card-base p-5 space-y-3 border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Total Documents
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-100">{stats.totalDocuments.value}</div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> {stats.totalDocuments.change}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">{stats.totalDocuments.label}</div>
      </div>

      {/* 2. Documents Analyzed */}
      <div className="card-base p-5 space-y-3 border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Documents Analyzed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-100">{stats.documentsAnalyzed.value}</div>
          <span className="badge badge-low text-[10px]">{stats.documentsAnalyzed.percentage} Complete</span>
        </div>
        <div className="text-[11px] text-slate-400">Indexed for semantic search & Q&A</div>
      </div>

      {/* 3. High-Risk Documents */}
      <div className="card-base p-5 space-y-3 border-rose-500/30 bg-rose-950/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-rose-300 uppercase tracking-wider">
            High Risk Flags
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-rose-400">{stats.highRiskDocuments.value}</div>
          <span className="badge badge-critical text-[10px]">{stats.highRiskDocuments.critical} Critical</span>
        </div>
        <div className="text-[11px] text-rose-300/80">Requires immediate legal counsel review</div>
      </div>

      {/* 4. Pending Analysis */}
      <div className="card-base p-5 space-y-3 border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Pending Queue
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-100">{stats.pendingAnalysis.value}</div>
          <span className="text-xs font-mono text-cyan-400">{stats.pendingAnalysis.estimatedTime}</span>
        </div>
        <div className="text-[11px] text-slate-400">Currently processing in pipeline</div>
      </div>
    </div>
  );
}
