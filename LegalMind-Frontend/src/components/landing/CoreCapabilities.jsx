import React from 'react';
import { FileSearch, ShieldAlert, MessageSquareCode, Activity } from 'lucide-react';

const capabilities = [
  {
    icon: FileSearch,
    title: 'Automated Clause Extraction',
    description: 'Neural entity models extract key clauses, termination terms, liability limits, and indemnity commitments in seconds.',
    accent: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200',
    hover: 'hover:border-blue-300 hover:shadow-md',
  },
  {
    icon: ShieldAlert,
    title: '4-Tier Risk Assessment',
    description: 'Categorize clauses into Low, Medium, High, and Critical risk tiers based on customizable institutional baselines.',
    accent: 'text-red-600',
    iconBg: 'bg-red-50 border-red-200',
    hover: 'hover:border-red-300 hover:shadow-md',
  },
  {
    icon: MessageSquareCode,
    title: 'Legal AI Co-Pilot',
    description: 'Query your legal repository in natural language, draft alternative fallback language, and compare precedents instantly.',
    accent: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
    hover: 'hover:border-indigo-300 hover:shadow-md',
  },
  {
    icon: Activity,
    title: 'Immutable Audit Stream',
    description: 'Track all legal reviews, risk overrides, and document edits with verifiable timestamps for enterprise governance.',
    accent: 'text-green-600',
    iconBg: 'bg-green-50 border-green-200',
    hover: 'hover:border-green-300 hover:shadow-md',
  },
];

export default function CoreCapabilities() {
  return (
    <section id="capabilities" className="py-16 sm:py-24 bg-white dark:bg-background border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Enterprise Legal Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Core Platform Capabilities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Designed for in-house legal teams, corporate law firms, and procurement professionals requiring absolute precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`card-base p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 ${item.hover}`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.iconBg} ${item.accent}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
