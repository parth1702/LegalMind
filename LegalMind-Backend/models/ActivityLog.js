const mongoose = require('mongoose');

/**
 * ActivityLog Schema — Records user actions, compliance audit trails, and system interactions.
 */
const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity log must be associated with a user'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Activity action type is required'],
      enum: {
        values: [
          'USER_LOGIN',
          'USER_REGISTER',
          'DOCUMENT_UPLOAD',
          'DOCUMENT_DELETE',
          'ANALYSIS_GENERATE',
          'CHAT_QUERY',
          'SETTINGS_UPDATE',
        ],
        message: '{VALUE} is not a valid activity action',
      },
      index: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Logs are append-only
  }
);

// Indexes
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
