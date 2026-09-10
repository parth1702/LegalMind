import React from 'react';

/**
 * Product Status Indicator Component
 * Statuses: 'online' | 'processing' | 'secure' | 'warning' | 'error' | 'low-risk' | 'critical-risk'
 */
export default function StatusIndicator({
  status = 'online',
  label,
  showDot = true,
  className = '',
}) {
  const config = {
    online: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
      defaultLabel: 'System Operational',
      pulse: false,
    },
    processing: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-300',
      border: 'border-cyan-500/20',
      dot: 'bg-cyan-400',
      defaultLabel: 'Processing',
      pulse: true,
    },
    secure: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-300',
      border: 'border-indigo-500/20',
      dot: 'bg-indigo-400',
      defaultLabel: 'Encrypted & Secure',
      pulse: false,
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-400',
      defaultLabel: 'Review Required',
      pulse: false,
    },
    error: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-400',
      defaultLabel: 'System Error',
      pulse: false,
    },
    'low-risk': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
      defaultLabel: 'Low Risk',
      pulse: false,
    },
    'critical-risk': {
      bg: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
      defaultLabel: 'Critical Risk',
      pulse: true,
    },
  };

  const current = config[status] || config.online;
  const displayLabel = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {current.pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dot} opacity-75`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
