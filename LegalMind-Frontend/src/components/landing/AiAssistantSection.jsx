import React from 'react';
import { MessageSquare, RefreshCw, Scale } from 'lucide-react';

const features = [
  {
    icon: MessageSquare, color: 'indigo',
    title: 'Natural Language Q&A',
    desc: 'Ask specific questions like "What are our remedies if the vendor fails SLA targets?" and get precise line citation answers.',
  },
  {
    icon: RefreshCw, color: 'blue',
    title: 'Instant Clause Redrafting',
    desc: 'Transform aggressive opponent terms into balanced fallback language aligned with your corporate playbook.',
  },
  {
    icon: Scale, color: 'green',
    title: 'Precedent Matching',
    desc: 'Compare new vendor contracts against historical signed agreements to maintain negotiation consistency.',
  },
];

const colorMap = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400',
  blue:   'bg-blue-50 border-blue-200 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400',
  green:  'bg-green-50 border-green-200 text-green-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
};

export default function AiAssistantSection() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-background border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Conversational Co-Pilot
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Interactive AI Legal Assistant
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Query your active contract repository, draft alternative clause language, and verify precedents in natural language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card-base p-6 space-y-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
