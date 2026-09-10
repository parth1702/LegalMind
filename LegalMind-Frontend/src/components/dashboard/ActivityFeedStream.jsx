import React from 'react';
import { AlertTriangle, Sparkles, MessageSquare, ShieldCheck, Clock } from 'lucide-react';

const iconConfig = {
  risk_flag: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  extraction: { icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ai_query: { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  audit: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function ActivityFeedStream({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="card-base p-5 space-y-4 border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Recent Activity & Security Stream
        </h3>
        <span className="badge badge-neutral text-[10px]">Real-time Audit</span>
      </div>

      <div className="space-y-3">
        {activities.map((item) => {
          const config = iconConfig[item.type] || iconConfig.audit;
          const IconComponent = config.icon;

          return (
            <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className={`p-2 rounded-lg border ${config.bg} ${config.color} shrink-0 mt-0.5`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{item.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed truncate">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
