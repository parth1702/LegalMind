import React, { useState } from 'react';
import { Network, ShieldAlert, FileText, Scale, ArrowRight, Info, CheckCircle2, Sparkles } from 'lucide-react';

export default function ContractVisualDiagram({ graphData, onSelectNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const nodes = graphData?.nodes || [
    { id: 'n1', label: 'Licensor / Service Provider', type: 'party', risk: 'low', description: 'Primary party providing software license and cloud services.' },
    { id: 'n2', label: 'Licensee / Client', type: 'party', risk: 'low', description: 'Enterprise client acquiring non-exclusive user licenses.' },
    { id: 'n3', label: 'Indemnification & IP Clause', type: 'clause', risk: 'high', description: 'Mandates unilateral defense for third-party IP infringement claims.' },
    { id: 'n4', label: 'Uncapped Financial Liability', type: 'risk', risk: 'critical', description: 'Excludes liability caps for indemnity breaches, risking unlimited exposure.' },
    { id: 'n5', label: 'Indian Contract Act 1872 (Sec 73)', type: 'statute', risk: 'low', description: 'Governs direct damages recovery and excludes indirect consequential losses.' },
    { id: 'n6', label: 'DPDP Act 2023 (Data Safeguards)', type: 'statute', risk: 'medium', description: 'Requires strict technical measures for personal data processing.' },
  ];

  const edges = graphData?.edges || [
    { from: 'n1', to: 'n3', label: 'Grants Indemnity' },
    { from: 'n2', to: 'n3', label: 'Receives Coverage' },
    { from: 'n3', to: 'n4', label: 'Triggers Risk' },
    { from: 'n4', to: 'n5', label: 'Governed by Sec 73' },
    { from: 'n1', to: 'n6', label: 'Statutory Obligation' },
  ];

  const getNodeColor = (type, risk) => {
    if (risk === 'critical') return 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/50 dark:text-rose-300';
    if (risk === 'high') return 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300';
    if (type === 'party') return 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 dark:bg-sky-500/20 dark:border-sky-500/50 dark:text-sky-300';
    if (type === 'statute') return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-300';
    return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-300 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300';
  };

  const getNodeIcon = (type, risk) => {
    if (risk === 'critical' || risk === 'high') return <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
    if (type === 'party') return <Network className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />;
    if (type === 'statute') return <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleNodeClick = (node) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="card-base p-6 space-y-5 bg-white dark:bg-card border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Visual Graph</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Contract Structure & Risk Pathway Diagram
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Party</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Clause</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Statute</span>
        </div>
      </div>

      {/* Visual Diagram Body */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Graph Canvas Nodes */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-xl p-6 min-h-[320px] flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleNodeClick(node)}
                  className={`
                    p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 relative cursor-pointer
                    ${getNodeColor(node.type, node.risk)}
                    ${isSelected ? 'ring-2 ring-blue-600 dark:ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 scale-[1.02]' : ''}
                  `}
                >
                  {getNodeIcon(node.type, node.risk)}
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold truncate">{node.label}</div>
                    <div className="text-[10px] uppercase font-mono opacity-80">{node.type} • {node.risk || 'standard'} risk</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Relationship Connection Badges */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2">Connected Legal Relationships:</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {edges.map((edge, idx) => {
                const sourceNode = nodes.find((n) => n.id === edge.from);
                const targetNode = nodes.find((n) => n.id === edge.to);
                return (
                  <div key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 shadow-sm">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{sourceNode?.label?.split(' ')[0] || edge.from}</span>
                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="text-blue-600 dark:text-sky-400 font-mono">{edge.label}</span>
                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{targetNode?.label?.split(' ')[0] || edge.to}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Detail Card */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>Node Inspector Detail</span>
          </div>

          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <span className="badge badge-ai capitalize mb-1">{selectedNode.type}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedNode.label}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedNode.description}
              </p>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Impact Assessment: High Priority Legal Node</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Click any graph node to inspect legal details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
