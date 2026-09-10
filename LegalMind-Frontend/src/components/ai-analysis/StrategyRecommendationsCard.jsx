import React from 'react';
import { Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StrategyRecommendationsCard({ importantDates, recommendations }) {
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Left Column: Important Milestone Dates */}
      <div className="lg:col-span-5 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Important Milestone Dates
          </h3>
        </div>

        <div className="space-y-2.5">
          {(importantDates || []).map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                item.isUrgent
                  ? 'bg-rose-950/20 border-rose-800/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200 block">{item.event}</span>
                <span className="text-[11px] font-mono text-cyan-300">{item.date}</span>
              </div>
              <span className={`badge text-[10px] ${item.isUrgent ? 'badge-high' : 'badge-neutral'}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Recommendations & Negotiation Strategy */}
      <div className="lg:col-span-7 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Counsel Negotiation Strategy Playbook
          </h3>
        </div>

        <div className="space-y-3">
          {(recommendations || []).map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {typeof rec === 'object' ? (rec.priority || idx + 1) : idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-100">{typeof rec === 'object' ? rec.action : 'Action Item'}</h4>
                <p className="text-slate-400 leading-relaxed font-sans">{typeof rec === 'object' ? rec.description : rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
