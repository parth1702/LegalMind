import React, { useState } from 'react';
import { Send, Sparkles, HelpCircle, Scale, ShieldAlert, FileText, Zap } from 'lucide-react';

const LEGAL_PROMPT_TEMPLATES = [
  { icon: Scale, label: 'Indemnification & Exposure', query: 'What are the main indemnification liabilities and risk exposures in this contract?' },
  { icon: ShieldAlert, label: 'DPDP 2023 Compliance', query: 'Audit this document for compliance with the Indian Digital Personal Data Protection Act 2023.' },
  { icon: Zap, label: 'Uncapped Liability', query: 'Are there any uncapped financial liability clauses or missing cap limits?' },
  { icon: FileText, label: 'Termination & Deadlines', query: 'What are the exact termination notice periods, key renewal dates, and deadlines?' },
];

export default function ChatInputBar({
  onSendMessage,
  activeDocument,
  onSelectSuggested,
  isLoading,
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 bg-[#050814]/95 border-t border-slate-800/90 space-y-3 relative z-10 backdrop-blur-md">
      {/* Suggested Counsel Query Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400">
            <HelpCircle className="w-3.5 h-3.5" /> Recommended Legal Queries:
          </span>
          <span className="truncate max-w-[240px] text-slate-500">
            Target Scope: <span className="text-cyan-300 font-semibold">{activeDocument}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {LEGAL_PROMPT_TEMPLATES.map((tmpl, idx) => {
            const IconComponent = tmpl.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onSelectSuggested) onSelectSuggested(tmpl.query);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <IconComponent className="w-3 h-3 text-cyan-400" />
                <span>{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 top-3.5 text-cyan-400 pointer-events-none">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask LegalMind AI Co-Pilot about ${activeDocument}... (e.g., 'Summarize Section 4 indemnity risks under Indian law')`}
          className="input-base text-xs pl-10 pr-14 py-3 resize-none w-full bg-[#0b1021]/90 border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl leading-relaxed"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="absolute right-3 top-3 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-30 disabled:hover:from-cyan-500 transition-all shadow-md shadow-cyan-500/20"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          RAG Vector Index Verified • Statutory Compliance Active
        </span>
        <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px]">Shift + Enter</kbd> for line break</span>
      </div>
    </div>
  );
}
