import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Quote, BookOpen, ExternalLink } from 'lucide-react';

export default function SourceEvidenceDrawer({ isOpen, item, onClose }) {
  if (!isOpen || !item) return null;

  const wikiUrl = item.wikiUrl || item.externalReferenceUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.term || item.actName || '')}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 max-w-lg w-full bg-[#111827] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <span className="badge badge-ai text-[10px]">Original Source Verification</span>
                <h3 className="text-base font-bold text-slate-100">
                  {item.term || item.actName || 'Original Contract Source'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Page Number:</span>
              <span className="font-bold text-sky-400">Page {item.pageNumber || 1}</span>
            </div>
            {item.sectionNumber && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Statutory Section:</span>
                <span className="font-bold text-emerald-400">{item.sectionNumber}</span>
              </div>
            )}
            {item.contractClauseReference && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contract Reference:</span>
                <span className="font-bold text-indigo-400">{item.contractClauseReference}</span>
              </div>
            )}
          </div>

          {/* Plain-English Meaning Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Plain-English Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              {item.plainEnglishMeaning || item.plainEnglishSummary || 'Grounding legal facts in original document text.'}
            </p>
          </div>

          {/* Exact Quoted Contract Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Exact Document Quote (Excerpt)
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 text-xs text-slate-200 leading-relaxed font-serif relative italic">
              "{item.originalSourceQuote || 'Source quote extracted directly from contract text.'}"
            </div>
          </div>

          {/* External Legal Reference & Wikipedia Link */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>External Legal Reference</span>
            </h4>
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40 transition-colors text-xs font-medium"
            >
              <span>Know More on Wikipedia & Statutory Guide</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Traceable Evidence Verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </>
  );
}
