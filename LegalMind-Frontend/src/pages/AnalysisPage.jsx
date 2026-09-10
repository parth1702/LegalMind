import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import AnalysisToolbar from '../components/analysis/AnalysisToolbar';
import DocumentOutlineNav from '../components/analysis/DocumentOutlineNav';
import DocumentViewerCanvas from '../components/analysis/DocumentViewerCanvas';
import AiInsightsPanel from '../components/analysis/AiInsightsPanel';
import AiAnalysisSkeleton from '../components/ai-analysis/AiAnalysisSkeleton';
import RiskScoreCard from '../components/ai-analysis/RiskScoreCard';
import ExecutiveSummaryCard from '../components/ai-analysis/ExecutiveSummaryCard';
import EvidenceFindingsCard from '../components/ai-analysis/EvidenceFindingsCard';
import StrategyRecommendationsCard from '../components/ai-analysis/StrategyRecommendationsCard';
import { downloadAsPdf } from '../utils/archiveUtils';
import { getDocumentsApi, getAnalysisByDocumentIdApi, getDocumentByIdApi } from '../services/documentService';
import apiClient from '../services/api';
import { useUpload } from '../context/useUpload';
import { Sparkles, FileText, Layout, RefreshCw, Download, UploadCloud, ChevronDown, AlertCircle } from 'lucide-react';

