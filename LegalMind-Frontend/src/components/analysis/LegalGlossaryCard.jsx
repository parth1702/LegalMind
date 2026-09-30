import React, { useState } from 'react';
import { BookOpen, Scale, FileText, ExternalLink, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LegalGlossaryCard({ glossaryData, onOpenSourceQuote }) {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'acts'

  const terms = glossaryData?.definedTerms || [
    {
      id: 'term-1',
      term: 'Indemnification & Hold Harmless',
      category: 'liability',
      plainEnglishMeaning: 'A legally binding promise where one party guarantees to cover financial losses, legal bills, or damages if a lawsuit occurs.',
      originalSourceQuote: 'The Licensee shall indemnify, defend, and hold harmless Licensor against third-party claims arising from unauthorized data distribution.',
      pageNumber: 1,
    },
    {
      id: 'term-2',
      term: 'Force Majeure',
      category: 'operation',
      plainEnglishMeaning: 'Excuses contractual non-performance due to major catastrophic events like natural disasters, war, or government blockades.',
      originalSourceQuote: 'Neither party shall be held liable for failure to fulfill obligations due to acts of God or war.',
      pageNumber: 2,
    },
    {
      id: 'term-3',
      term: 'Consequential Damages Exclusion',
      category: 'liability',
      plainEnglishMeaning: 'Prevents either party from suing for indirect losses like prospective business profits or reputational damage.',
      originalSourceQuote: 'In no event shall either party be liable for any indirect, special, incidental, or consequential damages.',
      pageNumber: 2,
    },
  ];

  const acts = glossaryData?.statutoryActs || [
    {
      id: 'act-1',
      idLabel: 'ICA 1872 Sec 73',
      actName: 'Indian Contract Act 1872',
      sectionNumber: 'Section 73',
      statutoryTopic: 'Compensation for Loss or Damage caused by Breach of Contract',
      plainEnglishSummary: 'Only direct, foreseeable damages resulting naturally from a contract breach can be claimed. Indirect or remote losses cannot be recovered unless specifically agreed.',
      contractClauseReference: 'Clause 14.2 (Limitation of Liability)',
      originalSourceQuote: 'Recovery of damages shall be restricted strictly under Section 73 of the Indian Contract Act 1872.',
      pageNumber: 2,
      complianceStatus: 'compliant',
    },
    {
      id: 'act-2',
      idLabel: 'DPDP Act 2023',
      actName: 'Digital Personal Data Protection Act 2023',
      sectionNumber: 'Section 8 & 9',
      statutoryTopic: 'Data Fiduciary Obligations & Personal Data Safeguards',
      plainEnglishSummary: 'Requires companies processing Indian citizens\' personal data to maintain technical security safeguards, prompt breach notifications, and clear consent logs.',
      contractClauseReference: 'Clause 11.1 (Data Privacy & Safeguards)',
      originalSourceQuote: 'Both parties agree to comply with mandatory provisions of the Digital Personal Data Protection Act 2023.',
      pageNumber: 1,
      complianceStatus: 'compliant',
    },
    {
      id: 'act-3',
      idLabel: 'Arbitration Act 1996',
      actName: 'Arbitration and Conciliation Act 1996',
      sectionNumber: 'Section 11',
      statutoryTopic: 'Out-of-Court Dispute Settlement via Sole Arbitrator',
      plainEnglishSummary: 'Allows commercial disputes to be settled privately by an independent arbitrator without going through delayed civil court litigation.',
      contractClauseReference: 'Clause 18.3 (Governing Law & Jurisdiction)',
      originalSourceQuote: 'All disputes shall be referred to arbitration under the Arbitration and Conciliation Act 1996.',
      pageNumber: 3,
      complianceStatus: 'compliant',
    },
  ];

  return (
    <div className="card-base p-6 space-y-5 bg-white dark:bg-card border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Card Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Extracted Legal Terms & Statutory Acts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plain-English legal translations linked directly to original contract text.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-white text-blue-700 font-bold border border-slate-200 shadow-sm dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Defined Terms ({terms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acts')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'acts'
                ? 'bg-white text-blue-700 font-bold border border-slate-200 shadow-sm dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Laws & Acts ({acts.length})</span>
          </button>
        </div>
      </div>

      {/* 1. DEFINED TERMS LIST */}
      {activeTab === 'terms' && (
        <div className="space-y-3">
          {terms.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-ai capitalize">{item.category || 'term'}</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.term}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={item.wikiUrl || item.externalReferenceUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.term)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 gap-1 font-mono bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20"
                    title="Read more on Wikipedia"
                  >
                    <span>Know More</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenSourceQuote && onOpenSourceQuote(item)}
                    className="btn btn-ghost btn-xs text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 gap-1 font-mono"
                    title="View Original Contract Source"
                  >
                    <span>Source Quote</span>
                  </button>
                </div>
              </div>

              {/* Plain-English Meaning */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  Plain-English Legal Meaning:
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {item.plainEnglishMeaning}
                </p>
              </div>

              {/* Original Quote Excerpt Preview */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="truncate italic max-w-md">"{item.originalSourceQuote}"</span>
                <span className="shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">Page {item.pageNumber || 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. STATUTORY LAWS & ACTS LIST */}
      {activeTab === 'acts' && (
        <div className="space-y-3">
          {acts.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                    {act.idLabel || act.actName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{act.actName} {act.sectionNumber ? `(${act.sectionNumber})` : ''}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={act.wikiUrl || act.externalReferenceUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(act.actName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 gap-1 font-mono bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20"
                    title="Read official statutory legal reference on Wikipedia"
                  >
                    <span>Know More</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenSourceQuote && onOpenSourceQuote(act)}
                    className="btn btn-ghost btn-xs text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 gap-1 font-mono"
                  >
                    <span>Source Quote</span>
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">
                Topic: {act.statutoryTopic}
              </div>

              {/* Plain-English Summary */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  Statutory Rule Summary:
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {act.plainEnglishSummary}
                </p>
              </div>

              {/* Reference Metadata */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Ref: <strong className="text-slate-900 dark:text-slate-200">{act.contractClauseReference}</strong></span>
                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">Page {act.pageNumber || 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
