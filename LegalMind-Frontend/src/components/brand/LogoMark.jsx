import React from 'react';

/**
 * LegalMind AI LogoMark
 * Abstract identity combining:
 * 1. Shield geometry (Legal Trust & Protection)
 * 2. Document node grid (Document Intelligence)
 * 3. Neural AI core (Artificial Intelligence & Precision)
 */
export default function LogoMark({ size = 'md', className = '', animated = false }) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center ${dimension} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="coreGradient" x1="22" y1="22" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Outer Protective Shield */}
        <path
          d="M32 6L54 14V30C54 44.5 44.5 56 32 60C19.5 56 10 44.5 10 30V14L32 6Z"
          stroke="url(#shieldGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#050814"
          fillOpacity="0.85"
        />

        {/* Inner Document Alignment Box */}
        <rect
          x="22"
          y="22"
          width="20"
          height="20"
          rx="3"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.7"
        />

        {/* Neural AI Core & Spark */}
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="url(#coreGradient)"
          className={animated ? 'animate-pulse' : ''}
        />
        <circle cx="32" cy="32" r="2.5" fill="#ffffff" />

        {/* Connecting Data Rays */}
        <line x1="32" y1="16" x2="32" y2="22" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="42" x2="32" y2="48" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="32" x2="22" y2="32" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="32" x2="48" y2="32" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
