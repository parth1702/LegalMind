import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ListTodo,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Info,
  FileText,
  CornerDownRight,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function ContractActionRoadmapCard({
  roadmapData,
  isLoading = false,
  onOpenSourceQuote,
  documentTitle = 'Legal Agreement',
}) {
  const [activeTab, setActiveTab] = useState('nextSteps'); // 'nextSteps' | 'do' | 'dont' | 'remember'
  const [completedSteps, setCompletedSteps] = useState({});

  const doList = roadmapData?.doList || [
    {
      id: 'do-1',
      title: 'Issue Written Notice of Performance Milestone',
      description: 'Formally notify the counterparty in writing within 5 business days of completing each phase.',
      priority: 'high',
      timeline: 'Within 5 business days of milestone completion',
      category: 'Deliverables & Compliance',
      sourceQuote: 'The Contractor shall provide written notice of completion within five (5) business days...',
      pageNumber: 1,
    },
    {
      id: 'do-2',
      title: 'Maintain Audit-Ready Security & Access Logs',
      description: 'Store encryption logs and technical access audit trails under DPDP Act 2023 requirements.',
      priority: 'medium',
      timeline: 'Continuous during contract term',
      category: 'Data Protection Safeguards',
      sourceQuote: 'Party shall maintain complete security logs accessible upon 7 days advance notice.',
      pageNumber: 2,
    },
  ];

  const dontList = roadmapData?.dontList || [
    {
      id: 'dont-1',
      title: 'Do Not Disclose Source Code or Technical Architecture',
      prohibition: 'Strict restriction against sharing tech architecture or source code with third-party vendors without prior written consent.',
      severity: 'critical',
      riskImpact: 'Triggers immediate contract termination and uncapped indemnity claims under Clause 12.',
      sourceQuote: 'Recipient shall not disclose, reverse engineer, or transmit proprietary source code to any third party...',
      pageNumber: 2,
    },
    {
      id: 'dont-2',
      title: 'Do Not Assign Contract Rights Without Approval',
      prohibition: 'Prohibition against sub-contracting obligations or transferring rights without written authorization.',
      severity: 'high',
      riskImpact: 'Renders sub-contract invalid and exposes company to breach default penalties.',
      sourceQuote: 'This Agreement may not be assigned without the prior written consent of both parties.',
      pageNumber: 3,
    },
  ];

  const rememberList = roadmapData?.rememberList || [
    {
      id: 'rem-1',
      title: '30-Day Written Non-Renewal Window',
      keyFact: 'Contract automatically renews for 12 months unless written notice of non-renewal is provided 30 days prior to expiry.',
      type: 'notice',
      details: 'Governed by Clause 4.2. Failure to send notice auto-locks the contract for another year.',
      sourceQuote: 'This Agreement shall automatically renew unless either party provides written notice of non-renewal at least 30 days prior...',
      pageNumber: 3,
    },
    {
      id: 'rem-2',
      title: 'Governing Arbitration Seat: New Delhi, India',
      keyFact: 'All disputes are subject to binding sole arbitration in New Delhi under Indian Arbitration and Conciliation Act 1996.',
      type: 'jurisdiction',
      details: 'Governed by Indian Contract Act 1872 & Arbitration Rules.',
      sourceQuote: 'Disputes shall be settled by sole arbitrator in New Delhi under applicable Indian arbitration laws.',
      pageNumber: 4,
    },
  ];

  const nextStepsList = roadmapData?.nextStepsList || [
    {
      id: 'step-1',
      stepNumber: 1,
      taskName: 'Calendar Renewal Cutoff & Notice Deadline',
      description: 'Set a reminder on executive calendar for 35 days before contract end date to evaluate renewal options.',
      priority: 'high',
      deadline: 'Immediate (Within 48 hours)',
      assignedRole: 'Legal Counsel / Ops Lead',
      sourceQuote: 'Written notice of non-renewal must be delivered at least 30 days prior to Expiration Date.',
      pageNumber: 3,
    },
    {
      id: 'step-2',
      stepNumber: 2,
      taskName: 'Review & Verify Data Protection Controls',
      description: 'Ensure IT team implements DPDP Act compliance safeguards and encrypted data access protocols.',
      priority: 'high',
      deadline: 'Prior to service deployment',
      assignedRole: 'Information Security Lead',
      sourceQuote: 'Technical safeguards must comply with applicable data protection legislation.',
      pageNumber: 2,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      taskName: 'Archive Executed Copy in Legal Vault',
      description: 'Upload signed contract with metadata tags into LegalMind repository.',
      priority: 'medium',
      deadline: 'Within 7 business days',
      assignedRole: 'Contract Manager',
      sourceQuote: 'Executed agreements shall be maintained in official corporate archives.',
      pageNumber: 1,
    },
  ];

  const toggleStepCompleted = (id) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = nextStepsList.filter((s) => completedSteps[s.id]).length;
  const progressPercent = Math.round((completedCount / (nextStepsList.length || 1)) * 100);

  if (isLoading) {
    return (
      <div className="card-base p-6 space-y-4 animate-pulse bg-white dark:bg-card border-slate-200 dark:border-slate-800">
        <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-96 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
        <div className="h-32 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card-base p-6 space-y-6 bg-white dark:bg-card border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Legal Playbook & Action Roadmap</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Contract Execution & Compliance Playbook
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated obligation breakdown, breach restrictions, legal milestones, and prioritized next steps for <span className="text-slate-800 dark:text-slate-200 font-medium">{documentTitle}</span>.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-4 shrink-0">
          <div className="text-center">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">Checklist Progress</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {completedCount} / {nextStepsList.length} Completed
            </span>
          </div>
          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 dark:to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('nextSteps')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'nextSteps'
              ? 'bg-white text-blue-700 border border-blue-200 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
          <span>⚡ Next Steps ({nextStepsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('do')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'do'
              ? 'bg-white text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>🟢 What to DO ({doList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dont')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'dont'
              ? 'bg-white text-rose-700 border border-rose-200 shadow-sm dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>🔴 What NOT to Do ({dontList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('remember')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'remember'
              ? 'bg-white text-amber-700 border border-amber-200 shadow-sm dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>🟡 Things to Remember ({rememberList.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: NEXT STEPS CHECKLIST */}
      {activeTab === 'nextSteps' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            <span>Prioritized Immediate Action Plan for Client & Counsel</span>
            <span>Click checkbox to mark step completed</span>
          </div>

          <div className="space-y-3">
            {nextStepsList.map((step, idx) => {
              const isDone = completedSteps[step.id];
              return (
                <div
                  key={step.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-500/30 opacity-75'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleStepCompleted(step.id)}
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current stroke-[2.5]" />
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                            {step.stepNumber || idx + 1}
                          </span>
                          <h4
                            className={`text-sm font-bold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {step.taskName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono">
                          {step.deadline && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-700 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                              <Clock className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                              {step.deadline}
                            </span>
                          )}
                          {step.assignedRole && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                              👤 {step.assignedRole}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Source Link */}
                      {step.sourceQuote && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSourceQuote &&
                            onOpenSourceQuote({
                              term: `Next Step ${step.stepNumber}: ${step.taskName}`,
                              originalSourceQuote: step.sourceQuote,
                              pageNumber: step.pageNumber || 1,
                              plainEnglishMeaning: step.description,
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-blue-600 dark:text-cyan-400 hover:underline transition-colors pt-1"
                        >
                          <CornerDownRight className="w-3 h-3 text-slate-400" />
                          <span>View Contract Evidence Quote (Page {step.pageNumber || 1})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHAT TO DO */}
      {activeTab === 'do' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            Mandatory performance deliverables, notice obligations, and compliance requirements
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  </div>
                  {item.priority && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                      {item.priority} Priority
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {item.timeline && (
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Timeline: {item.timeline}</span>
                  </div>
                )}

                {item.sourceQuote && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSourceQuote &&
                      onOpenSourceQuote({
                        term: item.title,
                        originalSourceQuote: item.sourceQuote,
                        pageNumber: item.pageNumber || 1,
                        plainEnglishMeaning: item.description,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Inspect Source Quote (Page {item.pageNumber || 1})</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHAT NOT TO DO */}
      {activeTab === 'dont' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            Prohibited actions, restrictive covenants, and legal default triggers
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dontList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  </div>
                  {item.severity && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30">
                      {item.severity} Risk
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.prohibition}
                </p>

                {item.riskImpact && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 font-mono">
                    ⚠️ <span className="font-bold">Breach Trigger:</span> {item.riskImpact}
                  </div>
                )}

                {item.sourceQuote && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSourceQuote &&
                      onOpenSourceQuote({
                        term: item.title,
                        originalSourceQuote: item.sourceQuote,
                        pageNumber: item.pageNumber || 1,
                        plainEnglishMeaning: item.prohibition,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 dark:text-rose-400 hover:underline pt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Inspect Source Quote (Page {item.pageNumber || 1})</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: THINGS TO REMEMBER */}
      {activeTab === 'remember' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            Essential dates, jurisdiction seat, liability thresholds, and governing terms
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rememberList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  </div>
                  {item.type && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
                      {item.type}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {item.keyFact}
                </p>

                {item.details && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {item.details}
                  </p>
                )}

                {item.sourceQuote && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSourceQuote &&
                      onOpenSourceQuote({
                        term: item.title,
                        originalSourceQuote: item.sourceQuote,
                        pageNumber: item.pageNumber || 1,
                        plainEnglishMeaning: item.keyFact,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline pt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Inspect Source Quote (Page {item.pageNumber || 1})</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
