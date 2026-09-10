import React from 'react';

/**
 * LegalMind AI Wordmark Component
 * Clean typography combining "LegalMind" and stylized "AI" tag.
 */
export default function Wordmark({
  size = 'md',
  subtitle = false,
  className = '',
}) {
  const textSizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeSizeMap = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-xs px-3 py-1',
  };

  const currentTextSize = textSizeMap[size] || textSizeMap.md;
  const currentBadgeSize = badgeSizeMap[size] || badgeSizeMap.md;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2 tracking-tight">
        <span className={`font-bold text-slate-100 ${currentTextSize}`}>
          Legal<span className="text-cyan-400">Mind</span>
        </span>
        <span
          className={`font-mono font-semibold rounded-md bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 shadow-sm ${currentBadgeSize}`}
        >
          AI
        </span>
      </div>
      {subtitle && (
        <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mt-0.5">
          Legal Document Intelligence
        </span>
      )}
    </div>
  );
}
