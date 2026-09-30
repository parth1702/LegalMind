import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Scale,
  ShieldAlert,
  Zap,
  FileText,
  Mic,
  Paperclip,
  ChevronUp,
} from 'lucide-react';

const LEGAL_PROMPT_TEMPLATES = [
  {
    icon: Scale,
    color: 'text-blue-600 dark:text-sky-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    label: 'Indemnification & Exposure',
    description: 'Review indemnification clauses and potential financial exposure',
    query: 'What are the main indemnification liabilities and risk exposures in this contract?',
  },
  {
    icon: ShieldAlert,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    label: 'DPDP 2023 Compliance',
    description: 'Check compliance with Digital Personal Data Protection Act',
    query: 'Audit this document for compliance with the Indian Digital Personal Data Protection Act 2023.',
  },
  {
    icon: Zap,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/20',
    label: 'Restrictive Covenants',
    description: 'Analyze non-compete, non-solicitation restrictions',
    query: 'Are there any uncapped financial liability clauses or missing cap limits?',
  },
  {
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
    label: 'Termination & Remedies',
    description: 'Examine termination rights and available legal remedies',
    query: 'What are the exact termination notice periods, key renewal dates, and deadlines?',
  },
  {
    icon: Scale,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    label: 'Liability Limitations',
    description: 'Assess liability caps, exclusions and limitations',
    query: 'What are the liability limitations, caps, and exclusions in this agreement?',
  },
  {
    icon: ShieldAlert,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    label: 'Governing Law & Jurisdiction',
    description: 'Review applicable law and dispute resolution',
    query: 'What governing law and jurisdiction apply to disputes under this contract?',
  },
];

export default function ChatInputBar({
  onSendMessage,
  activeDocument,
  onSelectSuggested,
  isLoading,
}) {
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef(null);

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

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [inputText]);

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050814] relative z-10">
      {/* Recommended Legal Queries */}
      {showSuggestions && (
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Recommended Legal Queries
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Hide suggestions"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LEGAL_PROMPT_TEMPLATES.map((tmpl, idx) => {
              const IconComponent = tmpl.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onSelectSuggested) onSelectSuggested(tmpl.query);
                    setShowSuggestions(false);
                  }}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all hover:shadow-sm group ${tmpl.bg} ${tmpl.border} hover:scale-[1.01]`}
                >
                  <div className={`w-7 h-7 rounded-lg ${tmpl.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <IconComponent className={`w-3.5 h-3.5 ${tmpl.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold ${tmpl.color} leading-tight mb-0.5`}>
                      {tmpl.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Input Area */}
      <div className="px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-blue-400 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${activeDocument || 'this document'}...`}
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none leading-relaxed min-h-[20px] max-h-[120px] font-sans"
              disabled={isLoading}
            />

            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Voice input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">
              Powered by LegalMind RAG v2.4
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 dark:text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Enter
            </kbd>
            <span>to send</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Shift+Enter
            </kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
