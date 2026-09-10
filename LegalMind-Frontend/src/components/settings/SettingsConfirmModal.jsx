import React from 'react';
import { AlertTriangle, Trash2, ShieldAlert, LogOut, X } from 'lucide-react';

export default function SettingsConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'deleteAccount', // 'deleteAccount' | 'revokeSessions' | 'exportData'
}) {
  if (!isOpen) return null;

  const configMap = {
    deleteAccount: {
      title: 'Delete Enterprise Account',
      description: 'Are you sure you want to permanently delete your LegalMind AI account? All document vector vaults, custom playbooks, and audit logs will be unrecoverable.',
      confirmLabel: 'Delete My Account',
      confirmClass: 'btn-danger',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/30',
    },
    revokeSessions: {
      title: 'Revoke All Active Sessions',
      description: 'This will log out your account from all browsers, mobile devices, and active API keys. You will need to sign in again.',
      confirmLabel: 'Revoke All Sessions',
      confirmClass: 'btn-primary bg-amber-500 hover:bg-amber-400 text-slate-950',
      icon: LogOut,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30',
    },
    exportData: {
      title: 'Export Full Data Archive',
      description: 'Generate an encrypted ZIP archive containing all document metadata, extracted clauses, risk matrices, and audit streams for Acme Corporation?',
      confirmLabel: 'Generate & Download ZIP',
      confirmClass: 'btn-primary',
      icon: AlertTriangle,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    },
  };

  const config = configMap[type] || configMap.deleteAccount;
  const IconComponent = config.icon;

  return (
    <div className="modal-backdrop animate-in fade-in duration-150">
      <div
        className="modal-card border-slate-800 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-slate-100">
                {config.title}
              </h2>
              <p className="text-[11px] font-mono text-slate-500">Settings Security Confirmation</p>
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

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans">
          {config.description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(type);
              onClose();
            }}
            className={`btn btn-sm ${config.confirmClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
