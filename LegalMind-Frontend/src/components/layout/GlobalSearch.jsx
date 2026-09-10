import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Sparkles, Shield, Command } from 'lucide-react';

export default function GlobalSearch({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Search Bar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2.5 bg-[#0b1021] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl px-3.5 py-2 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${className}`}
        aria-label="Global search trigger"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span className="hidden sm:inline-block">Search documents, clauses, or AI insights...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-auto hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Search Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
          <div
            className="bg-[#0b1021] border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden space-y-0"
            role="dialog"
            aria-modal="true"
            aria-label="Global search modal"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search legal documents, AI clauses, or tags..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Close search modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions / Filter Options */}
            <div className="p-4 space-y-3 bg-[#070b18]">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Quick Suggestions</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-slate-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Commercial Master Service Agreement 2026.pdf</span>
                  </div>
                  <span className="badge badge-neutral text-[10px]">Document</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-slate-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span>Unilateral Indemnity Clause Anomaly</span>
                  </div>
                  <span className="badge badge-high text-[10px]">High Risk</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-slate-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Legal Clause Extraction</span>
                  </div>
                  <span className="badge badge-ai text-[10px]">AI Co-Pilot</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">ESC</kbd> to close</span>
              <span>LegalMind AI Universal Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
