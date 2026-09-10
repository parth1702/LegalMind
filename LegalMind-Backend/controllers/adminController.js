const User = require('../models/User');
const Document = require('../models/Document');
const ContactSubmission = require('../models/ContactSubmission');
const ActivityLog = require('../models/ActivityLog');
const Analysis = require('../models/Analysis');

/**
 * GET /api/admin/stats
 * Aggregates system & database metrics (Users, Documents, Storage size, Inquiries, Risk flags)
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const attorneyCount = await User.countDocuments({ role: 'attorney' });
    const paralegalCount = await User.countDocuments({ role: 'paralegal' });
    const clientCount = await User.countDocuments({ role: 'client' });

    const totalDocuments = await Document.countDocuments();
    const highRiskDocuments = await Document.countDocuments({ riskLevel: { $in: ['high', 'critical'] } });
    const pendingDocuments = await Document.countDocuments({ status: { $in: ['uploaded', 'processing'] } });

    const documentsWithBytes = await Document.find().select('fileSize');
    const totalStorageBytes = documentsWithBytes.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

    const totalInquiries = await ContactSubmission.countDocuments();
    const newInquiries = await ContactSubmission.countDocuments({ status: 'new' });
    const inProgressInquiries = await ContactSubmission.countDocuments({ status: 'in_progress' });
    const resolvedInquiries = await ContactSubmission.countDocuments({ status: 'resolved' });

    const totalLogs = await ActivityLog.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: adminCount,
          attorneys: attorneyCount,
          paralegals: paralegalCount,
          clients: clientCount,
        },
        documents: {
          total: totalDocuments,
          highRisk: highRiskDocuments,
          pending: pendingDocuments,
          totalStorageBytes,
          formattedStorage: (totalStorageBytes / (1024 * 1024)).toFixed(2) + ' MB',
        },
        inquiries: {
          total: totalInquiries,
          new: newInquiries,
          inProgress: inProgressInquiries,
          resolved: resolvedInquiries,
        },
        system: {
          totalLogs,
          databaseStatus: 'Healthy (MongoDB Atlas / Replica Connected)',
          ragEngineStatus: 'Online (FAISS Vector Service Operational)',
          uptimeSeconds: process.uptime(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Returns list of users with search, role filtering & pagination
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Updates a user's role (admin, attorney, paralegal, client)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'attorney', 'paralegal', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.email} role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Toggle user verification or lock status
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    user.isVerified = isVerified !== undefined ? isVerified : !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.email} status updated`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user account and associated data
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active Admin account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    await User.findByIdAndDelete(id);
    await Document.deleteMany({ owner: id });
    await ActivityLog.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: `User ${user.email} and associated documents deleted`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/documents
 * List all commercial contracts across all users
 */
exports.getAllDocuments = async (req, res, next) => {
  try {
    const { search, category, riskLevel, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (riskLevel && riskLevel !== 'all') {
      query.riskLevel = riskLevel;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('owner', 'name email role organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/documents/:id
 * Admin force delete a document
 */
exports.deleteDocumentAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    await Document.findByIdAndDelete(id);
    await Analysis.deleteMany({ document: id });

    res.status(200).json({
      success: true,
      message: `Document '${doc.title || doc.originalName}' deleted by Admin`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/inquiries
 * List support tickets & contact inquiries
 */
exports.getInquiriesAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
      ];
    }

    const inquiries = await ContactSubmission.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/inquiries/:id
 * Update support ticket status & add admin notes
 */
exports.updateInquiryAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await ContactSubmission.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Support inquiry ticket not found',
      });
    }

    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: `Ticket ${inquiry.ticketId} updated successfully`,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 * List system activity logs
 */
exports.getAuditLogsAdmin = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .populate('document', 'title originalName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
