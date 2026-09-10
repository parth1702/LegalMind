const mongoose = require('mongoose');

/**
 * Document Schema — Tracks legal files uploaded by users, metadata, and status.
 */
const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL/path is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [1, 'File size must be greater than 0'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: {
        values: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ],
        message: '{VALUE} is not a supported file format',
      },
    },
    fileHash: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'processing',
          'processed',
          'indexing',
          'indexed',
          'completed',
          'failed',
          'uploaded',
          'analyzed',
          'error',
          'PENDING',
          'PROCESSING',
          'PROCESSED',
          'INDEXING',
          'INDEXED',
          'COMPLETED',
          'FAILED',
          'UPLOADED',
          'ANALYZED',
          'ERROR',
        ],
        message: '{VALUE} is not a valid processing status',
      },
      default: 'analyzed',
      index: true,
    },
    riskScore: {
      type: Number,
      default: 28,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'low',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'contract',
        'nda',
        'lease',
        'compliance',
        'statute',
        'litigation',
        'other',
      ],
      default: 'contract',
    },
    extractedText: {
      type: String,
      default: '',
      select: false, // Exclude large raw text from light list queries
    },
    pageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound & Search Indexes
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, category: 1 });
documentSchema.index({ user: 1, isArchived: 1, isFavorite: 1 });
documentSchema.index(
  { title: 'text', originalName: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, originalName: 2 } }
);

const Document =
  mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;
