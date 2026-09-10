import React from 'react';
import { FileSearch, ShieldAlert, MessageSquareCode, Activity, Sparkles, Scale } from 'lucide-react';

const capabilities = [
  {
    icon: FileSearch,
    title: 'Automated Clause Extraction',
    description: 'Neural entity models extract key clauses, termination terms, liability limits, and indemnity commitments in seconds.',
    accent: 'text-cyan-400',
    border: 'hover:border-cyan-500/40',
  },
  {
    icon: ShieldAlert,
    title: '4-Tier Risk Assessment Matrix',
    description: 'Categorize clauses instantly into Low, Medium, High, and Critical risk tiers based on customizable institutional baselines.',
    accent: 'text-rose-400',
    border: 'hover:border-rose-500/40',
  },
  {
    icon: MessageSquareCode,
    title: 'Conversational Legal AI Co-Pilot',
    description: 'Query your legal repository in natural language, draft alternative fallback language, and compare precedents instantly.',
    accent: 'text-indigo-400',
    border: 'hover:border-indigo-500/40',
  },
  {
    icon: Activity,
    title: 'Immutable Audit Stream',
    description: 'Track all legal reviews, risk overrides, and document edits with verifiable timestamps for enterprise governance.',
    accent: 'text-emerald-400',
    border: 'hover:border-emerald-500/40',
  },
];

export default function CoreCapabilities() {
  return (
    <section id="capabilities" className="py-16 sm:py-24 bg-background border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Enterprise Legal Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
            Core Platform Capabilities
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Designed for in-house legal teams, corporate law firms, and procurement professionals requiring absolute precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`card-base p-6 space-y-4 transition-all duration-200 hover:-translate-y-1 ${item.border}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${item.accent}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
