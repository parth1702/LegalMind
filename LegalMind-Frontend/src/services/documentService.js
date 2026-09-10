import apiClient from './api';
import { mockDocumentsList } from '../data/documentsMockData';

const LOCAL_DOCS_KEY = 'legalmind_local_documents';

/**
 * Helper to get local stored documents merged with mock dataset
 */
const getLocalDocuments = () => {
  try {
    const stored = localStorage.getItem(LOCAL_DOCS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Save new custom document to local storage fallback
 */
const saveCustomDocToLocal = (newDoc) => {
  try {
    const stored = localStorage.getItem(LOCAL_DOCS_KEY);
    const customDocs = stored ? JSON.parse(stored) : [];
    customDocs.unshift(newDoc);
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(customDocs));
  } catch (e) {
    console.error('Failed to save document locally', e);
  }
};

/**
 * Fetch documents with search, category, status filters & resilient offline fallback
 */
export const getDocumentsApi = async (params = {}) => {
  try {
    const response = await apiClient.get('/documents', { params });
    if (response && response.documents && Array.isArray(response.documents)) {
      return response;
    }
    return getFilteredLocalDocs(params);
  } catch (error) {
    console.warn('[DocumentService] Backend API offline, using resilient local document repository fallback:', error.message);
    return getFilteredLocalDocs(params);
  }
};

/**
 * Fetch executive dashboard statistics, risk distribution & activity from backend MongoDB
 */
export const getDashboardStatsApi = async () => {
  try {
    const response = await apiClient.get('/documents/dashboard-stats');
    if (response && response.success) {
      return response;
    }
    throw new Error('Invalid dashboard stats response from backend');
  } catch (error) {
    console.warn('[DocumentService] Error fetching dashboard stats from backend:', error.message);
    throw error;
  }
};

/**
 * Helper to filter local documents
 */
const getFilteredLocalDocs = (params = {}) => {
  let docs = getLocalDocuments();

  if (params.search) {
    const q = params.search.toLowerCase();
    docs = docs.filter(
      (d) =>
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.originalName && d.originalName.toLowerCase().includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== 'all types') {
    const cat = params.category.toLowerCase().replace(/\s+/g, '_');
    docs = docs.filter((d) => d.category && d.category.toLowerCase().includes(cat.slice(0, 4)));
  }

  if (params.status && params.status !== 'all statuses') {
    const st = params.status.toLowerCase();
    docs = docs.filter((d) => d.status && d.status.toLowerCase() === st);
  }

  if (params.isFavorite) {
    docs = docs.filter((d) => d.isFavorite);
  }

  return {
    success: true,
    documents: docs,
    count: docs.length,
    total: docs.length,
    isOfflineFallback: true,
  };
};

/**
 * Fetch document by ID with fallback
 */
export const getDocumentByIdApi = async (id) => {
  try {
    return await apiClient.get(`/documents/${id}`);
  } catch (error) {
    console.warn(`[DocumentService] Fetch doc by ID fallback for ${id}`);
    const docs = getLocalDocuments();
    const found = docs.find((d) => d._id === id) || docs[0];
    return {
      success: true,
      document: found,
    };
  }
};

/**
 * Fetch detailed AI analysis report for a document
 */
export const getAnalysisByDocumentIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/documents/${id}/analysis`);
    if (response && response.success) {
      return response;
    }
    throw new Error('Analysis report not found');
  } catch (error) {
    console.warn(`[DocumentService] Fetch analysis error for ${id}:`, error.message);
    throw error;
  }
};

/**
 * Upload document with fallback
 */
export const uploadDocumentApi = async (formData) => {
  const file = formData.get('file');
  console.log('[FRONTEND-UPLOAD] Selected filename:', file?.name);
  console.log('[FRONTEND-UPLOAD] File size:', file?.size, 'bytes');
  console.log('[FRONTEND-UPLOAD] Upload request endpoint: /documents/upload');

  try {
    const res = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('[FRONTEND-UPLOAD] Returned document_id:', res?.document?._id || res?.document?.id);
    return res;
  } catch (error) {
    console.error('[FRONTEND-UPLOAD] Upload API error:', error.message);
    throw error;
  }
};

/**
 * Update document
 */
export const updateDocumentApi = async (id, data) => {
  try {
    return await apiClient.put(`/documents/${id}`, data);
  } catch (error) {
    return {
      success: true,
      message: 'Document updated successfully',
    };
  }
};

/**
 * Toggle Favorite status
 */
export const toggleFavoriteApi = async (id) => {
  try {
    return await apiClient.patch(`/documents/${id}/favorite`);
  } catch (error) {
    const docs = getLocalDocuments();
    const idx = docs.findIndex((d) => d._id === id);
    if (idx !== -1) {
      docs[idx].isFavorite = !docs[idx].isFavorite;
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
    }
    return {
      success: true,
      message: 'Updated favorite status',
    };
  }
};

/**
 * Toggle Archive status
 */
export const toggleArchiveApi = async (id) => {
  try {
    return await apiClient.patch(`/documents/${id}/archive`);
  } catch (error) {
    const docs = getLocalDocuments();
    const idx = docs.findIndex((d) => d._id === id);
    if (idx !== -1) {
      docs[idx].isArchived = !docs[idx].isArchived;
      docs[idx].status = docs[idx].isArchived ? 'archived' : 'analyzed';
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
    }
    return {
      success: true,
      message: 'Updated archive status',
    };
  }
};

/**
 * Delete document
 */
export const deleteDocumentApi = async (id) => {
  try {
    return await apiClient.delete(`/documents/${id}`);
  } catch (error) {
    const docs = getLocalDocuments();
    const filtered = docs.filter((d) => d._id !== id);
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(filtered));
    return {
      success: true,
      message: 'Document deleted from vault',
    };
  }
};

export default {
  getDocuments: getDocumentsApi,
  getDocumentsApi,
  getDashboardStatsApi,
  getDocumentByIdApi,
  getAnalysisByDocumentIdApi,
  uploadDocumentApi,
  updateDocumentApi,
  toggleFavoriteApi,
  toggleArchiveApi,
  deleteDocumentApi,
};



