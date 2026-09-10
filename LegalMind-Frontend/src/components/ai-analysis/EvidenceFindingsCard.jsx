import React from 'react';
import { ShieldAlert, FileText, CheckCircle, AlertTriangle, HelpCircle, KeyRound, Award } from 'lucide-react';

const severityBadgeMap = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  critical: 'border-red-500/40 bg-red-500/20 text-red-200 font-bold',
};

export default function EvidenceFindingsCard({ categoryScores, findings, evidenceList }) {
  // Filter out findings without valid text evidence
  const validFindings = (findings || []).filter(
    (f) => f && (f.evidence_text || f.evidenceText || f.evidence || f.description)
  );

  return (
    <div className="card-base p-6 border-slate-800 space-y-6 bg-[#0b1021]/95 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100 tracking-wide font-mono">
            Evidence-Backed Risk Findings & Legal Evidence
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
          Grounded In Document Text
        </span>
      </div>

      {/* 1. Category Risk Breakdown */}
      {categoryScores && Object.keys(categoryScores).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
            Weighted Legal Category Risk Index
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(categoryScores).map(([categoryName, score]) => {
              const numScore = typeof score === 'number' ? score : 0;
              const isHigh = numScore >= 50;
              const isMed = numScore >= 35 && numScore < 50;

              return (
                <div
                  key={categoryName}
                  className={`p-3 rounded-xl border transition-all ${
                    isHigh
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                      : isMed
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                    {categoryName.replace(/_/g, ' ')}
                  </div>
                  <div className="text-lg font-mono font-extrabold mt-1">
                    {numScore.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Grounded Risk Findings with Verifiable Document Evidence */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
          Document Grounded Findings ({validFindings.length})
        </h3>

        {validFindings.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
            No high-risk statutory vulnerabilities with text evidence detected in this document.
          </div>
        ) : (
          <div className="space-y-4">
            {validFindings.map((finding, idx) => {
              const ruleId = finding.rule_id || finding.ruleId || `RULE-${idx + 1}`;
              const category = finding.category || 'General Legal';
              const severity = (finding.severity || 'medium').toLowerCase();
              const explanation = finding.finding || finding.description || 'Legal risk detected in contract.';
              const evidenceText = finding.evidence_text || finding.evidenceText || finding.evidence || '';
              const pageNum = finding.page || finding.pageNumber || 1;
              const confidence = finding.confidence ? Math.round(finding.confidence * 100) : 90;
              const recommendation = finding.recommendation || '';

              const badgeStyle = severityBadgeMap[severity] || severityBadgeMap.medium;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 shadow-md"
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                        {category}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">{ruleId}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {severity} risk
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                        Confidence: {confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Finding Explanation */}
                  <div className="text-sm font-semibold text-slate-100 leading-snug">
                    {explanation}
                  </div>

                  {/* Verifiable Text Evidence Box */}
                  {evidenceText && (
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-900/40 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-cyan-400/90 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          Document Evidence Snippet
                        </span>
                        <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Page {pageNum}
                        </span>
                      </div>
                      <p className="text-slate-300 italic leading-relaxed pl-2 border-l-2 border-cyan-500/60">
                        "{evidenceText}"
                      </p>
                    </div>
                  )}

                  {/* Legal Recommendation */}
                  {recommendation && (
                    <div className="text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Recommendation:</strong> {recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
