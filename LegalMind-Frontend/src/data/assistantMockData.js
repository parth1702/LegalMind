/**
 * LegalMind AI Assistant Mock Dataset
 * Contains conversations history, pre-populated messages, and intelligent mock AI responses
 * with rich RAG source citations (document name, page number, section, snippet).
 */

export const mockConversations = [
  {
    id: 'conv-1',
    title: 'Commercial MSA Risk Audit',
    activeDocument: 'Commercial_Software_MSA_2026.pdf',
    updatedAt: '10 minutes ago',
    messageCount: 4,
  },
  {
    id: 'conv-2',
    title: 'NDA Confidentiality & Term Review',
    activeDocument: 'Enterprise_Vendor_NDA_v4.pdf',
    updatedAt: '2 hours ago',
    messageCount: 2,
  },
  {
    id: 'conv-3',
    title: 'SLA Uptime Penalty Calculations',
    activeDocument: 'Cloud_SaaS_SLA_Appendix.pdf',
    updatedAt: 'Yesterday',
    messageCount: 6,
  },
  {
    id: 'conv-4',
    title: 'Executive Employment IP Assignment',
    activeDocument: 'Executive_Employment_Contract.pdf',
    updatedAt: '3 days ago',
    messageCount: 3,
  },
];

export const mockSuggestedQuestions = [
  'Summarize this agreement.',
  'What are the highest-risk clauses?',
  'What obligations does the tenant have?',
  'Find important deadlines.',
  'Explain Section 14.2 in simple language.',
];

export const mockInitialMessages = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'What are the highest-risk clauses in Commercial_Software_MSA_2026.pdf?',
    timestamp: '10:30 AM',
  },
  {
    id: 'msg-2',
    sender: 'ai',
    text: `Based on the automated risk audit of **Commercial_Software_MSA_2026.pdf**, I have identified two primary high-risk anomalies:

1. **Uncapped Liability Indemnity (Section 14.2)**: This clause explicitly waives financial liability caps for third-party indemnification claims, exposing your organization to unlimited financial exposure.
2. **Absolute Code Assignment (Section 11.3)**: Transfers ownership of custom code enhancements created during the engagement back to the Vendor.

I recommend negotiating Section 14.2 to insert a **12-month fee cap ($450,000)** and striking Section 11.3 to preserve custom code ownership.`,
    timestamp: '10:30 AM',
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 8,
        section: 'Section 14.2 — Limitation of Liability',
        snippet: "Neither party's liability under this Agreement shall be subject to any financial cap or limitation for consequential damages arising from indemnification obligations...",
        confidence: '99.2%',
      },
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 7,
        section: 'Section 11.3 — Code Assignment',
        snippet: 'Customer hereby irrevocably assigns to Vendor all rights, title, and interest in and to any custom code modifications...',
        confidence: '98.5%',
      },
    ],
  },
];

export const mockAiResponsesMap = {
  'summarize this agreement.': {
    text: `### Executive Summary: Commercial_Software_MSA_2026.pdf

This **Master Services Agreement** is between **Acme Corporation** (Customer) and **Nexus Legal Systems Inc.** (Vendor) for cloud-based software services.

- **Contract Value**: $450,000 / year ($1,350,000 total 3-year term)
- **Effective Date**: October 1, 2026
- **Term**: 36 months initial duration with automatic 12-month renewals
- **Governing Law**: State of Delaware (JAMS Arbitration in Wilmington, DE)
- **Overall Risk Index**: **78% High Risk** due to Section 14.2 uncapped indemnity obligations.`,
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 1,
        section: 'Preamble & Section 1.1',
        snippet: 'THIS MASTER SERVICES AGREEMENT is entered into as of October 1, 2026, by and between Nexus Legal Systems Inc. and Acme Corporation...',
        confidence: '99.8%',
      },
    ],
  },

  'what are the highest-risk clauses?': {
    text: `The highest-risk clauses flagged in this contract are:

1. **Section 14.2 (Limitation of Liability)** — *High Risk (Score: 85%)*: Explicitly waives liability caps for indemnification, creating uncapped exposure.
2. **Section 11.3 (IP Code Ownership)** — *Critical Risk (Score: 92%)*: Forces Customer to assign all custom integration code rights back to Vendor.
3. **Section 9.2 (Automatic Renewal)** — *Medium Risk (Score: 55%)*: Enforces a strict 60-day advance notice window prior to term expiry.`,
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 8,
        section: 'Section 14.2',
        snippet: "Neither party's liability under this Agreement shall be subject to any financial cap...",
        confidence: '99.4%',
      },
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 7,
        section: 'Section 11.3',
        snippet: 'Customer hereby irrevocably assigns to Vendor all rights, title, and interest...',
        confidence: '98.9%',
      },
    ],
  },

  'what obligations does the tenant have?': {
    text: `Under this agreement, the Customer's (Tenant's) primary obligations are:

1. **Payment**: Remit undisputed fee invoices within Net 30 days of invoice date (Section 4.1).
2. **Confidentiality**: Safeguard Vendor's proprietary platform architectures and benchmarks (Section 8.2).
3. **Non-Renewal Notice**: Deliver written notice of non-renewal at least 60 days prior to term expiry (Section 9.2).
4. **Authorized Access**: Ensure all staff and legal counsel comply with Acceptable Use terms (Section 2.3).`,
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 4,
        section: 'Section 4.1 & Section 8.2',
        snippet: 'Customer shall pay all fees within Net 30 days... Customer agrees to maintain strict confidentiality of Vendor software architecture...',
        confidence: '97.6%',
      },
    ],
  },

  'find important deadlines.': {
    text: `Here are the critical milestone deadlines identified in **Commercial_Software_MSA_2026.pdf**:

- **Contract Effective Date**: October 1, 2026
- **Annual SLA Audit Review**: October 1, 2027
- **Auto-Renewal Notice Deadline**: **August 1, 2029** *(URGENT: Must provide written notice 60 days prior to expiry to prevent automatic 12-month extension)*
- **Initial Term Expiration**: September 30, 2029`,
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 5,
        section: 'Section 9.1 & Section 9.2',
        snippet: 'This Agreement shall automatically renew for successive twelve (12) month terms unless notice is given 60 days prior to expiration...',
        confidence: '99.5%',
      },
    ],
  },

  'explain section 14.2 in simple language.': {
    text: `### Plain Language Explanation: Section 14.2

**Legal Wording**: *"Neither party's liability under this Agreement shall be subject to any financial cap or limitation..."*

**Simple Explanation**:
If a third party sues the Vendor for patent infringement or data breach related to this software, and the Vendor seeks indemnity from you, **there is no financial cap on how much money you might have to pay**.

Normally, contracts limit liability to the total fees you paid over the past 12 months (e.g. $450,000). Section 14.2 removes that safety net, meaning your financial risk is **unlimited**.

**Recommended Fix**: Ask to insert a clause limiting total indemnity liability to 12 months of actual fees paid under the contract.`,
    sources: [
      {
        documentName: 'Commercial_Software_MSA_2026.pdf',
        pageNumber: 8,
        section: 'Section 14.2 — Limitation of Liability',
        snippet: "Neither party's liability under this Agreement shall be subject to any financial cap or limitation...",
        confidence: '99.9%',
      },
    ],
  },
};
