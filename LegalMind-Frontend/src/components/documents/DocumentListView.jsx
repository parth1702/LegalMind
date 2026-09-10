import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Star,
  Download,
  Archive,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  XCircle,
  Sparkles,
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

export default function DocumentListView({
  documents,
  onToggleFavorite,
  onOpenActionModal,
}) {
  return (
    <div className="card-base p-0 overflow-hidden border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Upload Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {documents.map((doc) => {
              const riskKey = (doc.riskLevel || 'low').toLowerCase();
              const risk = riskConfig[riskKey] || riskConfig.low;
              const status = statusConfig[doc.status] || statusConfig.Analyzed;
              const RiskIcon = risk.icon;
              const StatusIcon = status.icon;

              return (
                <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors group">
                  {/* Document Name & Favorite */}
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(doc.id)}
                        className="text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                        aria-label="Toggle favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <span className="truncate block font-bold text-slate-100 group-hover:text-cyan-300 transition-colors max-w-[240px] sm:max-w-[300px]">
                          {doc.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{doc.size}</span>
                      </div>
                    </div>
                  </td>

                  {/* Document Type */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {doc.type}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span className={`badge ${status.badge} text-[10px] flex items-center gap-1 w-max`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{doc.status}</span>
                    </span>
                  </td>

                  {/* Non-Color Risk Level Tag */}
                  <td className="py-3 px-4">
                    <span className={`badge ${risk.badge} text-[10px] flex items-center gap-1 w-max`}>
                      <RiskIcon className="w-3 h-3" />
                      <span>{risk.text}</span>
                    </span>
                  </td>

                  {/* Risk Score Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Index</span>
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
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {doc.uploadDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/app/analysis/${doc.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="View Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onOpenActionModal(doc, 'download')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenActionModal(doc, 'archive')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Archive Document"
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenActionModal(doc, 'delete')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
