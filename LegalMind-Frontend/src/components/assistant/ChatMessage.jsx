import React, { useState } from 'react';
import {
  User,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import SourceCitationCard from './SourceCitationCard';
import LogoMark from '../brand/LogoMark';

export default function ChatMessage({ message, onRegenerate, onFeedback }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in duration-200">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-800/60 text-cyan-100 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-md">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold uppercase tracking-wider">Legal Counsel</span>
            <p className="whitespace-pre-wrap">{message.text}</p>
            <span className="text-[10px] font-mono text-slate-400 block text-right pt-1">
              {message.timestamp}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5 max-w-3xl w-full">
        {/* AI Brand Logo Avatar */}
        <div className="w-9 h-9 rounded-xl bg-[#0b1021] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
          <LogoMark size="xs" animated />
        </div>

        {/* AI Response Card */}
        <div className="flex-1 card-base p-4 sm:p-5 border-slate-800/90 space-y-4 bg-[#0b1021]/95 backdrop-blur-md shadow-xl hover:border-cyan-500/30 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 font-mono tracking-tight">
                LegalMind Co-Pilot RAG
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Verified Legal Grounding
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{message.timestamp}</span>
          </div>

          {/* Formatted Answer Text */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
            {message.text}
          </div>

          {/* RAG Source Citations Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Verified Vector Source Evidences ({message.sources.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sources.map((src, idx) => (
                  <SourceCitationCard key={idx} source={src} />
                ))}
              </div>
            </div>
          )}

          {/* Bottom Message Action Bar */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 px-2 rounded-lg hover:text-cyan-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-[11px] font-mono"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerate && onRegenerate(message.id)}
                className="p-1.5 px-2 rounded-lg hover:text-cyan-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-[11px] font-mono"
                title="Regenerate AI answer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Feedback Thumb Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setFeedback('up');
                  if (onFeedback) onFeedback(true);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'up' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Helpful response"
                aria-label="Thumbs up"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedback('down');
                  if (onFeedback) onFeedback(false);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'down' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Unhelpful response"
                aria-label="Thumbs down"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
