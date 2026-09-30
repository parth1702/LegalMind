import React from 'react';
import { ShieldCheck, Lock, Server, EyeOff } from 'lucide-react';

const trustFeatures = [
  { icon: ShieldCheck, title: 'Enterprise Security Certified', description: 'Audited enterprise operations ensuring strict security, availability, and confidentiality controls.' },
  { icon: Lock,        title: '256-bit Hardware Encryption', description: 'All document payloads encrypted at rest and in transit using hardware security modules.' },
  { icon: EyeOff,      title: 'Zero LLM Model Training',    description: 'Your confidential legal contracts are never used to train global AI foundation models.' },
  { icon: Server,      title: 'Isolated Tenant Environments',description: 'Dedicated vector spaces and database isolation prevent cross-organization data leakage.' },
];

export default function SecurityTrustSection() {
  return (
    <section id="security" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#050814] border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-emerald-400">
            Enterprise Security Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Bank-Grade Trust & Privacy Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Legal documents contain your company's most sensitive commitments. Security is engineered into every layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="card-base p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/30 flex items-center justify-center text-green-600 dark:text-emerald-400">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
