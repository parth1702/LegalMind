import React, { useState } from 'react';
import {
  FileText,
  RefreshCw,
  ChevronRight,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
} from 'lucide-react';

const STATUS_ICONS = {
  Done: { Icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  Ready: { Icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500' },
  Partial: { Icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
  Pending: { Icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-400' },
};

const TABS = ['Overview', 'Clauses', 'RAG'];

export default function DocumentContextPanel({ documents = [], selectedDocId, onRefresh }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const activeDoc = documents.find((d) => (d._id || d.id) === selectedDocId);

  const docMeta = activeDoc
    ? [
        { label: 'Pages', value: activeDoc.pageCount || activeDoc.pages || '—' },
        { label: 'Parties', value: activeDoc.parties || '—' },
        { label: 'Jurisdiction', value: activeDoc.jurisdiction || 'India' },
        {
          label: 'Effective Date',
          value: activeDoc.effectiveDate
            ? new Date(activeDoc.effectiveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        },
        {
          label: 'Expiry',
          value: activeDoc.expiryDate
            ? new Date(activeDoc.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        },
      ]
    : [];

  const ragSteps = [
    { label: 'Document Chunking', status: 'Done' },
    { label: 'Embedding Index', status: activeDoc ? 'Ready' : 'Pending' },
    { label: 'DPDP Compliance', status: activeDoc ? 'Partial' : 'Pending' },
    { label: 'Clause Mapping', status: activeDoc ? '48 clauses' : 'Pending' },
  ];

  const keyClauses = [
    'Indemnification (Section 8)',
    'Termination Rights (Section 10)',
    'Non-Solicitation (Section 7)',
    'Governing Law (Section 12)',
    'Confidentiality Scope (Section 3)',
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#070b18] border-l border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Document Context
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh document context"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-3 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-t transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 border border-b-0 border-slate-200 dark:border-slate-700 -mb-px pb-2'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Document name badge */}
        {activeDoc && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeDoc.title || activeDoc.originalName || 'Active Document'}
              </span>
            </div>
          </div>
        )}

        {!activeDoc && (
          <div className="px-4 py-6 text-center">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              No document selected
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
              Select a document from the header dropdown to see context
            </p>
          </div>
        )}

        {activeDoc && activeTab === 'Overview' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Meta fields */}
            <div className="space-y-1.5">
              {docMeta.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* RAG Pipeline Status */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block mb-2">
                RAG Pipeline Status
              </span>
              <div className="space-y-2">
                {ragSteps.map(({ label, status }) => {
                  const cfg = STATUS_ICONS[status] || STATUS_ICONS['Pending'];
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg} inline-block`} />
                        <span className="text-[11px] text-slate-700 dark:text-slate-300">{label}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold ${cfg.color}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Clauses */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block mb-2">
                Key Clauses Detected
              </span>
              <div className="space-y-1">
                {keyClauses.map((clause) => (
                  <button
                    key={clause}
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors shrink-0" />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors truncate">
                      {clause}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Clauses' && (
          <div className="px-4 py-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">All Clauses</p>
            {['Indemnification', 'Termination', 'Confidentiality', 'Governing Law', 'Non-Solicitation', 'Liability Cap', 'Force Majeure', 'Dispute Resolution'].map((c) => (
              <button
                key={c}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-sky-500/40 text-left transition-all group"
              >
                <Hash className="w-3 h-3 text-blue-500 dark:text-sky-400 shrink-0" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-sky-400">{c}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'RAG' && (
          <div className="px-4 py-4 space-y-3">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">RAG Pipeline</p>
            {ragSteps.map(({ label, status }) => {
              const cfg = STATUS_ICONS[status] || STATUS_ICONS['Pending'];
              return (
                <div key={label} className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                    <span className={`text-[10px] font-mono font-bold ${cfg.color}`}>{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
