import React from 'react';

const stats = [
  {
    value: '98.4%',
    label: 'Clause Extraction Accuracy',
    description: 'Benchmarked on complex commercial agreements',
  },
  {
    value: '10x',
    label: 'Faster Contract Review Velocity',
    description: 'Reduces manual contract review from hours to minutes',
  },
  {
    value: '85%',
    label: 'Risk Anomaly Reduction',
    description: 'Prevents missed liability caps and auto-renewal traps',
  },
  {
    value: '50,000+',
    label: 'Legal Agreements Processed',
    description: 'Trusted across corporate legal and procurement teams',
  },
];

export default function ImpactStatsSection() {
  return (
    <section className="py-16 sm:py-20 bg-background border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="card-base p-6 space-y-2 border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">{stat.label}</div>
              <div className="text-[11px] text-slate-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
