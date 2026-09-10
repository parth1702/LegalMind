import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Zap,
  Copy,
  Check,
  Building,
  DollarSign,
  Clock,
} from 'lucide-react';

const riskBadgeMap = {
  low: { badge: 'badge-low', icon: CheckCircle2, text: 'Low Risk' },
  medium: { badge: 'badge-medium', icon: AlertCircle, text: 'Medium Risk' },
  high: { badge: 'badge-high', icon: AlertTriangle, text: 'High Risk' },
  critical: { badge: 'badge-critical', icon: ShieldAlert, text: 'Critical Risk' },
};

export default function AiInsightsPanel({
  documentData,
  selectedClauseId,
  onSelectClause,
}) {
  const [activeTab, setActiveTab] = useState('clauses'); // 'summary' | 'risk' | 'entities' | 'clauses' | 'dates' | 'recommendations'
  const [copiedId, setCopiedId] = useState(null);

  if (!documentData) return null;

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full h-full bg-[#070b18] border-l border-slate-800 flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#050814] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            AI Document Insights
          </span>
        </div>
        <span className="badge badge-ai font-mono text-[10px]">AI Co-Pilot</span>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-[#050814] overflow-x-auto text-[11px] font-mono shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Summary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'risk'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Risk Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entities')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'entities'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Entities
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clauses')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'clauses'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Clauses ({documentData.clauses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dates')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dates'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dates
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Strategy
        </button>
      </div>

      {/* Main Insights Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Executive Overview
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-serif">
                {documentData.summary.overview}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Key Contract Takeaways
              </span>
              <ul className="space-y-2">
                {documentData.summary.keyPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 2. RISK TAB */}
        {activeTab === 'risk' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Overall Risk Score</span>
                <span className="text-rose-400 font-mono font-bold text-sm">
                  {documentData.overallRiskScore}% High
                </span>
              </div>
              <div className="progress-container h-2">
                <div
                  className="progress-indicator bg-rose-500"
                  style={{ width: `${documentData.overallRiskScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 space-y-1">
                <div className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Critical Risk
                </div>
                <div className="text-lg font-bold font-mono text-slate-100">
                  {documentData.riskBreakdown.critical}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1">
                <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Risk
                </div>
                <div className="text-lg font-bold font-mono text-slate-100">
                  {documentData.riskBreakdown.high}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-1">
                <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Medium Risk
                </div>
                <div className="text-lg font-bold font-mono text-slate-100">
                  {documentData.riskBreakdown.medium}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Low Risk
                </div>
                <div className="text-lg font-bold font-mono text-slate-100">
                  {documentData.riskBreakdown.low}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ENTITIES TAB */}
        {activeTab === 'entities' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Extracted Named Entities
            </span>
            <div className="space-y-2">
              {documentData.entities.map((entity, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {entity.label}
                    </span>
                    <span className="font-semibold text-slate-200">{entity.value}</span>
                  </div>
                  <span className="badge badge-neutral font-mono text-[10px]">{entity.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CLAUSES TAB */}
        {activeTab === 'clauses' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {documentData.clauses.map((clause) => {
              const risk = riskBadgeMap[clause.riskLevel] || riskBadgeMap.low;
              const RiskIcon = risk.icon;
              const isSelected = selectedClauseId === clause.id;

              return (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause.id)}
                  className={`p-4 rounded-xl border transition-all space-y-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Clause Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {clause.section}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">{clause.title}</span>
                    </div>
                    <span className={`badge ${risk.badge} text-[10px] flex items-center gap-1`}>
                      <RiskIcon className="w-3 h-3" />
                      <span>{risk.text}</span>
                    </span>
                  </div>

                  {/* Original Text */}
                  <p className="text-xs font-serif text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed italic">
                    "{clause.text}"
                  </p>

                  {/* AI Analysis */}
                  <div className="text-xs text-slate-300 bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/40 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Analysis:
                    </span>
                    <p className="leading-normal">{clause.aiAnalysis}</p>
                  </div>

                  {/* Fallback Language */}
                  {clause.suggestedFallback && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-indigo-400" /> Recommended Fallback:
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(clause.id, clause.suggestedFallback);
                          }}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Fallback
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-indigo-200 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/50 leading-relaxed">
                        {clause.suggestedFallback}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 5. DATES TAB */}
        {activeTab === 'dates' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Contract Milestones & Deadlines
            </span>
            <div className="space-y-2">
              {documentData.importantDates.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    item.isUrgent
                      ? 'bg-rose-950/20 border-rose-800/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200 block">{item.title}</span>
                    <span className="text-[11px] font-mono text-cyan-300">{item.date}</span>
                  </div>
                  <span
                    className={`badge text-[10px] ${
                      item.isUrgent ? 'badge-high' : 'badge-neutral'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Counsel Negotiation Playbook
            </span>
            <div className="space-y-2">
              {documentData.clauses
                .filter((c) => c.recommendation)
                .map((clause) => (
                  <div
                    key={clause.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-cyan-300">{clause.section}</span>
                      <span className="text-slate-400">{clause.title}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{clause.recommendation}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#050814] text-[10px] font-mono text-slate-500 text-center">
        Verified by LegalMind AI Intelligence
      </div>
    </div>
  );
}
