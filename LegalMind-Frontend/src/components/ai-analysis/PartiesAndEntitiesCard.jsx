import React from 'react';
import { Building, Users, FileCode, CheckCircle2 } from 'lucide-react';

export default function PartiesAndEntitiesCard({ parties, entities }) {
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Left Column: Contracting Parties */}
      <div className="lg:col-span-5 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Contracting Parties
          </h3>
        </div>

        <div className="space-y-3">
          {(parties || []).map((party, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-ai text-[10px]">{party.role}</span>
                <span className="text-[10px] font-mono text-slate-500">{party.jurisdiction}</span>
              </div>
              <div className="text-sm font-bold text-slate-100">{party.name}</div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Signatory: {party.signatory}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Extracted Named Entities */}
      <div className="lg:col-span-7 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Extracted Named Entities & Terms
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(entities || []).map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{item.label}</span>
                <span className="badge badge-neutral text-[9px]">{item.category}</span>
              </div>
              <div className="text-xs font-bold text-slate-200">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
