import React from 'react';
import { Scale, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ObligationsMatrixCard({ obligations }) {
  if (!obligations) return null;

  return (
    <div className="card-base p-6 border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-[#0b1021]/90 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Scale className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
          Contractual Obligations Matrix
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Obligations */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
              Customer Obligations (Acme Corp)
            </span>
            <span className="badge badge-ai text-[10px]">4 Commitments</span>
          </div>
          <ul className="space-y-2">
            {(obligations?.customer || []).map((item, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vendor Obligations */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
              Vendor Obligations
            </span>
            <span className="badge badge-low text-[10px]">Commitments</span>
          </div>
          <ul className="space-y-2">
            {(obligations?.vendor || []).map((item, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
