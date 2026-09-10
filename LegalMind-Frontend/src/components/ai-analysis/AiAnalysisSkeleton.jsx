import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Cpu, FileSearch, Scale } from 'lucide-react';
import LogoMark from '../brand/LogoMark';

const STAGES = [
  { id: 'ocr', label: 'OCR & Structural Tokenization', desc: 'Parsing contract layout & clause boundaries', progress: 20 },
  { id: 'entities', label: 'Entity & Signatory Mapping', desc: 'Extracting contracting parties & governing jurisdiction', progress: 40 },
  { id: 'statutory', label: 'Statutory Compliance Audit', desc: 'Checking against Indian Contract Act 1872 & DPDP 2023', progress: 65 },
  { id: 'risk', label: 'Liability & Risk Index', desc: 'Evaluating indemnity, penalties & uncapped exposure', progress: 85 },
  { id: 'report', label: 'Executive Report Synthesis', desc: 'Generating fallback playbook & strategic recommendations', progress: 99 },
];

export default function AiAnalysisSkeleton({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (currentIdx < STAGES.length) {
      const timer = setTimeout(() => {
        if (currentIdx === STAGES.length - 1) {
          if (typeof onComplete === 'function') {
            onComplete();
          }
        } else {
          setCurrentIdx((prev) => prev + 1);
        }
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, onComplete]);

  const currentStage = STAGES[currentIdx] || STAGES[0];

  return (
    <div className="card-elevated p-6 sm:p-8 bg-[#070b18]/95 border-slate-800 space-y-8 animate-in fade-in duration-300 relative overflow-hidden">
      {/* Background Animated Scanning Grid Light */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Pipeline Tracker */}
      <div className="space-y-4 text-center max-w-xl mx-auto relative z-10">
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md animate-pulse" />
          <LogoMark size="lg" animated />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>NEURAL CONTRACT INTELLIGENCE PIPELINE</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">
            Stage {currentIdx + 1} of 5: {currentStage.label}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            {currentStage.desc}...
          </p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="space-y-1">
          <div className="progress-container h-2.5 bg-slate-900 border border-slate-800">
            <div
              className="progress-indicator bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 shadow-glow"
              style={{ width: `${currentStage.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Model: LegalMind Core Engine</span>
            <span className="text-cyan-300 font-bold">{currentStage.progress}% Complete</span>
          </div>
        </div>
      </div>

      {/* Stage Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 max-w-4xl mx-auto text-[11px] font-mono relative z-10">
        {STAGES.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={s.id}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm'
                  : isCurrent
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold ring-1 ring-cyan-500/30 shadow-glow'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700 block shrink-0" />
                )}
                <span className="truncate leading-tight">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Futuristic Radar Document Skeleton Preview */}
      <div className="space-y-4 pt-6 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            Synthesizing Document Structure...
          </span>
          <span className="flex items-center gap-2 text-indigo-400">
            <Scale className="w-4 h-4" />
            Applying Indian Statutory Lexicon
          </span>
        </div>

        {/* Cards Skeleton Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton h-12 w-24 rounded-lg" />
            <div className="skeleton h-2.5 w-full rounded-full" />
          </div>

          <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-14 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-10 w-full rounded-lg" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
