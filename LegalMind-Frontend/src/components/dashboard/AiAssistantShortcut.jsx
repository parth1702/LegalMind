import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, HelpCircle, ArrowRight } from 'lucide-react';

const suggestedQueries = [
  'Show all contracts expiring in the next 90 days',
  'Which MSA agreements contain uncapped liability?',
  'Draft fallback clause for Section 14.2 indemnity',
];

export default function AiAssistantShortcut() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/app/assistant');
    }
  };

  return (
    <div className="card-base p-5 space-y-4 border-slate-800 bg-gradient-to-br from-[#0b1021] to-[#070b18]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              AI Legal Co-Pilot Shortcut
            </h3>
            <p className="text-[11px] text-slate-400">Ask natural language questions across your active repository</p>
          </div>
        </div>
        <span className="badge badge-ai">Active Co-Pilot</span>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI: e.g. 'Identify all contracts with 30-day notice periods'..."
          className="input-base text-xs pr-10 py-3"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          aria-label="Send query to AI Assistant"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" /> Suggested Counsel Prompts:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(prompt);
                navigate('/app/assistant');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors text-left font-mono"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
