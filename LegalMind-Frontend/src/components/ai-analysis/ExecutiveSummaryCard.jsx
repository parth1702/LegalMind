import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert, Copy, Check, FileCheck2 } from 'lucide-react';

const severityIcons = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: ShieldAlert,
};

const severityColors = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  critical: 'text-red-400 bg-red-600/20 border-red-500/40',
};

export default function ExecutiveSummaryCard({ summary, keyFindings }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopyOverview = () => {
    navigator.clipboard.writeText(summary.overview || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-base p-6 border-slate-800 space-y-6 bg-[#0b1021]/95 backdrop-blur-md shadow-xl hover:border-cyan-500/30 transition-all">
      {/* Executive Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Executive AI Intelligence Summary
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCopyOverview}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/80 p-4.5 rounded-xl border border-slate-800/80 shadow-inner">
          {summary.overview}
        </p>

        {/* Key Takeaway Bullets */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" /> Primary Counsel Takeaways
          </span>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {(summary?.keyTakeaways || []).map((takeaway, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed shadow-sm hover:border-slate-700 transition-colors"
              >
                <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Findings List */}
      {Array.isArray(keyFindings) && keyFindings.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
            Categorized Statutory Findings
          </span>
          <div className="grid sm:grid-cols-2 gap-3">
            {keyFindings.map((finding, idx) => {
              const Icon = severityIcons[finding.severity] || AlertCircle;
              const style = severityColors[finding.severity] || severityColors.medium;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      {finding.category}
                    </span>
                    <span className={`badge ${style} text-[10px] flex items-center gap-1 font-mono font-bold`}>
                      <Icon className="w-3 h-3" />
                      <span>{(finding.severity || 'medium').toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug font-sans">{finding.finding}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
