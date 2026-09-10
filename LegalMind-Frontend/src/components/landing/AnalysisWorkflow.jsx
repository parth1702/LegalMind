import React from 'react';
import { UploadCloud, FileCode2, Gauge, Bot } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UploadCloud,
    title: 'Document Upload & Parsing',
    description: 'Drag & drop PDF or DOCX files. OCR & structural parsers decompose contracts into clean semantic nodes.',
  },
  {
    step: '02',
    icon: FileCode2,
    title: 'Semantic Clause Extraction',
    description: 'NLP models automatically classify clauses (indemnity, confidentiality, IP rights, governing law, termination).',
  },
  {
    step: '03',
    icon: Gauge,
    title: 'Risk Scoring & Detection',
    description: 'Automated policy audit compares extracted terms against institutional playbooks to flag high-risk anomalies.',
  },
  {
    step: '04',
    icon: Bot,
    title: 'Interactive AI Querying',
    description: 'Ask questions, request alternative fallback clauses, and export audited legal summaries instantly.',
  },
];

export default function AnalysisWorkflow() {
  return (
    <section id="workflow" className="py-16 sm:py-24 bg-[#050814] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            End-to-End Pipeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
            How LegalMind AI Works
          </h2>
          <p className="text-sm text-slate-400">
            From raw legal text to structured risk intelligence in four automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="card-base p-6 space-y-4 border-slate-800/90 relative bg-[#0b1021]/60"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold font-mono text-slate-700">{item.step}</span>
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
