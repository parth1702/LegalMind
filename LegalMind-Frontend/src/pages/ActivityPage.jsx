import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  Lock,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { mockAuditStats, mockAuditLogs } from '../data/activityMockData';

export default function ActivityPage() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'ai_analysis' | 'data_export' | 'security_auth' | 'governance'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'success' | 'alert' | 'warning' | 'info'
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Audit stream refreshed! 342 events synced with immutable ledger.');
    }, 600);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // Filtered log items
  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCsv = () => {
    const headers = [
      'Audit ID',
      'Timestamp',
      'User',
      'Email',
      'Role',
      'Action',
      'Category',
      'Resource',
      'Status',
      'IP Address',
      'Details',
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.user}"`,
      `"${log.email}"`,
      `"${log.role}"`,
      `"${log.action}"`,
      `"${log.category}"`,
      `"${log.resource}"`,
      `"${log.status}"`,
      `"${log.ip}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LegalMind-Audit-Log-Stream-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Audit log CSV downloaded to PC (${filteredLogs.length} events).`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="badge badge-low text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Success
          </span>
        );
      case 'alert':
        return (
          <span className="badge badge-high text-[10px] gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Alert
          </span>
        );
      case 'warning':
        return (
          <span className="badge badge-medium text-[10px] gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Warning
          </span>
        );
      case 'info':
      default:
        return (
          <span className="badge badge-ai text-[10px] gap-1">
            <Info className="w-3 h-3 text-cyan-400" /> Info
          </span>
        );
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ai_analysis':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'data_export':
        return <Database className="w-3.5 h-3.5 text-indigo-400" />;
      case 'security_auth':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'governance':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 alert alert-info shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Audit Activity Stream"
        description="Immutable log of user actions, document extractions, AI risk reviews, and security compliance events."
        badge={<StatusIndicator status="secure" label="Audit Stream Active" />}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4 border-slate-800 bg-[#0b1021]/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">{mockAuditStats.totalEvents}</div>
            <div className="text-xs text-slate-400">Total Audit Events</div>
          </div>
        </div>

        <div className="card-base p-4 border-slate-800 bg-[#0b1021]/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">{mockAuditStats.extractions}</div>
            <div className="text-xs text-slate-400">AI Clause Extractions</div>
          </div>
        </div>

        <div className="card-base p-4 border-slate-800 bg-[#0b1021]/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">{mockAuditStats.dataExports}</div>
            <div className="text-xs text-slate-400">Data Archive Exports</div>
          </div>
        </div>

        <div className="card-base p-4 border-slate-800 bg-[#0b1021]/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 font-mono">SOC 2 Type II</div>
            <div className="text-xs text-slate-400">Immutable SHA-256 Trail</div>
          </div>
        </div>
      </div>

      {/* Audit Stream Main Card */}
      <div className="card-base p-6 border-slate-800 space-y-5 bg-[#0b1021]/90">
        {/* Controls Bar: Search, Category, Status, Refresh, Export CSV */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, user, document, or IP..."
              className="input-base pl-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select-base text-xs py-2 h-auto"
            >
              <option value="all">All Categories</option>
              <option value="ai_analysis">AI Analysis & Extractions</option>
              <option value="data_export">Data Exports & Backup</option>
              <option value="security_auth">Security & Auth</option>
              <option value="governance">System Governance</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-base text-xs py-2 h-auto"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="alert">Security Alert</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="btn btn-secondary btn-sm"
              title="Refresh Audit Stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-primary btn-sm shadow-md"
              title="Download Audit Stream as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Event ID & Time</th>
                <th className="p-3.5">Action & Category</th>
                <th className="p-3.5">Resource / Target</th>
                <th className="p-3.5">User / Principal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    <Activity className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                      >
                        {/* Event ID & Timestamp */}
                        <td className="p-3.5">
                          <div className="font-mono font-semibold text-slate-200">{log.id}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{log.timestamp}</div>
                        </td>

                        {/* Action & Category */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                            {getCategoryIcon(log.category)}
                            <span>{log.action}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 capitalize">{log.category.replace('_', ' ')}</div>
                        </td>

                        {/* Resource */}
                        <td className="p-3.5">
                          <div className="text-slate-200 max-w-xs truncate font-mono text-[11px]">{log.resource}</div>
                        </td>

                        {/* User / Principal */}
                        <td className="p-3.5">
                          <div className="text-slate-200 font-medium">{log.user}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{log.role}</div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5">{getStatusBadge(log.status)}</td>

                        {/* Expand Trigger */}
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan="6" className="p-4 space-y-3">
                            <div className="text-xs text-slate-300 font-sans">
                              <span className="font-bold text-slate-200">Description: </span>
                              {log.details}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono p-3 rounded-lg bg-slate-900 border border-slate-800">
                              <div>
                                <span className="text-slate-500">IP Address: </span>
                                <span className="text-cyan-300">{log.ip}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">User Email: </span>
                                <span className="text-slate-300">{log.email}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Ledger Hash: </span>
                                <span className="text-emerald-400">SHA256-VERIFIED</span>
                              </div>
                            </div>

                            {/* Payload Details */}
                            {log.payload && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                  Event Metadata Payload (JSON)
                                </span>
                                <pre className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
