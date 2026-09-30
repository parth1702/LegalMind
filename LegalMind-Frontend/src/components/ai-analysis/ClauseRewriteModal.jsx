import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Shield,
  Scale,
  Zap,
  Download,
  AlertTriangle,
  Lightbulb,
  FileText,
  CornerDownRight,
} from 'lucide-react';
import { rewriteClauseApi } from '../../services/documentService';

export default function ClauseRewriteModal({
  isOpen,
  onClose,
  originalClause = '',
  riskTopic = 'Contract Risk Mitigation',
}) {
  const [activeTier, setActiveTier] = useState('balanced'); // 'protective' | 'balanced' | 'minimalFriction'
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rewriteData, setRewriteData] = useState(null);

  useEffect(() => {
    if (isOpen && originalClause) {
      let isMounted = true;
      setIsLoading(true);
      rewriteClauseApi(originalClause, riskTopic)
        .then((data) => {
          if (isMounted) {
            setRewriteData(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, originalClause, riskTopic]);

  if (!isOpen) return null;

  const fallbackData = {
    originalClause: originalClause || 'The Licensee shall indemnify Licensor against any and all claims without limitation.',
    riskTopic: riskTopic || 'Uncapped Financial Exposure',
    rewrites: {
      protective: {
        title: 'Protective (Pro-Client)',
        clauseText: `Neither party's total aggregate liability arising out of or related to this Agreement shall exceed the total fees paid by Client under this Agreement in the twelve (12) months preceding the incident. ${originalClause || 'Licensor shall defend and hold harmless Client from third-party claims.'} Provided, however, that indemnity shall be strictly limited to direct, proven damages.`,
        rationale: 'Inserts a hard financial liability cap (12 months of fees) and restricts indemnity claims strictly to direct proven damages.',
        negotiationTip: 'Use as your opening counter-offer to establish firm financial boundaries.',
      },
      balanced: {
        title: 'Balanced (Industry Standard)',
        clauseText: `Each party agrees to indemnify, defend, and hold harmless the other party from and against third-party claims arising from gross negligence or willful misconduct. ${originalClause || 'Liability shall be subject to Section 14.'} Claims must be notified in writing within 30 days.`,
        rationale: 'Establishes mutual standards and conditions liability on proven gross negligence or willful misconduct.',
        negotiationTip: 'Standard commercial baseline easily accepted by enterprise legal teams.',
      },
      minimalFriction: {
        title: 'Minimal Friction (Fast Approval)',
        clauseText: `${originalClause || 'The Licensee shall indemnify Licensor against third-party claims.'} To the maximum extent permitted by applicable law, neither party shall be liable for indirect, punitive, or consequential damages.`,
        rationale: 'Preserves existing text while adding standard statutory exclusions for indirect and punitive damages.',
        negotiationTip: 'High acceptance rate when deal closing timeline is tight.',
      },
    },
  };

  const data = rewriteData || fallbackData;
  const currentRewrite = data.rewrites?.[activeTier] || data.rewrites?.balanced;

  const handleCopy = () => {
    if (currentRewrite?.clauseText) {
      navigator.clipboard.writeText(currentRewrite.clauseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const textContent = `LEGAL COUNTER-CLAUSE REDLINE SNIPPET
Target Risk: ${riskTopic}
Option Selected: ${currentRewrite?.title}

ORIGINAL CLAUSE:
"${originalClause}"

REVISED COUNTER-CLAUSE:
"${currentRewrite?.clauseText}"

LEGAL RATIONALE:
${currentRewrite?.rationale}

NEGOTIATION TIP:
${currentRewrite?.negotiationTip}
`;
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `redline_${activeTier}_clause.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-gradient-to-br dark:from-indigo-500 dark:to-cyan-500 flex items-center justify-center text-white dark:text-slate-950 shadow-md">
              <Sparkles className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Counter-Clause & Negotiation Engine
              </h3>
              <p className="text-xs font-mono text-blue-600 dark:text-cyan-400">
                Risk Context: {riskTopic}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Original Clause Box */}
          <div className="bg-rose-50/50 dark:bg-slate-950/60 border border-rose-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-rose-700 dark:text-rose-400">
              <span className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Original Risky Contract Clause
              </span>
              <span>Document Excerpt</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-serif italic leading-relaxed border-l-2 border-rose-500 pl-3 py-1">
              "{originalClause}"
            </p>
          </div>

          {/* Strategy Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Select Counter-Draft Strategy:
              </span>
              {isLoading && (
                <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Optimizing legal phrasing...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTier('protective')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTier === 'protective'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>🛡️ Protective</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTier('balanced')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTier === 'balanced'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                <span>⚖️ Balanced</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTier('minimalFriction')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTier === 'minimalFriction'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>⚡ Fast Approval</span>
              </button>
            </div>
          </div>

          {/* Generated Counter-Clause Box */}
          <div className="bg-slate-50 dark:bg-slate-950/90 border border-blue-200 dark:border-cyan-500/30 rounded-xl p-4 space-y-3 relative shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h4 className="text-sm font-bold text-blue-700 dark:text-cyan-300">
                  {currentRewrite?.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-cyan-500/20 hover:bg-blue-100 text-xs font-mono text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Snippet</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-200 leading-relaxed font-medium select-all">
              "{currentRewrite?.clauseText}"
            </div>

            {/* Legal Rationale & Negotiation Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 space-y-1">
                <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Legal Rationale:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
                  {currentRewrite?.rationale}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Negotiation Tip:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
                  {currentRewrite?.negotiationTip}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
