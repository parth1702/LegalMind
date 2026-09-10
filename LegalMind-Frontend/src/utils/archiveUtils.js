/**
 * Direct File Download Utility for LegalMind AI (PDF, CSV, Word, JSON)
 * All exports trigger immediate, direct file downloads to the user's PC without print dialogs.
 */

// 1. Direct PDF File Download (No Print Popup)
export const downloadAsPdf = () => {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Count 1
  /Kids [3 0 R]
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 4 0 R
    >>
  >>
  /Contents 5 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<< /Length 480 >>
stream
BT
/F1 16 Tf
50 740 Td
(LEGALMIND AI - EXECUTIVE COMPLIANCE REPORT) Tj
/F1 11 Tf
0 -30 Td
(Organization: Acme Legal Corporation) Tj
0 -18 Td
(Date Generated: ${new Date().toLocaleDateString()}) Tj
0 -18 Td
(Security Status: SOC 2 Type II Verified) Tj
0 -28 Td
(1. EXECUTIVE SUMMARY & REPOSITORY METRICS) Tj
0 -18 Td
(- Total Repository Contracts: 148 Active Agreements) Tj
0 -18 Td
(- High Risk Anomaly Flags: 12 Clauses Requiring Counsel Review) Tj
0 -18 Td
(- AI Clause Extraction Accuracy: 99.2% Model Confidence) Tj
0 -28 Td
(2. HIGH RISK CLAUSE AUDIT) Tj
0 -18 Td
(- Section 14.2 MSA: Uncapped Indemnification & Unlimited Liability Cap) Tj
0 -18 Td
(- Section 8.1 NDA: Non-Standard 5-Year Term of Confidentiality) Tj
0 -35 Td
(Confidential Document - Downloaded directly from LegalMind AI Console) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
855
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `LegalMind-Executive-Risk-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 2. Direct CSV File Download
export const downloadAsCsv = () => {
  const csvRows = [
    ['Document ID', 'Contract Title', 'Category', 'Risk Level', 'Risk Score', 'Flagged Clauses', 'Upload Date', 'Status'],
    ['DOC-2026-001', 'Master Service Agreement - Cloud Vendor.pdf', 'Vendor Agreement', 'High Risk', '78', '3', '2026-08-03', 'Analyzed'],
    ['DOC-2026-002', 'Enterprise Vendor NDA v4.pdf', 'NDA', 'Low Risk', '12', '0', '2026-08-02', 'Analyzed'],
    ['DOC-2026-003', 'Cloud SaaS SLA Appendix.pdf', 'Service Level Agreement', 'Medium Risk', '45', '2', '2026-08-01', 'Analyzed'],
    ['DOC-2026-004', 'Executive Employment Contract.pdf', 'Employment Agreement', 'Critical Risk', '92', '4', '2026-07-31', 'Analyzed'],
    ['DOC-2026-005', 'IP Licensing Addendum 2026.docx', 'IP Licensing', 'Medium Risk', '50', '1', '2026-07-30', 'Processing'],
  ];

  const csvContent = csvRows.map((row) => row.map((val) => `"${val}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `LegalMind-Executive-Risk-Summary-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 3. Direct Word (.docx) File Download
export const downloadAsWord = () => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>LegalMind Enterprise Report</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; padding: 20px; line-height: 1.5; color: #0f172a; }
          h1 { color: #0891b2; font-size: 20pt; border-bottom: 2pt solid #0891b2; padding-bottom: 5pt; }
          h2 { color: #1e293b; font-size: 14pt; margin-top: 15pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
          th, td { border: 1pt solid #cbd5e1; padding: 8pt; text-align: left; font-size: 10pt; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
          .high { color: #e11d48; font-weight: bold; }
          .medium { color: #b45309; font-weight: bold; }
          .low { color: #047857; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>LegalMind AI — Executive Risk & Compliance Report</h1>
        <p><strong>Organization:</strong> Acme Legal Corporation<br/>
        <strong>Export Date:</strong> ${new Date().toLocaleDateString()}<br/>
        <strong>Document Vault Ref:</strong> LGM-WORD-2026-REPORT</p>

        <h2>1. Executive Summary & Compliance Overview</h2>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Document Vault Size</td><td>148 Active Contracts</td></tr>
          <tr><td>High Risk Flags</td><td>12 Items Flagged for Review</td></tr>
          <tr><td>Compliance Status</td><td>SOC 2 Type II & GDPR Verified</td></tr>
        </table>

        <h2>2. Detailed Contract Risk Inventory</h2>
        <table>
          <tr>
            <th>Document ID</th>
            <th>Contract Title</th>
            <th>Category</th>
            <th>Risk Level</th>
          </tr>
          <tr>
            <td>DOC-2026-001</td>
            <td>Master Service Agreement - Cloud Vendor.pdf</td>
            <td>Vendor Agreement</td>
            <td class="high">High Risk (78/100)</td>
          </tr>
          <tr>
            <td>DOC-2026-002</td>
            <td>Enterprise Vendor NDA v4.pdf</td>
            <td>NDA</td>
            <td class="low">Low Risk (12/100)</td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `LegalMind-Executive-Risk-Report-${new Date().toISOString().slice(0, 10)}.docx`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 4. Direct JSON Archive Download
export const triggerDataArchiveDownload = () => {
  const archiveData = {
    enterprise: 'Acme Legal Corporation',
    exportedAt: new Date().toISOString(),
    version: '1.0.0-PROD',
    securityChecksum: 'sha256-a8f3b219e4c8990f12',
    summary: {
      totalContracts: 148,
      highRiskClauses: 12,
      auditRecords: 342,
      retentionPolicy: 'SOC2-Compliant'
    },
    documents: [
      {
        id: 'DOC-2026-001',
        title: 'Master Service Agreement - Cloud Vendor.pdf',
        category: 'Vendor Agreement',
        riskLevel: 'medium',
        score: 72,
        uploadedAt: '2026-07-15T10:30:00Z'
      }
    ]
  };

  const jsonStr = JSON.stringify(archiveData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `LegalMind-Enterprise-Archive-${new Date().toISOString().slice(0, 10)}.json`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
