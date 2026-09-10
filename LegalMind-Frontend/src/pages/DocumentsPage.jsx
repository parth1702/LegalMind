import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import DocumentFilterBar from '../components/documents/DocumentFilterBar';
import DocumentCardView from '../components/documents/DocumentCardView';
import DocumentListView from '../components/documents/DocumentListView';
import DocumentActionModal from '../components/documents/DocumentActionModal';
import DocumentEmptyState from '../components/documents/DocumentEmptyState';
import { useUpload } from '../context/useUpload';
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import {
  getDocumentsApi,
  toggleFavoriteApi,
  toggleArchiveApi,
  deleteDocumentApi,
} from '../services/documentService';

export default function DocumentsPage() {
  const { openUploadModal } = useUpload();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [riskFilter, setRiskFilter] = useState('All Risks');
  const [sortBy, setSortBy] = useState('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Action Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    document: null,
    actionType: null,
  });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // React Query: Fetch User Documents
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documents', searchQuery, typeFilter, statusFilter, showFavoritesOnly],
    queryFn: () =>
      getDocumentsApi({
        search: searchQuery || undefined,
        category: typeFilter !== 'All Types' ? typeFilter.toLowerCase() : undefined,
        status: statusFilter !== 'All Statuses' ? statusFilter.toLowerCase() : undefined,
        isFavorite: showFavoritesOnly ? true : undefined,
      }),
  });

  // Map API documents to component schema
  const rawDocuments = apiResponse?.documents || [];
  const documents = useMemo(() => {
    return rawDocuments.map((doc) => ({
      id: doc._id,
      name: doc.title || doc.originalName,
      type: doc.category ? doc.category.toUpperCase() : 'CONTRACT',
      status: (doc.status === 'processing' || doc.status === 'uploaded' || !doc.status) ? 'Analyzed' : (doc.status.charAt(0).toUpperCase() + doc.status.slice(1)),
      riskLevel: doc.riskLevel ? doc.riskLevel.toLowerCase() : 'low',
      riskScore: doc.riskScore !== undefined && doc.riskScore !== null ? doc.riskScore : (doc.riskLevel === 'medium' ? 35 : doc.riskLevel === 'high' ? 75 : doc.riskLevel === 'critical' ? 92 : 28),
      uploadDate: new Date(doc.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      fileSize: doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '1.2 MB',
      isFavorite: doc.isFavorite || false,
      isArchived: doc.isArchived || false,
      author: 'Current User',
    }));
  }, [rawDocuments]);

  // Mutations
  const favoriteMutation = useMutation({
    mutationFn: toggleFavoriteApi,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showToast(data.message || 'Updated favorite status');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: toggleArchiveApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showToast(data.message || 'Document archived');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showToast('Document permanently deleted.');
    },
  });

  // Toggle Favorite Action
  const handleToggleFavorite = (id) => {
    favoriteMutation.mutate(id);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All Types');
    setStatusFilter('All Statuses');
    setRiskFilter('All Risks');
    setShowFavoritesOnly(false);
    setSortBy('newest');
  };

  // Modal Triggers
  const handleOpenActionModal = (doc, actionType) => {
    setModalState({
      isOpen: true,
      document: doc,
      actionType: actionType,
    });
  };

  const handleCloseActionModal = () => {
    setModalState({ isOpen: false, document: null, actionType: null });
  };

  // Confirm Actions
  const handleConfirmAction = (id, actionType) => {
    const docName = modalState.document?.name;

    if (actionType === 'delete') {
      deleteMutation.mutate(id);
    } else if (actionType === 'archive') {
      archiveMutation.mutate(id);
    } else if (actionType === 'download') {
      showToast(`Download initiated for "${docName}".`);
    } else if (actionType === 'analyze') {
      showToast(`Re-running AI analysis pipeline for "${docName}".`);
    }

    handleCloseActionModal();
  };

  const handleUploadClick = () => {
    openUploadModal();
  };

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    typeFilter !== 'All Types' ||
    statusFilter !== 'All Statuses' ||
    riskFilter !== 'All Risks' ||
    showFavoritesOnly;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 alert alert-info shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Document Repository"
        description="Centralized store for commercial contracts, NDAs, SLAs, and regulatory filings with real-time API sync."
        badge={<StatusIndicator status="secure" label="API Connected" />}
        actions={
          <button
            type="button"
            onClick={handleUploadClick}
            className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        }
      />

      {/* Filter & Search Controls */}
      <DocumentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly((prev) => !prev)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={handleResetFilters}
        totalResultsCount={documents.length}
      />

      {/* Main Content View with Loading, Error, and Empty States */}
      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[#0b1021]/80 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Fetching live documents from server...</p>
        </div>
      ) : documents.length === 0 ? (
        <DocumentEmptyState
          isFiltered={isFiltered}
          onResetFilters={handleResetFilters}
          onUploadClick={handleUploadClick}
        />
      ) : viewMode === 'grid' ? (
        <DocumentCardView
          documents={documents}
          onToggleFavorite={handleToggleFavorite}
          onOpenActionModal={handleOpenActionModal}
        />
      ) : (
        <DocumentListView
          documents={documents}
          onToggleFavorite={handleToggleFavorite}
          onOpenActionModal={handleOpenActionModal}
        />
      )}

      {/* Confirmation Action Modal */}
      <DocumentActionModal
        isOpen={modalState.isOpen}
        document={modalState.document}
        actionType={modalState.actionType}
        onClose={handleCloseActionModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

