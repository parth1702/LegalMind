import React, { useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SourceCitationCard({ source }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!source) return null;

  return (
    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-bold text-slate-200 truncate">{source.documentName}</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50 shrink-0">
            Page {source.pageNumber}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-slate-400">{source.confidence} Match</span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={isExpanded ? 'Collapse citation' : 'Expand citation'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-cyan-300 font-semibold truncate">
        {source.section}
      </div>

      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 italic font-serif leading-relaxed space-y-2 animate-in fade-in duration-150">
          <p>"{source.snippet}"</p>
          <div className="flex justify-end pt-1">
            <Link
              to="/app/analysis"
              className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
            >
              <span>Open in Document Viewer</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
