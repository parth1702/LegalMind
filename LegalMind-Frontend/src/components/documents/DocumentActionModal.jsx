import React from 'react';
import { AlertTriangle, Archive, Download, Trash2, X, Sparkles } from 'lucide-react';

export default function DocumentActionModal({
  document,
  actionType,
  isOpen,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !document) return null;

  const actionConfig = {
    delete: {
      title: 'Delete Document',
      description: `Are you sure you want to permanently delete "${document.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete Document',
      confirmBtnClass: 'btn-danger',
      icon: Trash2,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/30',
    },
    archive: {
      title: 'Archive Document',
      description: `Archive "${document.name}"? It will be moved to the compliance archive store and hidden from active risk scoring.`,
      confirmLabel: 'Archive Document',
      confirmBtnClass: 'btn-primary bg-amber-500 hover:bg-amber-400 text-slate-950',
      icon: Archive,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30',
    },
    download: {
      title: 'Download Original File',
      description: `Download original file "${document.name}" (${document.size}) along with its verified SHA-256 integrity hash?`,
      confirmLabel: 'Download File',
      confirmBtnClass: 'btn-primary',
      icon: Download,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    },
    analyze: {
      title: 'Re-run AI Analysis Pipeline',
      description: `Re-analyze "${document.name}" using the latest LegalMind AI model rules?`,
      confirmLabel: 'Run AI Analysis',
      confirmBtnClass: 'btn-ai',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    },
  };

  const config = actionConfig[actionType] || actionConfig.delete;
  const IconComponent = config.icon;

  return (
    <div className="modal-backdrop animate-in fade-in duration-150">
      <div
        className="modal-card border-slate-800 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-slate-100">
                {config.title}
              </h2>
              <p className="text-[11px] font-mono text-slate-500">{document.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-sans">
          {config.description}
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(document.id, actionType)}
            className={`btn btn-sm ${config.confirmBtnClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
