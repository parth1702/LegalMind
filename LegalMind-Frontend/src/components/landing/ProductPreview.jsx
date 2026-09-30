import React from 'react';
import { Shield, Sparkles, FileText, AlertTriangle, CheckCircle2, Send, Bot } from 'lucide-react';
import StatusIndicator from '../brand/StatusIndicator';

export default function ProductPreview() {
  return (
    <section id="product-preview" className="py-16 sm:py-24 bg-white dark:bg-[#050814] border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Interactive Product Preview
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Unified Legal Intelligence Interface
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time clause analysis, risk anomaly detection, and conversational AI co-pilot in a single secure console.
          </p>
        </div>

        {/* Realistic Application Preview Mockup */}
        <div className="card-elevated p-3 sm:p-5 rounded-2xl shadow-xl space-y-4">
          {/* Top Mock Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline-block">
                LegalMind AI • Master_Software_Agreement_2026.pdf
              </span>
            </div>
            <StatusIndicator status="online" label="AI Analysis Complete" />
          </div>

          {/* Main App Grid Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Sidebar */}
            <div className="lg:col-span-3 card-base p-4 space-y-4">
              <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Agreement</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                  <span className="truncate">Master_Software_MSA.pdf</span>
                </div>
                <div className="text-[11px] text-slate-500">42 Pages • Commercial Contract</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Overall Risk Index</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">Medium (64%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '64%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>3 High Risks</span>
                  <span>14 Standard Clauses</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Executive Summary</div>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-snug">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5">•</span>
                    <span>Standard governing law (Delaware jurisdiction).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 shrink-0 mt-0.5">•</span>
                    <span>Uncapped liability clause detected in Section 14.2.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                    <span>30-day auto-renewal notice period.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Center Column: Clause Analysis */}
            <div className="lg:col-span-6 card-base p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Extracted Clause Breakdown
                </div>
                <span className="badge badge-ai">6 Clauses Flagged</span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-slate-900/90 border border-red-200 dark:border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-rose-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Section 14.2 — Limitation of Liability</span>
                  </div>
                  <span className="badge badge-high text-[10px]">High Risk</span>
                </div>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-red-100 dark:border-slate-800 leading-relaxed">
                  "Neither party's liability under this Agreement shall be subject to any financial cap or limitation for consequential damages..."
                </p>
                <div className="text-[11px] text-red-700 dark:text-rose-300 bg-red-100 dark:bg-rose-950/30 p-2 rounded border border-red-200 dark:border-rose-900/40">
                  <span className="font-semibold">AI Risk Insight:</span> Uncapped liability exposes counsel to unlimited financial indemnity claims. Recommend inserting 12-month fee cap.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-green-50 dark:bg-slate-900/90 border border-green-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Section 18.1 — Governing Law & Jurisdiction</span>
                  </div>
                  <span className="badge badge-low text-[10px]">Low Risk</span>
                </div>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-green-100 dark:border-slate-800 leading-relaxed">
                  "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware."
                </p>
              </div>
            </div>

            {/* Right Column: AI Co-Pilot */}
            <div className="lg:col-span-3 card-base p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">AI Assistant Co-Pilot</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="text-[10px] font-medium text-slate-400 block mb-1">User Query</span>
                    "Does this contract contain an automatic renewal clause?"
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800/50 text-blue-800 dark:text-cyan-100 leading-relaxed">
                    <span className="text-[10px] font-medium text-blue-500 dark:text-cyan-400 block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> LegalMind AI Response
                    </span>
                    Yes. Section 9.1 specifies an automatic 12-month renewal unless written notice is given at least 30 days prior to expiry.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask AI about contract clauses..."
                    className="input-base text-xs pr-8"
                    readOnly
                  />
                  <Send className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 absolute right-2.5 top-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
