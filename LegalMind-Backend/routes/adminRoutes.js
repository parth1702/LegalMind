const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAdminStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllDocuments,
  deleteDocumentAdmin,
  getInquiriesAdmin,
  updateInquiryAdmin,
  getAuditLogsAdmin,
} = require('../controllers/adminController');

// All routes require authentication and Admin role
router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard & System Stats
router.get('/stats', getAdminStats);

// User Management Routes
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Document Vault Control Routes
router.get('/documents', getAllDocuments);
router.delete('/documents/:id', deleteDocumentAdmin);

// Support Ticket & Inquiries Routes
router.get('/inquiries', getInquiriesAdmin);
router.put('/inquiries/:id', updateInquiryAdmin);

// System Audit Logs Route
router.get('/audit-logs', getAuditLogsAdmin);

module.exports = router;
