import React from 'react';
import { FileText, Cpu, Search, Sparkles } from 'lucide-react';

export default function DocumentIntelligenceSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#050814] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Visual Diagram Card */}
          <div className="lg:col-span-6 card-base p-6 space-y-4 bg-[#070b18] border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">
                NLP Named Entity & Term Extraction
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-slate-400">Contracting Parties</div>
                <div className="text-xs font-semibold text-cyan-300">Acme Corp & Nexus Legal</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-slate-400">Effective Date</div>
                <div className="text-xs font-semibold text-slate-200 font-mono">October 1, 2026</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-slate-400">Contract Value</div>
                <div className="text-xs font-semibold text-emerald-400 font-mono">$450,000 / Year</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-slate-400">Governing Law</div>
                <div className="text-xs font-semibold text-indigo-300">Delaware State</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Auto-Summarization Model</span>
                <span className="text-cyan-400 font-bold">100% Extracted</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comprehensive 3-point executive breakdown generated automatically for lead counsel review within 8 seconds of upload.
              </p>
            </div>
          </div>

          {/* Right Text Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Structural Document Understanding
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
                Transform Unstructured Contracts into Actionable Data
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional PDF documents hide dangerous commitments in dense legalese. LegalMind AI extracts structural metadata, key obligations, renewal deadlines, and financial commitments automatically.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Multi-format support for scanned PDFs, native PDFs, and DOCX contracts.</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Semantic vector indexing for instant cross-document search.</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Automated key date alert calendar for renewal and termination windows.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
