import React from 'react';
import { FileText, X, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import UploadStageTracker from './UploadStageTracker';

export default function UploadQueueList({
  queue,
  onCancel,
  onRetry,
  onRemove,
}) {
  if (!queue || queue.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
          Upload Queue ({queue.length} {queue.length === 1 ? 'file' : 'files'})
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {queue.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 transition-colors"
          >
            {/* Top Info Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-200 truncate block">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB • {item.type}
                  </span>
                </div>
              </div>

              {/* Per-file action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {item.status === 'processing' && (
                  <button
                    type="button"
                    onClick={() => onCancel(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Cancel upload"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {item.status === 'failed' && (
                  <button
                    type="button"
                    onClick={() => onRetry(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center gap-1 text-xs font-mono"
                    title="Retry processing"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stage & Progress Tracker */}
            <UploadStageTracker
              currentStage={item.stage}
              progress={item.progress}
              isFailed={item.status === 'failed'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
