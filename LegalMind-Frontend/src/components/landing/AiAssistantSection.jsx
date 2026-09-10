import React from 'react';
import { Bot, MessageSquare, Sparkles, Scale, RefreshCw } from 'lucide-react';

export default function AiAssistantSection() {
  return (
    <section className="py-16 sm:py-24 bg-background border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Conversational Co-Pilot
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
            Interactive AI Legal Assistant
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Query your active contract repository, draft alternative clause language, and verify precedents in natural language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-base p-6 space-y-4 border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">Natural Language Q&A</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask specific questions like "What are our remedies if the vendor fails SLA targets?" and get precise line citation answers.
              </p>
            </div>
          </div>

          <div className="card-base p-6 space-y-4 border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">Instant Clause Redrafting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transform aggressive opponent terms into balanced fallback language aligned with your corporate playbook.
              </p>
            </div>
          </div>

          <div className="card-base p-6 space-y-4 border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">Precedent Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare new vendor contracts against historical signed agreements to maintain negotiation consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
