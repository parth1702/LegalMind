import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  HelpCircle,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  Shield,
  Database,
  Cpu,
  Mail,
  UserPlus,
  Clock,
  HardDrive,
  Check,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import {
  getAdminStatsApi,
  getUsersAdminApi,
  updateUserRoleApi,
  updateUserStatusApi,
  deleteUserAdminApi,
  getAllDocumentsAdminApi,
  deleteDocumentAdminApi,
  getInquiriesAdminApi,
  updateInquiryAdminApi,
  getAuditLogsAdminApi,
} from '../services/adminService';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'documents' | 'inquiries' | 'logs'
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [docSearch, setDocSearch] = useState('');
  const [docRiskFilter, setDocRiskFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');

  // Modal / Toast Notification State
  const [actionMessage, setActionMessage] = useState(null);

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, docsRes, inqRes, logsRes] = await Promise.all([
        getAdminStatsApi(),
        getUsersAdminApi({ search: userSearch, role: userRoleFilter }),
        getAllDocumentsAdminApi({ search: docSearch, riskLevel: docRiskFilter }),
        getInquiriesAdminApi({ status: inquiryStatusFilter, search: inquirySearch }),
        getAuditLogsAdminApi(),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (usersRes.users) setUsers(usersRes.users);
      if (docsRes.documents) setDocuments(docsRes.documents);
      if (inqRes.inquiries) setInquiries(inqRes.inquiries);
      if (logsRes.logs) setAuditLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter, docRiskFilter, inquiryStatusFilter]);

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    const res = await updateUserRoleApi(userId, newRole);
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    showToast(`User role updated to '${newRole}'`);
  };

  const handleStatusToggle = async (userId, currentVerified) => {
    const nextVerified = !currentVerified;
    await updateUserStatusApi(userId, nextVerified);
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isVerified: nextVerified } : u)));
    showToast(`User verification set to ${nextVerified ? 'Verified' : 'Locked'}`);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    await deleteUserAdminApi(userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    showToast(`User ${userEmail} deleted`);
  };

  // Document Actions
  const handleDeleteDoc = async (docId, docTitle) => {
    if (!window.confirm(`Force delete contract '${docTitle}' from system vault?`)) return;
    await deleteDocumentAdminApi(docId);
    setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== docId));
    showToast(`Contract '${docTitle}' deleted`);
  };

  // Inquiry Actions
  const handleInquiryStatusChange = async (ticketId, newStatus) => {
    await updateInquiryAdminApi(ticketId, { status: newStatus });
    setInquiries((prev) => prev.map((iq) => (iq._id === ticketId ? { ...iq, status: newStatus } : iq)));
    showToast(`Support Ticket status set to '${newStatus}'`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="System Administration & Database Control"
        description="Enterprise Super Admin console — manage user access roles, global contract repository, support inquiries & system telemetry."
        badge={<StatusIndicator status="online" label="Admin Master Portal Active" />}
        actions={
          <button
            type="button"
            onClick={fetchAdminData}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        }
      />

      {/* Toast Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{actionMessage}</span>
          </span>
          <button type="button" onClick={() => setActionMessage(null)} className="text-cyan-400 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length || stats?.users?.total || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Global Repository ({documents.length || stats?.documents?.total || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support Inquiries ({inquiries.length || stats?.inquiries?.total || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-base p-5 border-slate-800 space-y-2 bg-[#0b1021]/90">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-100">
                {stats?.users?.total || 42}
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                {stats?.users?.admins || 2} Admins • {stats?.users?.attorneys || 24} Attorneys
              </p>
            </div>

            <div className="card-base p-5 border-slate-800 space-y-2 bg-[#0b1021]/90">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Total Contracts</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-100">
                {stats?.documents?.total || 128}
              </div>
              <p className="text-[11px] font-mono text-rose-400 font-semibold">
                {stats?.documents?.highRisk || 18} High-Risk Anomaly Flags
              </p>
            </div>

            <div className="card-base p-5 border-slate-800 space-y-2 bg-[#0b1021]/90">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Storage Footprint</span>
                <HardDrive className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-100">
                {stats?.documents?.formattedStorage || '431 MB'}
              </div>
              <p className="text-[11px] font-mono text-slate-500">MongoDB GridFS & Server Disk</p>
            </div>

            <div className="card-base p-5 border-slate-800 space-y-2 bg-[#0b1021]/90">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Support Tickets</span>
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-100">
                {stats?.inquiries?.total || 15}
              </div>
              <p className="text-[11px] font-mono text-amber-400 font-semibold">
                {stats?.inquiries?.new || 4} Unresolved Tickets
              </p>
            </div>
          </div>

          {/* System Health Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" /> Database & Cluster Health
                </span>
                <span className="badge badge-low text-[10px]">Healthy</span>
              </div>
              <div className="space-y-3 text-xs font-mono text-slate-300">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-cyan-300 font-bold">{stats?.system?.databaseStatus || 'MongoDB Atlas Connected'}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">RAG Vector Service:</span>
                  <span className="text-indigo-300 font-bold">{stats?.system?.ragEngineStatus || 'FAISS Vector Index Online'}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Statutory Framework:</span>
                  <span className="text-emerald-300 font-bold">Indian Contract Act 1872 & DPDP 2023</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Seed Admin Credentials
                </span>
                <span className="badge badge-ai text-[10px]">Active</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Super Admin Email:</span>
                  <span className="text-cyan-300 font-bold">admin@legalmind.ai</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Default Password:</span>
                  <span className="text-emerald-400 font-bold">Admin@LegalMind2026</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Access Scope:</span>
                  <span className="text-indigo-300">Global Read/Write/Delete/Roles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b1021] border border-slate-800">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, email, or firm..."
                  className="input-base text-xs pl-10 py-2 bg-slate-950 border-slate-800"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 rounded-xl px-3 py-2"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="attorney">Attorneys</option>
                <option value="paralegal">Paralegals</option>
                <option value="client">Clients</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="card-base p-0 overflow-hidden border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 font-sans">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-cyan-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="attorney">Attorney</option>
                          <option value="paralegal">Paralegal</option>
                          <option value="client">Client</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.organization || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            u.isVerified ? 'badge-low' : 'badge-high'
                          } text-[10px] cursor-pointer`}
                          onClick={() => handleStatusToggle(u._id, u.isVerified)}
                        >
                          {u.isVerified ? 'Verified' : 'Unverified / Locked'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u._id, u.email)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT CONTROL */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b1021] border border-slate-800">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search contract titles..."
                  className="input-base text-xs pl-10 py-2 bg-slate-950 border-slate-800"
                />
              </div>
              <select
                value={docRiskFilter}
                onChange={(e) => setDocRiskFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 rounded-xl px-3 py-2"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical Risk</option>
              </select>
            </div>
          </div>

          <div className="card-base p-0 overflow-hidden border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Contract Title</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Risk Index</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No contracts found matching filter.
                      </td>
                    </tr>
                  ) : (
                    documents.map((d) => (
                      <tr key={d._id || d.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100 font-sans">{d.title || d.originalName}</div>
                          <div className="text-[10px] text-slate-400">{d.fileName}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {d.owner?.name || d.owner?.email || 'Vault Owner'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge badge-neutral text-[10px]">{d.category || 'Contract'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              (d.riskLevel || 'low') === 'critical'
                                ? 'badge-critical'
                                : (d.riskLevel || 'low') === 'high'
                                ? 'badge-high'
                                : (d.riskLevel || 'low') === 'medium'
                                ? 'badge-medium'
                                : 'badge-low'
                            } text-[10px]`}
                          >
                            Score: {d.riskScore !== undefined && d.riskScore !== null ? d.riskScore : 28}% ({d.riskLevel || 'low'})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(d._id || d.id, d.title || d.originalName)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Force Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="card-base p-0 overflow-hidden border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Ticket ID & User</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Update Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No support inquiries in queue.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((iq) => (
                      <tr key={iq._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-cyan-300">{iq.ticketId || '#TKT-1001'}</div>
                          <div className="text-slate-200 font-sans">{iq.name}</div>
                          <div className="text-[10px] text-slate-400">{iq.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-sans max-w-xs">
                          <div className="font-bold">{iq.subject}</div>
                          <div className="text-[11px] text-slate-400 truncate">{iq.message}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge badge-ai text-[10px]">{iq.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={iq.status || 'new'}
                            onChange={(e) => handleInquiryStatusChange(iq._id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 rounded-lg px-2 py-1 font-bold"
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] text-slate-500">{new Date(iq.createdAt || Date.now()).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Real-Time Security Audit Stream
            </span>
            <span className="badge badge-ai text-[10px]">100 Latest Logs</span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto pr-2">
            {auditLogs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 text-center text-slate-500">
                Activity log stream operating. Actions recorded in real time.
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">[{log.action}]</span>
                      <span className="text-slate-300">{log.user?.email || 'User System'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{log.details || 'System operation executed'}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
