import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const iconMap = {
  CheckCircle2: CheckCircle2,
  AlertCircle: AlertCircle,
  AlertTriangle: AlertTriangle,
  ShieldAlert: ShieldAlert,
};

export default function RiskDistributionChart({ data }) {
  if (!data) return null;

  const totalScans = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="card-base p-5 space-y-4 border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Repository Risk Distribution
          </h3>
          <p className="text-[11px] text-slate-400">Categorized by playbook severity</p>
        </div>
        <span className="badge badge-ai">Multi-Tier Classification</span>
      </div>

      {/* Chart & Legend Grid */}
      <div className="grid sm:grid-cols-12 gap-4 items-center">
        {/* Recharts Donut */}
        <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#050814" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="tooltip-box font-mono">
                        <span className="font-bold block" style={{ color: item.color }}>{item.name}</span>
                        <span className="text-slate-200">{item.value} Documents ({item.label})</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-slate-100">{totalScans}</span>
            <span className="text-[10px] text-slate-400 font-mono">Total Risk Scans</span>
          </div>
        </div>

        {/* Explicit Non-Color Reliant Legend */}
        <div className="sm:col-span-7 space-y-2.5">
          {data.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || AlertCircle;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                  <div>
                    <span className="font-semibold text-slate-200 block leading-none">{item.name}</span>
                    <span className="text-[10px] text-slate-400 leading-none">{item.label}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-200 text-sm">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
