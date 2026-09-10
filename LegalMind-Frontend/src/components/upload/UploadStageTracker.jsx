import React from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'uploading', label: 'Vault Upload' },
  { id: 'reading', label: 'OCR Extraction' },
  { id: 'extracting', label: 'Clause Parser' },
  { id: 'analyzing', label: 'Statutory Risk Audit' },
  { id: 'insights', label: 'RAG Embedding' },
  { id: 'complete', label: 'Analysis Verified' },
];

export default function UploadStageTracker({ currentStage, progress, isFailed }) {
  const currentIdx = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="space-y-2.5 pt-2">
      {/* Progress Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
          {isFailed ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Processing Failed
            </span>
          ) : currentStage === 'complete' ? (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Contract Analysis Verified
            </span>
          ) : (
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Pipeline: {STAGES[currentIdx]?.label || 'Processing...'}</span>
            </span>
          )}
        </span>
        <span className="text-cyan-400 font-bold font-mono">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-container h-2.5 bg-slate-950 border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
            isFailed
              ? 'bg-rose-500'
              : currentStage === 'complete'
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 shadow-glow'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage Chips Stream */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 overflow-x-auto gap-1">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIdx || currentStage === 'complete';
          const isCurrent = stage.id === currentStage && !isFailed;

          return (
            <span
              key={stage.id}
              className={`shrink-0 px-2 py-0.5 rounded-md transition-all ${
                isDone
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : isCurrent
                  ? 'text-cyan-300 bg-cyan-500/20 font-bold border border-cyan-500/40 shadow-sm'
                  : isFailed && idx === currentIdx
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-slate-600'
              }`}
            >
              {stage.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
