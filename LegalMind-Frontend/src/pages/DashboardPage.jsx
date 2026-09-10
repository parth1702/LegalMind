import React from 'react';
import { useQuery } from '@tanstack/react-query';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCardsGrid from '../components/dashboard/StatCardsGrid';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import AnalysisTrendsChart from '../components/dashboard/AnalysisTrendsChart';
import RecentDocumentsTable from '../components/dashboard/RecentDocumentsTable';
import ActivityFeedStream from '../components/dashboard/ActivityFeedStream';
import AiAssistantShortcut from '../components/dashboard/AiAssistantShortcut';
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import { useUpload } from '../context/useUpload';
import { getDashboardStatsApi } from '../services/documentService';
import { AlertCircle, RefreshCw, UploadCloud, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { openUploadModal } = useUpload();

  const handleUploadClick = () => {
    openUploadModal();
  };

  // React Query — Fetch live executive dashboard analytics from MongoDB via Backend API
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStatsApi,
    refetchInterval: 30000, // Background refresh every 30 seconds
  });

  // Extract data structures with empty defaults for zero-state handling
  const stats = dashboardData?.stats || {
    totalDocuments: { value: 0, change: '0', trend: 'up', label: 'Total Repository Documents' },
    documentsAnalyzed: { value: 0, percentage: '0%', label: 'Documents Analyzed' },
    highRiskDocuments: { value: 0, critical: 0, high: 0, label: 'High Risk Anomaly Flags' },
    pendingAnalysis: { value: 0, estimatedTime: '0 mins', label: 'Pending Queue' },
  };

  const riskDistribution = dashboardData?.riskDistribution || [
    { name: 'Low Risk', value: 0, color: '#10b981', label: 'Compliant & Standard', icon: 'CheckCircle2' },
    { name: 'Medium Risk', value: 0, color: '#f59e0b', label: 'Playbook Deviations', icon: 'AlertCircle' },
    { name: 'High Risk', value: 0, color: '#f43f5e', label: 'Uncapped Liability', icon: 'AlertTriangle' },
    { name: 'Critical Risk', value: 0, color: '#dc2626', label: 'Severe Breach Risk', icon: 'ShieldAlert' },
  ];

  const analysisTrends = dashboardData?.analysisTrends || [];
  const recentDocuments = dashboardData?.recentDocuments || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const totalDocsCount = stats.totalDocuments.value;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Command Center"
        description="Real-time legal document intelligence, risk anomaly distribution, and AI analysis velocity."
        badge={
          <StatusIndicator
            status={isError ? 'offline' : isLoading ? 'connecting' : 'online'}
            label={isError ? 'Database Disconnected' : isLoading ? 'Syncing...' : 'Console Live'}
          />
        }
      />

      {/* 1. LOADING STATE (SKELETON) */}
      {isLoading ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="skeleton h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
          <div className="skeleton h-56 rounded-xl" />
        </div>
      ) : isError ? (
        /* 2. ERROR STATE */
        <div className="card-base p-8 text-center space-y-4 border-rose-500/30 bg-rose-950/10">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-100">Failed to Load Live Dashboard Analytics</h3>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              {error?.response?.data?.message || error?.message || 'Unable to connect to LegalMind Backend MongoDB server.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn btn-secondary btn-sm mx-auto flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Reconnecting...' : 'Retry Connection'}</span>
          </button>
        </div>
      ) : (
        /* 3. PRIMARY POPULATED / NO DATA DASHBOARD */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Welcome Banner */}
          <WelcomeBanner
            onUploadClick={handleUploadClick}
            totalCount={stats.totalDocuments.value}
            analyzedCount={stats.documentsAnalyzed.value}
            highRiskCount={stats.highRiskDocuments.value}
          />

          {/* Quick Actions Bar */}
          <DashboardQuickActions onUploadClick={handleUploadClick} />

          {/* Statistics Grid */}
          <StatCardsGrid stats={stats} />

          {/* Charts Row: Risk Distribution & Analysis Velocity Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskDistributionChart data={riskDistribution} />
            <AnalysisTrendsChart data={analysisTrends} />
          </div>

          {/* AI Assistant Shortcut Bar */}
          <AiAssistantShortcut />

          {/* Recent Documents Table & Activity Stream */}
          {totalDocsCount > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <RecentDocumentsTable documents={recentDocuments} />
              </div>
              <div className="lg:col-span-4">
                <ActivityFeedStream activities={recentActivity} />
              </div>
            </div>
          ) : (
            /* NO DATA STATE (EMPTY VAULT) */
            <div className="card-base p-8 text-center py-12 space-y-4 border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-100">No Documents Uploaded Yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your legal repository is empty in MongoDB. Upload your first commercial contract or NDA to begin automated AI clause extraction and risk analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUploadClick}
                className="btn btn-primary btn-sm mx-auto shadow-lg shadow-cyan-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload First Document</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


