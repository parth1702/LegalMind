import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Star,
  Download,
  Archive,
  Trash2,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  XCircle,
} from 'lucide-react';

const riskConfig = {
  low: { badge: 'badge-low', icon: CheckCircle2, text: 'Low Risk' },
  medium: { badge: 'badge-medium', icon: AlertCircle, text: 'Medium Risk' },
  high: { badge: 'badge-high', icon: AlertTriangle, text: 'High Risk' },
  critical: { badge: 'badge-critical', icon: ShieldAlert, text: 'Critical Risk' },
};

const statusConfig = {
  Analyzed: { badge: 'badge-low', icon: CheckCircle2 },
  Processing: { badge: 'badge-ai', icon: Clock },
  Pending: { badge: 'badge-neutral', icon: Clock },
  Failed: { badge: 'badge-high', icon: XCircle },
  Archived: { badge: 'badge-neutral', icon: Archive },
};

export default function DocumentCardView({
  documents,
  onToggleFavorite,
  onOpenActionModal,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => {
        const riskKey = (doc.riskLevel || 'low').toLowerCase();
        const risk = riskConfig[riskKey] || riskConfig.low;
        const status = statusConfig[doc.status] || statusConfig.Analyzed;
        const RiskIcon = risk.icon;
        const StatusIcon = status.icon;

        return (
          <div
            key={doc.id}
            className="card-base p-5 space-y-4 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            {/* Card Header: Icon + Name + Favorite Button */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors"
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {doc.type} • {doc.size}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                  aria-label={doc.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Status Badges & Non-Color Risk Level */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`badge ${status.badge} text-[10px] flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{doc.status}</span>
                </span>

                <span className={`badge ${risk.badge} text-[10px] flex items-center gap-1`}>
                  <RiskIcon className="w-3 h-3" />
                  <span>{risk.text}</span>
                </span>
              </div>

              {/* Risk Progress & Confidence */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Risk Score Index</span>
                  <span className="font-bold text-slate-200">{doc.riskScore}%</span>
                </div>
                <div className="progress-container h-1.5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${doc.riskScore}%`,
                      backgroundColor:
                        doc.riskScore > 70
                          ? '#f43f5e'
                          : doc.riskScore > 40
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>Confidence: {doc.modelConfidence}</span>
                  <span>{doc.flaggedClausesCount} Flags</span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[10px]">{doc.uploadDate}</span>

              <div className="flex items-center gap-1">
                <Link
                  to={`/app/analysis/${doc.id}`}
                  className="p-1.5 rounded-lg hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                  title="Open Analysis"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => onOpenActionModal(doc, 'download')}
                  className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenActionModal(doc, 'archive')}
                  className="p-1.5 rounded-lg hover:text-amber-400 hover:bg-slate-800 transition-colors"
                  title="Archive Document"
                >
                  <Archive className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenActionModal(doc, 'delete')}
                  className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
