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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import SourceCitationCard from './SourceCitationCard';
import LogoMark from '../brand/LogoMark';

/* ─── Simple Markdown-like renderer for AI text ─────────────────────── */
function RenderMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} className="font-semibold text-slate-800 dark:text-slate-200">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
            {line.match(/^(\d+)\./)?.[1]}
          </span>
          <span className="flex-1">{formatInline(line.replace(/^\d+\. /, ''))}</span>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
          <span className="shrink-0 w-1 h-1 rounded-full bg-blue-500 mt-2" />
          <span className="flex-1">{formatInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-1.5 text-xs sm:text-[13px]">{elements}</div>;
}

function formatInline(text) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ChatMessage({ message, onRegenerate, onFeedback }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.sender === 'user';

  /* ── User Bubble ─────────────────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-end gap-2.5 max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-blue-600 dark:bg-blue-600 text-white shadow-sm">
            <p className="text-[10px] font-mono text-blue-200 mb-1 font-semibold uppercase tracking-wider">
              Legal Counsel
            </p>
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            <p className="text-[10px] font-mono text-blue-300 text-right mt-1">{message.timestamp}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    );
  }

  /* ── AI Response Card ────────────────────────────────────────── */
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className="flex justify-start mb-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-3 max-w-[90%] w-full">
        {/* Logo Avatar */}
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <LogoMark size="xs" animated />
        </div>

        {/* Card */}
        <div className="flex-1 rounded-2xl rounded-tl-sm bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-500/30 transition-all overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 font-mono">
                LegalMind Co-Pilot
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[9px] font-mono font-semibold">
                <ShieldCheck className="w-2.5 h-2.5" />
                RAG Grounded
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{message.timestamp}</span>
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <RenderMarkdown text={message.text} />
          </div>

          {/* Sources Toggle */}
          {hasSources && (
            <>
              <button
                type="button"
                onClick={() => setShowSources((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-blue-500 dark:text-sky-400" />
                  Source Citations ({message.sources.length})
                </span>
                {showSources
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                }
              </button>

              {showSources && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
                  {message.sources.map((src, idx) => (
                    <SourceCitationCard key={idx} source={src} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Action Bar */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-500 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied
                  ? <Check className="w-3 h-3 text-emerald-500" />
                  : <Copy className="w-3 h-3" />
                }
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                type="button"
                onClick={() => onRegenerate && onRegenerate(message.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-500 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => {
                  setFeedback('up');
                  if (onFeedback) onFeedback(true);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'up'
                    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                    : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Helpful"
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
                  feedback === 'down'
                    ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10'
                    : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Not helpful"
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
