/**
 * LegalMind AI Analysis Dataset
 * Cleanly separated mock AI document analysis dataset containing complete contract insights.
 */

export const mockAiAnalysisReport = {
  documentId: 'doc-in-101',
  documentName: 'Enterprise_Services_Agreement_India_2026.pdf',
  documentType: 'Commercial Master Services Agreement',
  analyzedAt: '2026-08-04T10:45:00Z',
  modelVersion: 'LegalMind Core Engine (Indian Jurisprudential Architecture)',
  overallRiskScore: 32,
  overallRiskLevel: 'medium', // 'low' | 'medium' | 'high' | 'critical'

  // Executive Summary
  executiveSummary: {
    overview:
      'This Master Services Agreement governs commercial enterprise services between Tata Consultancy & Solutions Pvt. Ltd. (Customer) and Indian LegalTech Systems Pvt. Ltd. (Vendor) evaluated under the Indian Contract Act 1872, Information Technology Act 2000, and Digital Personal Data Protection (DPDP) Act 2023. The agreement carries a 3-year term valued at ₹35,00,000 INR annually with arbitration seated in New Delhi under the Arbitration and Conciliation Act 1996.',
    keyTakeaways: [
      'Section 27 Indian Contract Act 1872: Restraint of trade & non-compete enforceability verified.',
      'Digital Personal Data Protection (DPDP) Act 2023: Data Principal rights and processing consent active.',
      'Arbitration & Conciliation Act 1996: Fast-track sole arbitrator seat established in New Delhi.',
      'Section 73/74 Liquidated Damages: Damage liability capped to annual contract value in INR (₹).',
    ],
  },

  // Key Findings
  keyFindings: [
    {
      category: 'Statutory Compliance',
      finding: 'DPDP Act 2023 Data Principal notice and consent processing provisions compliant.',
      severity: 'low',
    },
    {
      category: 'Restraint of Trade',
      finding: 'Section 27 Indian Contract Act compliance verified for post-termination restrictions.',
      severity: 'medium',
    },
    {
      category: 'Financial Exposure',
      finding: 'Liability cap aligned with Section 73/74 liquidated damage principles in INR (₹).',
      severity: 'low',
    },
    {
      category: 'Jurisdiction',
      finding: 'Arbitration seat in New Delhi subject to High Court of Delhi jurisdiction.',
      severity: 'low',
    },
  ],

  // Contracting Parties
  parties: [
    {
      role: 'Customer',
      name: 'Tata Consultancy & Solutions Pvt. Ltd.',
      jurisdiction: 'New Delhi, India',
      signatory: 'Rajesh Kumar, Senior General Counsel',
    },
    {
      role: 'Vendor',
      name: 'Indian LegalTech Systems Pvt. Ltd.',
      jurisdiction: 'Mumbai, Maharashtra, India',
      signatory: 'Vikram Sharma, Managing Director',
    },
  ],

  // Extracted Named Entities
  entities: [
    { label: 'Contracting Party A', value: 'Tata Consultancy & Solutions Pvt. Ltd.', category: 'Organization' },
    { label: 'Contracting Party B', value: 'Indian LegalTech Systems Pvt. Ltd.', category: 'Organization' },
    { label: 'Annual Contract Value', value: '₹35,00,000 INR', category: 'Financial' },
    { label: 'Payment Terms', value: 'Net 30 Days (GST Invoice Compliant)', category: 'Financial' },
    { label: 'Initial Agreement Term', value: '36 Months (3 Years)', category: 'Duration' },
    { label: 'Governing Statutory Law', value: 'Indian Contract Act 1872 & IT Act 2000', category: 'Jurisdiction' },
    { label: 'Arbitration Seat', value: 'New Delhi (Arbitration & Conciliation Act 1996)', category: 'Legal' },
    { label: 'High Court Jurisdiction', value: 'High Court of Delhi', category: 'Judicial Venue' },
  ],

  // Obligations Matrix
  obligations: {
    customer: [
      'Pay all undisputed GST-compliant invoices within Net 30 days of receipt.',
      'Maintain confidentiality of Vendor technical architectures per Section 72A IT Act 2000.',
      'Provide written notice of non-renewal 30 days prior to term expiration.',
      'Ensure Data Principal consent compliance under DPDP Act 2023.',
    ],
    vendor: [
      'Maintain 99.9% cloud uptime SLA and report Cert-In cybersecurity incidents within 6 hours.',
      'Indemnify Customer under Section 124 of Indian Contract Act 1872 for IP infringement.',
      'Maintain data localization and encryption within Indian cloud availability regions.',
      'Fulfill warranty and technical support obligations in India.',
    ],
  },

  // Potential Concerns
  potentialConcerns: [
    {
      id: 'concern-1',
      title: 'Uncapped Liability Exposure',
      section: 'Section 14.2',
      riskLevel: 'high',
      description: 'Section 14.2 explicitly waives liability caps for third-party indemnification claims.',
      impact: 'Exposes Acme Corporation to unlimited financial damages in third-party disputes.',
    },
    {
      id: 'concern-2',
      title: 'Loss of Custom Code Rights',
      section: 'Section 11.3',
      riskLevel: 'critical',
      description: 'Customer assigns all rights and ownership over custom enhancements back to Vendor.',
      impact: 'Acme Corporation cannot reuse or license custom integrations built during engagement.',
    },
    {
      id: 'concern-3',
      title: 'Restrictive Non-Renewal Deadline',
      section: 'Section 9.2',
      riskLevel: 'medium',
      description: 'Requires 60-day written notice prior to term end to stop automatic 12-month extension.',
      impact: 'Risk of unintended $450,000 financial renewal if calendar deadline is missed.',
    },
  ],

  // Important Clauses
  importantClauses: [
    {
      id: 'clause-1',
      section: 'Section 14.2',
      title: 'Limitation of Liability & Indemnity',
      riskLevel: 'high',
      riskScore: 85,
      text: "Neither party's liability under this Agreement shall be subject to any financial cap or limitation for consequential, indirect, or punitive damages arising from indemnification obligations set forth in Section 14.1.",
      aiInsight: 'Uncapped indemnity violates standard corporate playbook baseline.',
      fallbackLanguage: "In no event shall either party's aggregate liability under Section 14 exceed the total fees paid by Customer during the twelve (12) month period immediately preceding the claim.",
    },
    {
      id: 'clause-2',
      section: 'Section 11.3',
      title: 'IP Rights & Feedback Assignment',
      riskLevel: 'critical',
      riskScore: 92,
      text: 'Customer hereby irrevocably assigns to Vendor all rights, title, and interest in and to any suggestions, enhancement requests, or custom code modifications developed during the provision of Services.',
      aiInsight: 'Absolute code assignment creates loss of internal software IP.',
      fallbackLanguage: 'Customer retains exclusive ownership over Customer Data and proprietary custom workflow specifications.',
    },
    {
      id: 'clause-3',
      section: 'Section 9.2',
      title: 'Term & Automatic Renewal',
      riskLevel: 'medium',
      riskScore: 55,
      text: 'This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least sixty (60) days prior to expiration.',
      aiInsight: 'Requires strict calendar tracking prior to August 1, 2029.',
      fallbackLanguage: 'Notice of non-renewal may be provided up to thirty (30) days prior to term expiration.',
    },
    {
      id: 'clause-4',
      section: 'Section 18.1',
      title: 'Governing Law & Jurisdiction',
      riskLevel: 'low',
      riskScore: 15,
      text: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.',
      aiInsight: 'Standard Delaware governing law provision. Acceptable.',
      fallbackLanguage: null,
    },
  ],

  // Important Milestone Dates
  importantDates: [
    { event: 'Effective Date', date: 'October 1, 2026', type: 'Milestone', isUrgent: false },
    { event: 'Auto-Renewal Notice Deadline', date: 'August 1, 2029', type: 'Deadline', isUrgent: true },
    { event: 'Initial Term Expiration', date: 'September 30, 2029', type: 'Expiration', isUrgent: false },
    { event: 'Annual SLA Audit Review', date: 'October 1, 2027', type: 'Audit', isUrgent: false },
  ],

  // Recommendations & Negotiation Playbook
  recommendations: [
    {
      priority: '1',
      action: 'Cap Indemnity Liability',
      description: 'Negotiate Section 14.2 to insert a 12-month fees paid cap ($450,000 maximum liability).',
    },
    {
      priority: '2',
      action: 'Strike Code Assignment Clause',
      description: 'Delete Section 11.3 to preserve Acme Corporation ownership over custom workflow scripts.',
    },
    {
      priority: '3',
      action: 'Shorten Non-Renewal Notice',
      description: 'Request 30-day non-renewal notice period instead of 60 days in Section 9.2.',
    },
  ],
};
