import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AnalysisTrendsChart({ data }) {
  if (!data) return null;

  return (
    <div className="card-base p-5 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
            Analysis Velocity & Risk Trends
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly contract throughput categorized by all risk tiers</p>
        </div>

        {/* All Risk Type Legends */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-700 dark:text-slate-300">Analyzed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-slate-700 dark:text-slate-300">Critical</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="analyzedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lowRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="medRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="highRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="criticalRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="tooltip-box font-mono space-y-1.5 bg-white dark:bg-[#0b1021]/95 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl shadow-xl">
                      <div className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs">
                        {label} Velocity Breakdown
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
                          <span style={{ color: entry.color }} className="capitalize font-medium">
                            {entry.name}:
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-200">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              name="Total Analyzed"
              dataKey="analyzed"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#analyzedGrad)"
            />
            <Area
              type="monotone"
              name="Low Risk"
              dataKey="lowRisk"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#lowRiskGrad)"
            />
            <Area
              type="monotone"
              name="Medium Risk"
              dataKey="mediumRisk"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#medRiskGrad)"
            />
            <Area
              type="monotone"
              name="High Risk"
              dataKey="highRisk"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#highRiskGrad)"
            />
            <Area
              type="monotone"
              name="Critical Risk"
              dataKey="criticalRisk"
              stroke="#dc2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#criticalRiskGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
