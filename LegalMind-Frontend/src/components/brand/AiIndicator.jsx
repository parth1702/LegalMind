import React from 'react';
import { Sparkles, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Enterprise AI Intelligence Indicator Component
 * States: 'idle' | 'analyzing' | 'complete' | 'thinking'
 */
export default function AiIndicator({
  status = 'idle',
  label,
  modelName = null,
  className = '',
}) {
  const statusConfig = {
    idle: {
      color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
      dotColor: 'bg-cyan-400',
      icon: Sparkles,
      defaultLabel: 'AI Engine Active',
      pulse: true,
    },
    analyzing: {
      color: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40 shadow-[0_0_16px_rgba(34,211,238,0.2)]',
      dotColor: 'bg-cyan-400',
      icon: Loader2,
      defaultLabel: 'Analyzing Document Structure...',
      pulse: true,
    },
    thinking: {
      color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_16px_rgba(99,102,241,0.2)]',
      dotColor: 'bg-indigo-400',
      icon: Cpu,
      defaultLabel: 'Synthesizing Statutory RAG...',
      pulse: true,
    },
    complete: {
      color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      dotColor: 'bg-emerald-400',
      icon: CheckCircle2,
      defaultLabel: 'Indian Law Audit Verified',
      pulse: false,
    },
  };

  const current = statusConfig[status] || statusConfig.idle;
  const IconComponent = current.icon;
  const displayLabel = label || current.defaultLabel;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border backdrop-blur-md transition-all duration-300 ${current.color} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {current.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
      </span>

      <IconComponent className={`w-3.5 h-3.5 ${status === 'analyzing' ? 'animate-spin' : ''}`} />

      <span>{displayLabel}</span>

      {modelName && (
        <span className="text-[10px] font-mono opacity-70 border-l border-current/30 pl-2 tracking-tight">
          {modelName}
        </span>
      )}
    </div>
  );
}
