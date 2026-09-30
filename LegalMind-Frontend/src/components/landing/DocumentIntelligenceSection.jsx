import React from 'react';
import { FileText, Cpu, Search, Sparkles } from 'lucide-react';

export default function DocumentIntelligenceSection() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#050814] border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Visual Diagram Card */}
          <div className="lg:col-span-6 card-base p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                NLP Named Entity & Term Extraction
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Contracting Parties', value: 'Acme Corp & Nexus Legal', color: 'text-blue-700 dark:text-cyan-300' },
                { label: 'Effective Date',       value: 'October 1, 2026',        color: 'text-slate-800 dark:text-slate-200 font-mono' },
                { label: 'Contract Value',        value: '$450,000 / Year',        color: 'text-green-700 dark:text-emerald-400' },
                { label: 'Governing Law',         value: 'Delaware State',          color: 'text-indigo-700 dark:text-indigo-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</div>
                  <div className={`text-xs font-semibold ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-slate-950 rounded-xl border border-blue-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Auto-Summarization Model</span>
                <span className="text-blue-600 dark:text-cyan-400 font-bold">100% Extracted</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Comprehensive 3-point executive breakdown generated automatically for lead counsel review within 8 seconds of upload.
              </p>
            </div>
          </div>

          {/* Right Text Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Structural Document Understanding
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Transform Unstructured Contracts into Actionable Data
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Traditional PDF documents hide dangerous commitments in dense legalese. LegalMind AI extracts structural metadata, key obligations, renewal deadlines, and financial commitments automatically.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {[
                { icon: FileText, iconColor: 'text-blue-600 dark:text-cyan-400',    text: 'Multi-format support for scanned PDFs, native PDFs, and DOCX contracts.' },
                { icon: Search,   iconColor: 'text-indigo-600 dark:text-indigo-400', text: 'Semantic vector indexing for instant cross-document search.' },
                { icon: Sparkles, iconColor: 'text-green-600 dark:text-emerald-400', text: 'Automated key date alert calendar for renewal and termination windows.' },
              ].map(({ icon: Icon, iconColor, text }) => (
                <div key={text} className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
