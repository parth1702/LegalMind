import React from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, CheckCircle2, FileText, Search } from 'lucide-react';

const riskStyleMap = {
  high: 'border-rose-500/60 bg-rose-950/20 text-rose-200',
  critical: 'border-red-500/80 bg-red-950/30 text-red-200',
  medium: 'border-amber-500/60 bg-amber-950/20 text-amber-200',
  low: 'border-emerald-500/40 bg-emerald-950/10 text-emerald-200',
};

const riskBadgeMap = {
  high: 'badge-high',
  critical: 'badge-critical',
  medium: 'badge-medium',
  low: 'badge-low',
};

export default function DocumentViewerCanvas({
  pagesContent,
  currentPage,
  zoomLevel,
  searchQuery,
  selectedClauseId,
  onSelectClause,
}) {
  const pageData = pagesContent.find((p) => p.page === currentPage) || pagesContent[0];
  const scale = zoomLevel / 100;

  return (
    <div className="flex-1 bg-[#03050e] overflow-auto p-4 sm:p-8 flex items-start justify-center relative">
      {/* Page Canvas Paper Container */}
      <div
        className="bg-[#0b1021] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 max-w-3xl w-full space-y-6 transition-transform duration-200 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Document Page Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">MASTER SERVICES AGREEMENT</span>
          </div>
          <span>Page {pageData ? pageData.page : currentPage} of 14</span>
        </div>

        {/* Page Heading */}
        {pageData && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono tracking-tight border-b border-slate-800/80 pb-2">
              {pageData.heading}
            </h2>

            {/* Page Paragraphs & Highlighted Risk Clauses */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
              {pageData.body.split('\n\n').map((paragraph, idx) => {
                // Check if paragraph contains risk clause tag
                const isHighRisk = paragraph.includes('[CLAUSE-1: HIGH RISK]');
                const isMediumRisk = paragraph.includes('[CLAUSE-2: MEDIUM RISK]');
                const isLowRisk = paragraph.includes('[CLAUSE-3: LOW RISK]');
                const isCriticalRisk = paragraph.includes('[CLAUSE-4: CRITICAL RISK]');

                let clauseId = null;
                let riskType = null;

                if (isHighRisk) {
                  clauseId = 'clause-1';
                  riskType = 'high';
                } else if (isMediumRisk) {
                  clauseId = 'clause-2';
                  riskType = 'medium';
                } else if (isLowRisk) {
                  clauseId = 'clause-3';
                  riskType = 'low';
                } else if (isCriticalRisk) {
                  clauseId = 'clause-4';
                  riskType = 'critical';
                }

                if (clauseId) {
                  const isSelected = selectedClauseId === clauseId;
                  const style = riskStyleMap[riskType];
                  const badge = riskBadgeMap[riskType];

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectClause(clauseId)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 ${style} ${
                        isSelected ? 'ring-2 ring-cyan-400 shadow-glow' : 'hover:border-cyan-400/60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>AI Clause Highlighted Anomaly</span>
                        </span>
                        <span className={`badge ${badge} text-[10px]`}>
                          {riskType.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="font-serif leading-relaxed">
                        {paragraph.replace(/\[CLAUSE-\d: [A-Z ]+\]/g, '')}
                      </p>
                      <div className="text-[11px] font-mono text-cyan-300 pt-1 flex items-center gap-1">
                        <span>Click to view AI recommendation in insights panel</span>
                      </div>
                    </div>
                  );
                }

                // Regular Text Paragraph with optional Search Highlight
                if (searchQuery && paragraph.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return (
                    <p key={idx} className="bg-cyan-500/10 p-2 rounded border border-cyan-500/30">
                      {paragraph}
                    </p>
                  );
                }

                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          </div>
        )}

        {/* Page Footer Watermark */}
        <div className="pt-8 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500">
          Confidential • LegalMind AI Document Intelligence • Verified Copy
        </div>
      </div>
    </div>
  );
}
