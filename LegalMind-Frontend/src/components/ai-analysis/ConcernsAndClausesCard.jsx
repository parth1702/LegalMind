import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';

const riskBadgeMap = {
  low: { badge: 'badge-low', icon: CheckCircle2, text: 'Low Risk' },
  medium: { badge: 'badge-medium', icon: AlertCircle, text: 'Medium Risk' },
  high: { badge: 'badge-high', icon: AlertTriangle, text: 'High Risk' },
  critical: { badge: 'badge-critical', icon: ShieldAlert, text: 'Critical Risk' },
};

export default function ConcernsAndClausesCard({ concerns, clauses }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Potential Concerns Breakdown */}
      {concerns && concerns.length > 0 && (
        <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Potential Legal Concerns & Exposure Traps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {concerns.map((concern) => {
              const risk = riskBadgeMap[concern.riskLevel] || riskBadgeMap.high;
              const IconComponent = risk.icon;

              return (
                <div
                  key={concern.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {concern.section}
                      </span>
                      <span className={`badge ${risk.badge} text-[10px] flex items-center gap-1`}>
                        <IconComponent className="w-3 h-3" />
                        <span>{risk.text}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200">{concern.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {concern.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-rose-300 font-mono">
                    <span className="font-semibold block text-slate-400">Potential Impact:</span>
                    {concern.impact}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Important Clauses & Fallbacks */}
      {clauses && clauses.length > 0 && (
        <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Important Clauses & Fallback Playbook
            </h3>
          </div>

          <div className="space-y-4">
            {clauses.map((clause) => {
              const risk = riskBadgeMap[clause.riskLevel] || riskBadgeMap.low;
              const IconComponent = risk.icon;

              return (
                <div
                  key={clause.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        {clause.section}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {clause.title}
                      </span>
                    </div>
                    <span className={`badge ${risk.badge} text-[10px] flex items-center gap-1`}>
                      <IconComponent className="w-3 h-3" />
                      <span>{risk.text}</span>
                    </span>
                  </div>

                  {/* Original Text */}
                  <p className="text-xs font-serif text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed italic">
                    "{clause.text}"
                  </p>

                  {/* AI Insight */}
                  <div className="text-xs text-slate-300 bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/40">
                    <span className="font-semibold text-cyan-300 font-mono block mb-0.5">
                      AI Analysis Insight:
                    </span>
                    {clause.aiInsight}
                  </div>

                  {/* Fallback Language */}
                  {clause.fallbackLanguage && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 text-indigo-400" /> Recommended Fallback Clause:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(clause.id, clause.fallbackLanguage)}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied Fallback
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Text
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-indigo-200 bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/50 leading-relaxed">
                        {clause.fallbackLanguage}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
