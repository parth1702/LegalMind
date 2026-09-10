/**
 * LegalMind AI Analysis Workspace Mock Dataset
 * Contains realistic commercial agreement clauses, risk flags, entity extractions,
 * important milestone dates, and AI recommendations.
 */

export const mockAnalysisDocument = {
  id: 'doc-101',
  title: 'Commercial_Software_MSA_2026.pdf',
  documentType: 'Master Services Agreement',
  totalPages: 14,
  uploadDate: '2026-08-03',
  fileSize: '2.4 MB',
  overallRiskScore: 78,
  overallRiskLevel: 'high',
  modelConfidence: '99.1%',

  // Executive Summary
  summary: {
    overview: 'Enterprise cloud software master services agreement between Acme Corporation (Customer) and Nexus Legal Systems Inc. (Vendor). Total contract value estimated at $450,000 annually over a 3-year term.',
    keyPoints: [
      '3-year initial term with automatic 12-month renewal unless 60-day advance notice is given.',
      'Uncapped liability indemnity in Section 14.2 for third-party claims.',
      'Delaware State governing law with binding arbitration in Wilmington, DE.',
    ],
  },

  // Named Entities Extracted
  entities: [
    { label: 'Primary Customer', value: 'Acme Corporation', type: 'Party' },
    { label: 'Software Vendor', value: 'Nexus Legal Systems Inc.', type: 'Party' },
    { label: 'Contract Value', value: '$450,000 / Year', type: 'Financial' },
    { label: 'Initial Term', value: '36 Months (3 Years)', type: 'Duration' },
    { label: 'Governing Law', value: 'Delaware, USA', type: 'Jurisdiction' },
    { label: 'Payment Terms', value: 'Net 30 Days', type: 'Financial' },
  ],

  // Important Dates & Deadlines
  importantDates: [
    { title: 'Contract Effective Date', date: 'October 1, 2026', type: 'Milestone', isUrgent: false },
    { title: 'Auto-Renewal Notice Deadline', date: 'August 1, 2029', type: 'Deadline', isUrgent: true },
    { title: 'Initial Term Expiration', date: 'September 30, 2029', type: 'Expiration', isUrgent: false },
    { title: 'Annual SLA Review Audit', date: 'October 1, 2027', type: 'Audit', isUrgent: false },
  ],

  // Risk Breakdown
  riskBreakdown: {
    critical: 1,
    high: 2,
    medium: 3,
    low: 8,
  },

  // Flagged Clauses & Highlights
  clauses: [
    {
      id: 'clause-1',
      section: 'Section 14.2',
      title: 'Limitation of Liability & Indemnity',
      riskLevel: 'high',
      riskScore: 85,
      pageNumber: 8,
      text: "Neither party's liability under this Agreement shall be subject to any financial cap or limitation for consequential, indirect, or punitive damages arising from indemnification obligations set forth in Section 14.1.",
      aiAnalysis: 'Uncapped liability clause exposes Customer to unlimited financial indemnification. Standard SaaS agreements cap total liability to 12 months of fees paid.',
      recommendation: 'Insert cap limiting indemnity liability to 12 months of actual fees paid under Section 14.3.',
      suggestedFallback: "In no event shall either party's aggregate liability under Section 14 exceed the total fees paid by Customer during the twelve (12) month period immediately preceding the event giving rise to the claim.",
    },
    {
      id: 'clause-2',
      section: 'Section 9.1',
      title: 'Term & Automatic Renewal',
      riskLevel: 'medium',
      riskScore: 55,
      pageNumber: 5,
      text: 'This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term.',
      aiAnalysis: 'Auto-renewal clause requires strict 60-day calendar tracking to prevent automatic financial lock-in for an additional year.',
      recommendation: 'Set automated calendar reminder 90 days prior to expiry date (August 1, 2029).',
      suggestedFallback: 'Notice of non-renewal may be provided up to thirty (30) days prior to term expiration.',
    },
    {
      id: 'clause-3',
      section: 'Section 18.1',
      title: 'Governing Law & Jurisdiction',
      riskLevel: 'low',
      riskScore: 15,
      pageNumber: 12,
      text: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to any principles of conflicts of law.',
      aiAnalysis: 'Standard, neutral Delaware governing law provision. Low risk.',
      recommendation: 'Accept clause as written.',
      suggestedFallback: null,
    },
    {
      id: 'clause-4',
      section: 'Section 11.3',
      title: 'IP Rights & Feedback Assignment',
      riskLevel: 'critical',
      riskScore: 92,
      pageNumber: 7,
      text: 'Customer hereby irrevocably assigns to Vendor all rights, title, and interest in and to any suggestions, enhancement requests, or custom code modifications developed during the provision of Services.',
      aiAnalysis: 'Broad assignment clause transfers ownership of custom modifications created for Customer back to Vendor.',
      recommendation: 'Reject absolute assignment of custom code. Retain Customer ownership over proprietary workflows.',
      suggestedFallback: 'Customer retains exclusive ownership over Customer Data and proprietary custom workflow specifications.',
    },
  ],

  // Document Outline Table of Contents
  outline: [
    { page: 1, title: '1. Definitions & Interpretation' },
    { page: 3, title: '2. Provision of Cloud Services & SLAs' },
    { page: 5, title: '9. Term, Renewal & Termination' },
    { page: 7, title: '11. Intellectual Property & Code Ownership' },
    { page: 8, title: '14. Indemnification & Liability Caps' },
    { page: 12, title: '18. Governing Law & Dispute Resolution' },
  ],

  // Mock Document Page Pages Content
  pagesContent: [
    {
      page: 1,
      heading: 'MASTER SERVICES AGREEMENT',
      body: `THIS MASTER SERVICES AGREEMENT (the "Agreement") is entered into as of October 1, 2026 (the "Effective Date"), by and between Nexus Legal Systems Inc., a Delaware corporation ("Vendor"), and Acme Corporation, a Delaware corporation ("Customer").

WHEREAS, Vendor provides cloud-based legal intelligence software and automated document processing services; and WHEREAS, Customer desires to subscribe to and utilize Vendor's software services subject to the terms and conditions set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:

1. DEFINITIONS AND INTERPRETATION
1.1 "Authorized User" means any employee, contractor, or designated legal counsel authorized by Customer to access the Services.
1.2 "Customer Data" means all proprietary documents, contracts, text, metadata, and files uploaded to the Services by Customer.`,
    },
    {
      page: 5,
      heading: '9. TERM, RENEWAL AND TERMINATION',
      body: `9.1 Initial Term. This Agreement shall commence on the Effective Date and remain in effect for an initial term of thirty-six (36) months (the "Initial Term").

9.2 Automatic Renewal. [CLAUSE-2: MEDIUM RISK] This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term.

9.3 Termination for Cause. Either party may terminate this Agreement upon thirty (30) days written notice if the other party materially breaches any provision and fails to cure such breach within the notice period.`,
    },
    {
      page: 7,
      heading: '11. INTELLECTUAL PROPERTY & OWNERSHIP',
      body: `11.1 Vendor IP. Vendor retains exclusive ownership of all software code, AI algorithms, neural models, and platform architectures.

11.2 Customer Data. Customer retains ownership of all Customer Data uploaded to the platform.

11.3 Code Assignment. [CLAUSE-4: CRITICAL RISK] Customer hereby irrevocably assigns to Vendor all rights, title, and interest in and to any suggestions, enhancement requests, or custom code modifications developed during the provision of Services.`,
    },
    {
      page: 8,
      heading: '14. INDEMNIFICATION & LIABILITY CAPS',
      body: `14.1 Vendor Indemnity. Vendor shall defend Customer against third-party claims alleging that the core Service infringes any valid U.S. patent or copyright.

14.2 Limitation of Liability. [CLAUSE-1: HIGH RISK] Neither party's liability under this Agreement shall be subject to any financial cap or limitation for consequential, indirect, or punitive damages arising from indemnification obligations set forth in Section 14.1.

14.3 Consequential Damages Waiver. Except for indemnification obligations or breach of confidentiality, neither party shall be liable for indirect or incidental damages.`,
    },
    {
      page: 12,
      heading: '18. GOVERNING LAW & JURISDICTION',
      body: `18.1 Delaware Law. [CLAUSE-3: LOW RISK] This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to any principles of conflicts of law.

18.2 Arbitration. Any dispute arising out of or relating to this Agreement shall be finally settled by binding arbitration administered by JAMS in Wilmington, Delaware.`,
    },
  ],
};