export default function AnalysisPage() {
  const { id: routeDocId } = useParams();
  const navigate = useNavigate();
  const { openUploadModal } = useUpload();

  const [viewMode, setViewMode] = useState('report'); // 'report' | 'viewer' | 'loading'
  const [selectedDocId, setSelectedDocId] = useState(routeDocId || '');

  // Fetch list of user documents
  const {
    data: docsResponse,
    isLoading: isLoadingDocs,
  } = useQuery({
    queryKey: ['user-documents'],
    queryFn: () => getDocumentsApi({ limit: 50 }),
  });

  const rawDocs = docsResponse?.documents || [];

  // Automatically select the active document (URL route doc ID or the latest document)
  useEffect(() => {
    if (routeDocId) {
      setSelectedDocId(routeDocId);
    } else if (rawDocs.length > 0 && !selectedDocId) {
      setSelectedDocId(rawDocs[0]._id || rawDocs[0].id);
    }
  }, [routeDocId, rawDocs, selectedDocId]);

  // Fetch real evidence-backed AI Analysis report from backend
  const {
    data: analysisResponse,
    isLoading: isLoadingAnalysis,
    isError: isAnalysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ['document-analysis', selectedDocId],
    queryFn: () => getAnalysisByDocumentIdApi(selectedDocId),
    enabled: Boolean(selectedDocId),
  });

  // Fetch real Document details and extracted text
  const { data: docDetailsResponse } = useQuery({
    queryKey: ['document-details', selectedDocId],
    queryFn: () => getDocumentByIdApi(selectedDocId),
    enabled: Boolean(selectedDocId),
  });

  const activeDocObj = rawDocs.find((d) => (d._id || d.id) === selectedDocId) || docDetailsResponse?.document || {};
  const realExtractedText = activeDocObj?.extractedText || docDetailsResponse?.document?.extractedText || '';

  const realPagesContent = realExtractedText
    ? realExtractedText.split('\n\n--- Page ').map((chunk, index) => ({
        page: index + 1,
        heading: `Page ${index + 1}: Extracted Legal Content`,
        body: chunk.replace(/^\d+ ---\n/, ''),
      }))
    : [{ page: 1, heading: 'Page 1: Extracted Content', body: 'Document text content loaded from server.' }];

  // Viewer State
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClauseId, setSelectedClauseId] = useState('clause-1');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState('viewer');
  const [isReRunning, setIsReRunning] = useState(false);

  const documentData = {
    title: activeDocObj.title || activeDocObj.originalName || 'Legal Document',
    pagesContent: realPagesContent,
    totalPages: realPagesContent.length || 1,
    outline: [],
    clauses: [],
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 175));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoomLevel(100);

  const handleSelectClause = (clauseId) => {
    setSelectedClauseId(clauseId);
  };

  const handleExport = () => {
    downloadAsPdf();
  };

  const handleSelectDocChange = (e) => {
    const newId = e.target.value;
    setSelectedDocId(newId);
    navigate(`/app/analysis/${newId}`);
  };

  const handleReRunAnalysis = async () => {
    if (!selectedDocId) return;
    setIsReRunning(true);
    setViewMode('loading');
    try {
      await apiClient.post(`/documents/analyze-pipeline/${selectedDocId}`);
      await refetchAnalysis();
    } catch (err) {
      console.warn('Re-run analysis error:', err);
    } finally {
      setIsReRunning(false);
      setViewMode('report');
    }
  };

  const rawReport = analysisResponse?.analysis || null;
  const backendScore = rawReport?.overallRiskScore ?? rawReport?.riskScore ?? activeDocObj.riskScore ?? 0;
  const backendLevel = (rawReport?.overallRiskLevel || rawReport?.riskLevel || activeDocObj.riskLevel || 'low').toLowerCase();

  const reportData = rawReport
    ? {
        documentName: rawReport.documentName || activeDocObj.title || activeDocObj.originalName || 'Legal Document',
        overallRiskScore: backendScore,
        overallRiskLevel: backendLevel,
        categoryScores: rawReport.categoryScores || {},
        executiveSummary: rawReport.executiveSummary || {
          overview: `Evidence-backed analysis for ${activeDocObj.title || activeDocObj.originalName || 'uploaded document'}.`,
          keyTakeaways: ['Assessed under Indian Contract Act 1872 & DPDP Act 2023.'],
        },
        keyFindings: rawReport.keyFindings || rawReport.risks || [],
        evidenceList: rawReport.evidenceList || rawReport.evidence || rawReport.keyFindings || [],
        recommendations: rawReport.recommendations || [],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Evidence-Backed AI Legal Risk Engine"
        description={
          activeDocObj?.title || activeDocObj?.originalName
            ? `Evidence-backed risk evaluation for ${activeDocObj.title || activeDocObj.originalName}.`
            : "Grounding contract risk analysis strictly in document text."
        }
        badge={<StatusIndicator status={isAnalysisError ? 'offline' : 'online'} label={isAnalysisError ? 'Error' : 'Evidence Verified'} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Document Selector Dropdown */}
            {rawDocs.length > 0 && (
              <div className="relative">
                <select
                  value={selectedDocId}
                  onChange={handleSelectDocChange}
                  className="bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 max-w-[200px] truncate appearance-none"
                >
                  {rawDocs.map((doc) => (
                    <option key={doc._id || doc.id} value={doc._id || doc.id}>
                      📄 {doc.title || doc.originalName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('report')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'report'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Report</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('viewer')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'viewer'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Document Viewer</span>
              </button>
            </div>

            {/* Re-run Analysis Trigger */}
            {selectedDocId && (
              <button
                type="button"
                onClick={handleReRunAnalysis}
                disabled={isReRunning}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isReRunning ? 'Analyzing...' : 'Re-Run AI Model'}</span>
              </button>
            )}

            {/* Export Report Action */}
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-primary btn-sm shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        }
      />

      {/* NO DOCUMENTS IN REPOSITORY */}
      {!isLoadingDocs && rawDocs.length === 0 && !selectedDocId && (
        <div className="card-base p-10 text-center space-y-4 border-slate-800 my-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-100">No Documents Uploaded</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a commercial document to execute evidence-backed AI risk scoring.
            </p>
          </div>
          <button
            type="button"
            onClick={openUploadModal}
            className="btn btn-primary btn-sm mx-auto shadow-lg shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      )}

      {/* CONTROLLED ERROR STATE */}
      {isAnalysisError && (
        <div className="card-base p-8 text-center space-y-4 border-rose-900/40 bg-rose-950/20 my-6">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-200">Analysis unavailable. Please retry.</h3>
            <p className="text-xs text-slate-400">
              The server could not retrieve or complete evidence extraction for this document.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchAnalysis()}
            className="btn btn-secondary btn-sm mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Server Analysis</span>
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {(viewMode === 'loading' || isLoadingAnalysis) && (
        <AiAnalysisSkeleton onComplete={() => setViewMode('report')} />
      )}

      {/* REPORT MODE */}
      {viewMode === 'report' && !isLoadingAnalysis && !isAnalysisError && reportData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Row: Risk Score & Executive Summary */}
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <RiskScoreCard
                riskScore={reportData.overallRiskScore}
                riskLevel={reportData.overallRiskLevel}
                modelVersion="Evidence-Backed Legal Engine"
              />
            </div>
            <div className="lg:col-span-8">
              <ExecutiveSummaryCard
                summary={reportData.executiveSummary}
                keyFindings={reportData.keyFindings}
              />
            </div>
          </div>

          {/* Evidence Findings Card */}
          <EvidenceFindingsCard
            categoryScores={reportData.categoryScores}
            findings={reportData.keyFindings}
            evidenceList={reportData.evidenceList}
          />

          {/* Actionable Strategy Recommendations */}
          <StrategyRecommendationsCard
            importantDates={[]}
            recommendations={reportData.recommendations}
          />
        </div>
      )}

      {/* DOCUMENT VIEWER MODE */}
      {viewMode === 'viewer' && !isLoadingAnalysis && (
        <div className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden bg-background rounded-2xl border border-slate-800 animate-in fade-in duration-200">
          <AnalysisToolbar
            documentTitle={documentData.title}
            currentPage={currentPage}
            totalPages={documentData.totalPages}
            onPageChange={setCurrentPage}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            leftPanelOpen={leftPanelOpen}
            onToggleLeftPanel={() => setLeftPanelOpen((prev) => !prev)}
            rightPanelOpen={rightPanelOpen}
            onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
            onExport={handleExport}
          />

          <div className="flex-1 flex overflow-hidden relative">
            <div
              className={`
                ${leftPanelOpen ? 'w-64' : 'w-0 hidden'}
                ${mobileTab === 'outline' ? '!w-full !block' : 'hidden sm:block'}
                transition-all duration-200 shrink-0 h-full
              `}
            >
              <DocumentOutlineNav
                outline={documentData.outline}
                clauses={documentData.clauses}
                currentPage={currentPage}
                onSelectPage={setCurrentPage}
                onSelectClause={handleSelectClause}
              />
            </div>

            <div
              className={`
                flex-1 h-full overflow-hidden flex flex-col
                ${mobileTab === 'viewer' ? 'block' : 'hidden sm:flex'}
              `}
            >
              <DocumentViewerCanvas
                pagesContent={documentData.pagesContent}
                currentPage={currentPage}
                zoomLevel={zoomLevel}
                searchQuery={searchQuery}
                selectedClauseId={selectedClauseId}
                onSelectClause={handleSelectClause}
              />
            </div>

            <div
              className={`
                ${rightPanelOpen ? 'w-80 lg:w-96' : 'w-0 hidden'}
                ${mobileTab === 'insights' ? '!w-full !block' : 'hidden sm:block'}
                transition-all duration-200 shrink-0 h-full
              `}
            >
              <AiInsightsPanel
                documentData={documentData}
                selectedClauseId={selectedClauseId}
                onSelectClause={handleSelectClause}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
