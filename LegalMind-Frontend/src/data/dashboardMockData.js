/**
 * LegalMind AI Dashboard Mock Data
 * Cleanly separated mock dataset representing executive legal intelligence statistics.
 */

export const mockStats = {
  totalDocuments: {
    value: 148,
    change: '+12%',
    trend: 'up',
    label: 'Total Repository Documents',
  },
  documentsAnalyzed: {
    value: 142,
    percentage: '96%',
    label: 'Documents Analyzed',
  },
  highRiskDocuments: {
    value: 7,
    critical: 2,
    high: 5,
    label: 'High Risk Anomaly Flags',
  },
  pendingAnalysis: {
    value: 6,
    estimatedTime: '~4 mins',
    label: 'Pending Queue',
  },
};

export const mockRiskDistribution = [
  { name: 'Low Risk', value: 84, color: '#10b981', label: 'Compliant & Standard', icon: 'CheckCircle2' },
  { name: 'Medium Risk', value: 38, color: '#f59e0b', label: 'Playbook Deviations', icon: 'AlertCircle' },
  { name: 'High Risk', value: 15, color: '#f43f5e', label: 'Uncapped Liability', icon: 'AlertTriangle' },
  { name: 'Critical Risk', value: 5, color: '#dc2626', label: 'Severe Breach Risk', icon: 'ShieldAlert' },
];

export const mockAnalysisTrends = [
  { month: 'Jan', analyzed: 18, highRisk: 2 },
  { month: 'Feb', analyzed: 24, highRisk: 1 },
  { month: 'Mar', analyzed: 32, highRisk: 4 },
  { month: 'Apr', analyzed: 28, highRisk: 2 },
  { month: 'May', analyzed: 40, highRisk: 5 },
  { month: 'Jun', analyzed: 48, highRisk: 3 },
  { month: 'Jul', analyzed: 56, highRisk: 4 },
];

export const mockRecentDocuments = [
  {
    id: 'doc-001',
    name: 'Commercial_Software_MSA_2026.pdf',
    type: 'Master Services Agreement',
    size: '2.4 MB',
    date: '2026-08-03',
    status: 'Analyzed',
    riskLevel: 'high',
    riskScore: 78,
    flaggedClauses: 3,
  },
  {
    id: 'doc-002',
    name: 'Enterprise_Vendor_NDA_v4.pdf',
    type: 'Non-Disclosure Agreement',
    size: '1.1 MB',
    date: '2026-08-02',
    status: 'Analyzed',
    riskLevel: 'low',
    riskScore: 12,
    flaggedClauses: 0,
  },
  {
    id: 'doc-003',
    name: 'Cloud_SaaS_SLA_Appendix.pdf',
    type: 'Service Level Agreement',
    size: '3.8 MB',
    date: '2026-08-01',
    status: 'Analyzed',
    riskLevel: 'medium',
    riskScore: 45,
    flaggedClauses: 2,
  },
  {
    id: 'doc-004',
    name: 'Executive_Employment_Contract.pdf',
    type: 'Employment Agreement',
    size: '1.9 MB',
    date: '2026-07-31',
    status: 'Analyzed',
    riskLevel: 'critical',
    riskScore: 92,
    flaggedClauses: 4,
  },
  {
    id: 'doc-005',
    name: 'IP_Licensing_Addendum_2026.docx',
    type: 'IP Licensing',
    size: '890 KB',
    date: '2026-07-30',
    status: 'Processing',
    riskLevel: 'medium',
    riskScore: 50,
    flaggedClauses: 1,
  },
];

export const mockRecentActivity = [
  {
    id: 'act-001',
    type: 'risk_flag',
    title: 'High Risk Indemnity Flagged',
    description: 'Uncapped liability clause detected in Commercial_Software_MSA_2026.pdf (Section 14.2).',
    timestamp: '14 minutes ago',
    severity: 'high',
  },
  {
    id: 'act-002',
    type: 'extraction',
    title: 'Clause Extraction Completed',
    description: 'Extracted 18 clauses from Enterprise_Vendor_NDA_v4.pdf with 99.2% model confidence.',
    timestamp: '2 hours ago',
    severity: 'low',
  },
  {
    id: 'act-003',
    type: 'ai_query',
    title: 'AI Co-Pilot Query Executed',
    description: 'Counsel queried "What are the SLA penalty triggers in Cloud_SaaS_SLA_Appendix.pdf?"',
    timestamp: '4 hours ago',
    severity: 'neutral',
  },
  {
    id: 'act-004',
    type: 'audit',
    title: 'SOC 2 Security Audit Logged',
    description: 'Automated tenant vector isolation scan completed with zero permission anomalies.',
    timestamp: '1 day ago',
    severity: 'secure',
  },
];
