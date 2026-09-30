import React, { useState } from 'react';
import { ListTree, FileText, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const riskIcons = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: ShieldAlert,
};

export default function DocumentOutlineNav({
  outline,
  clauses,
  currentPage,
  onSelectPage,
  onSelectClause,
}) {
  const [activeTab, setActiveTab] = useState('outline'); // 'outline' | 'clauses'

  return (
    <div className="w-full h-full bg-white dark:bg-[#070b18] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
      {/* Sub-nav Tab Header */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050814]">
        <button
          type="button"
          onClick={() => setActiveTab('outline')}
          className={`flex-1 py-2.5 text-xs font-mono font-medium text-center border-b-2 transition-colors ${
            activeTab === 'outline'
              ? 'border-blue-600 text-blue-600 font-bold bg-white dark:border-cyan-400 dark:text-cyan-300 dark:bg-slate-900/60'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Outline ({outline.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clauses')}
          className={`flex-1 py-2.5 text-xs font-mono font-medium text-center border-b-2 transition-colors ${
            activeTab === 'clauses'
              ? 'border-blue-600 text-blue-600 font-bold bg-white dark:border-cyan-400 dark:text-cyan-300 dark:bg-slate-900/60'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Flagged Clauses ({clauses.length})
        </button>
      </div>

      {/* Content Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'outline' ? (
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Table of Contents
            </span>
            {outline.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPage(item.page)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-slate-100'
                }`}
              >
                <span className="truncate pr-2">{item.title}</span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">p. {item.page}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 px-1">
              Risk Anomaly Jumps
            </span>
            {clauses.map((clause) => {
              const Icon = riskIcons[clause.riskLevel] || AlertCircle;
              return (
                <div
                  key={clause.id}
                  onClick={() => {
                    onSelectPage(clause.pageNumber);
                    onSelectClause(clause.id);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                      <Icon className={`w-3.5 h-3.5 ${clause.riskLevel === 'high' || clause.riskLevel === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <span>{clause.section}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Page {clause.pageNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{clause.title}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050814] text-[10px] font-mono text-slate-500 text-center">
        Document Navigation Active
      </div>
    </div>
  );
}
