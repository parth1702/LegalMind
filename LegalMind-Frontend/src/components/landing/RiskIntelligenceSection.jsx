import React from 'react';
import { AlertTriangle, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export default function RiskIntelligenceSection() {
  return (
    <section id="risk-intelligence" className="py-16 sm:py-24 bg-background border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                Risk Anomaly Detection
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
                Multi-Tier Legal Risk Intelligence
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                LegalMind AI flags hidden liabilities, non-standard indemnities, and aggressive termination conditions using institutional compliance playbooks.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Critical & High Risk Scoring</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Instantly flags uncapped liability, waiver of jury trials, and broad IP assignments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Medium Risk Playbook Deviations</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Highlights silent auto-renewals, non-standard payment terms, and broad confidentiality windows.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Standard & Low Risk Clauses</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Verifies standard governing law, boilerplate definitions, and mutual obligations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Comparison Card */}
          <div className="lg:col-span-7 card-elevated p-6 space-y-4 bg-[#0b1021]/90 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Risk Audit Example: Indemnity Clause
              </span>
              <span className="badge badge-high">High Risk Detected</span>
            </div>

            {/* Original Draft */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">Flagged Contract Language:</span>
              <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-rose-900/40 leading-relaxed">
                "Vendor agrees to defend, indemnify, and hold harmless Customer from any and all claims, losses, or liabilities arising directly or indirectly out of any breach of performance..."
              </p>
            </div>

            {/* AI Recommendation */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Recommended AI Fallback Language:
              </span>
              <p className="text-xs font-mono text-cyan-200 bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/40 leading-relaxed">
                "Vendor agrees to defend Customer against third-party claims arising solely from Vendor's gross negligence or willful misconduct, subject to the limitation of liability in Section 12."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
