const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  toggleFavorite,
  toggleArchive,
  deleteDocument,
  processDocumentPipeline,
  getDocumentStatus,
  getDashboardStats,
  getAnalysisByDocumentId,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply auth protection to all document routes
router.use(protect);

// Dashboard Statistics & Analytics
router.get('/dashboard-stats', getDashboardStats);

// File Upload endpoint
router.post('/upload', upload.single('file'), uploadDocument);

// Document Listing & Querying
router.get('/', getDocuments);

// Pipeline Analysis & Status Endpoints
router.post('/analyze-pipeline/:id', processDocumentPipeline);
router.get('/:id/status', getDocumentStatus);
router.get('/:id/analysis', getAnalysisByDocumentId);

// Single Document Operations
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/archive', toggleArchive);
router.delete('/:id', deleteDocument);

module.exports = router;
