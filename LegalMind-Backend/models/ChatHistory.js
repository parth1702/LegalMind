const mongoose = require('mongoose');

/**
 * Embedded Citation Subdocument Schema
 */
const citationSchema = new mongoose.Schema({
  sourceText: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  relevanceScore: { type: Number, min: 0, max: 1, default: 1 },
});

/**
 * Embedded Message Subdocument Schema
 */
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: {
      values: ['user', 'assistant', 'system'],
      message: '{VALUE} is not a valid message sender',
    },
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
  },
  citations: [citationSchema],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

/**
 * ChatHistory Schema — Manages interactive RAG sessions & message threads per user/document.
 */
const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Chat session must belong to a user'],
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      index: true,
      default: null, // Optional link to specific document session
    },
    title: {
      type: String,
      trim: true,
      default: 'Legal Assistant Conversation',
      maxlength: [150, 'Chat title cannot exceed 150 characters'],
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history retrieval
chatHistorySchema.index({ user: 1, updatedAt: -1 });
chatHistorySchema.index({ document: 1, user: 1 });

const ChatHistory =
  mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
