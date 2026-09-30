import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Zap } from 'lucide-react';

export default function RiskIntelligenceSection() {
  return (
    <section id="risk-intelligence" className="py-16 sm:py-24 bg-white dark:bg-background border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-rose-400">
                Risk Anomaly Detection
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Multi-Tier Legal Risk Intelligence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                LegalMind AI flags hidden liabilities, non-standard indemnities, and aggressive termination conditions using institutional compliance playbooks.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: AlertTriangle, color: 'red', title: 'Critical & High Risk Scoring', desc: 'Instantly flags uncapped liability, waiver of jury trials, and broad IP assignments.' },
                { icon: AlertCircle, color: 'amber', title: 'Medium Risk Playbook Deviations', desc: 'Highlights silent auto-renewals, non-standard payment terms, and broad confidentiality windows.' },
                { icon: ShieldCheck, color: 'green', title: 'Standard & Low Risk Clauses', desc: 'Verifies standard governing law, boilerplate definitions, and mutual obligations.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    color === 'red'   ? 'bg-red-50 border border-red-200 text-red-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400' :
                    color === 'amber' ? 'bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' :
                                       'bg-green-50 border border-green-200 text-green-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-7 card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Risk Audit Example: Indemnity Clause
              </span>
              <span className="badge badge-high">High Risk Detected</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-red-600 dark:text-rose-400 uppercase tracking-wider">Flagged Contract Language:</span>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-slate-950 p-3 rounded-lg border border-red-200 dark:border-rose-900/40 leading-relaxed">
                "Vendor agrees to defend, indemnify, and hold harmless Customer from any and all claims, losses, or liabilities arising directly or indirectly out of any breach of performance..."
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Recommended AI Fallback Language:
              </span>
              <p className="text-xs font-mono text-blue-800 dark:text-cyan-200 bg-blue-50 dark:bg-cyan-950/30 p-3 rounded-lg border border-blue-200 dark:border-cyan-800/40 leading-relaxed">
                "Vendor agrees to defend Customer against third-party claims arising solely from Vendor's gross negligence or willful misconduct, subject to the limitation of liability in Section 12."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
