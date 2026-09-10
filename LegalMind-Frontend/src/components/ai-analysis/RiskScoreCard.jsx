import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

const riskConfig = {
  low: { badge: 'badge-low', icon: CheckCircle2, label: 'Low Risk', text: 'Compliant & Standard Statutory Terms', color: '#10b981' },
  medium: { badge: 'badge-medium', icon: AlertCircle, label: 'Medium Risk', text: 'Minor Negotiation Required', color: '#f59e0b' },
  high: { badge: 'badge-high', icon: AlertTriangle, label: 'High Risk', text: 'Uncapped Liability & Exposure', color: '#f43f5e' },
  critical: { badge: 'badge-critical', icon: ShieldAlert, label: 'Critical Risk', text: 'Severe Statutory Non-Compliance', color: '#ef4444' },
};

export default function RiskScoreCard({ riskScore, riskLevel, modelVersion }) {
  const risk = riskConfig[riskLevel] || riskConfig.high;
  const RiskIcon = risk.icon;

  return (
    <div className="card-base p-6 border-slate-800 space-y-5 bg-[#0b1021]/95 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Background Subtle Gradient Glow */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: risk.color }}
      />

      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            AI Legal Exposure Index
          </span>
        </div>
        <span className="badge badge-ai text-[10px] font-mono">{modelVersion || 'Evidence-Backed Legal Engine'}</span>
      </div>

      <div className="flex items-center justify-between gap-4 relative z-10 py-1">
        {/* Score Number Gauge */}
        <div className="space-y-1">
          <div className="text-5xl font-extrabold font-mono text-slate-100 tracking-tight flex items-baseline gap-1.5">
            <span className="drop-shadow-md">{riskScore}</span>
            <span className="text-base text-slate-500 font-normal">/ 100</span>
          </div>
          <p className="text-xs text-slate-300 font-sans font-medium">{risk.text}</p>
        </div>

        {/* Risk Level Badge */}
        <div className="text-right space-y-1.5">
          <span className={`badge ${risk.badge} text-xs px-3.5 py-1.5 flex items-center gap-2 shadow-sm`}>
            <RiskIcon className="w-4 h-4" />
            <span className="font-bold">{risk.label}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">
            Indian Statutory Standard
          </span>
        </div>
      </div>

      {/* Risk Progress Track */}
      <div className="space-y-2 pt-3 border-t border-slate-800/80 relative z-10">
        <div className="progress-container h-3 bg-slate-950 border border-slate-800/90 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{
              width: `${riskScore}%`,
              backgroundColor: risk.color,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold">
          <span>0 (Standard)</span>
          <span>40 (Moderate)</span>
          <span>75 (High Exposure)</span>
          <span>100 (Critical)</span>
        </div>
      </div>
    </div>
  );
}
