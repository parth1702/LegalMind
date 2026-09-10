import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert, ArrowRight, MoreVertical, Eye } from 'lucide-react';

const riskConfig = {
  low: {
    badge: 'badge-low',
    icon: CheckCircle2,
    text: 'Low Risk',
    color: 'text-emerald-400',
  },
  medium: {
    badge: 'badge-medium',
    icon: AlertCircle,
    text: 'Medium Risk',
    color: 'text-amber-400',
  },
  high: {
    badge: 'badge-high',
    icon: AlertTriangle,
    text: 'High Risk',
    color: 'text-rose-400',
  },
  critical: {
    badge: 'badge-critical',
    icon: ShieldAlert,
    text: 'Critical Risk',
    color: 'text-red-400',
  },
};

export default function RecentDocumentsTable({ documents }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="card-base p-5 space-y-4 border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Recent Contract Reviews
          </h3>
          <p className="text-[11px] text-slate-400">Latest parsed agreements and clause risk scores</p>
        </div>
        <Link
          to="/app/documents"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          <span>View All Documents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Document Name</th>
              <th className="py-2.5 px-3">Agreement Type</th>
              <th className="py-2.5 px-3">Risk Assessment</th>
              <th className="py-2.5 px-3">Risk Index</th>
              <th className="py-2.5 px-3">Upload Date</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {documents.map((doc) => {
              const riskKey = (doc.riskLevel || 'low').toLowerCase();
              const risk = riskConfig[riskKey] || riskConfig.low;
              const RiskIcon = risk.icon;

              return (
                <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors group">
                  {/* Document Name */}
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-[260px] group-hover:text-cyan-300 transition-colors">
                        {doc.name}
                      </span>
                    </div>
                  </td>

                  {/* Agreement Type */}
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {doc.type}
                  </td>

                  {/* Non-Color Risk Level with Icon + Label */}
                  <td className="py-3 px-3">
                    <span className={`badge ${risk.badge} flex items-center gap-1.5 w-max`}>
                      <RiskIcon className="w-3 h-3 shrink-0" />
                      <span>{risk.text}</span>
                    </span>
                  </td>

                  {/* Risk Score Progress Bar */}
                  <td className="py-3 px-3">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Score</span>
                        <span className={`font-semibold ${risk.color}`}>{doc.riskScore}%</span>
                      </div>
                      <div className="progress-container h-1.5">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${doc.riskScore}%`, backgroundColor: doc.riskScore > 70 ? '#f43f5e' : doc.riskScore > 40 ? '#f59e0b' : '#10b981' }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Upload Date */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {doc.date}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to="/app/analysis"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="View Risk Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
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
