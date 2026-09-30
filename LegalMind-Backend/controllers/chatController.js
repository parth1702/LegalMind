const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');

const { AI_SERVICE_URL } = require('../config/aiConfig');

/**
 * Simple fallback when AI Service is completely unreachable.
 * All intelligent responses are now handled by the Agentic RAG pipeline in the AI Service.
 */
function generateFallbackAnswer(query) {
  return `The AI Legal Co-Pilot is temporarily unavailable. Please ensure the AI Service is running and try again.\n\nYour query: "${query}"`;
}

/**
 * @desc    Send RAG query to AI Service and update conversation history
 * @route   POST /api/v1/chat/query
 * @access  Private
 */
const sendQuery = async (req, res, next) => {
  try {
    const { conversationId, documentId, query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query text cannot be empty',
      });
    }

    const userId = req.user ? req.user._id.toString() : 'guest_user';

    // Find or create active conversation session
    let conversation;
    if (conversationId) {
      conversation = await ChatHistory.findOne({ _id: conversationId, user: req.user._id });
    }

    const targetDocId = documentId || (conversation && conversation.document ? conversation.document.toString() : null);

    // Enforce document ownership security check
    let docTitle = 'General Legal Assistant';
    if (targetDocId) {
      const doc = await Document.findById(targetDocId);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: 'Requested document not found',
        });
      }
      docTitle = doc.title || doc.originalName || docTitle;
      if (req.user && doc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not own this document',
        });
      }
    }

    if (!conversation) {
      conversation = await ChatHistory.create({
        user: req.user._id,
        document: targetDocId || null,
        title: query.length > 50 ? `${query.substring(0, 47)}...` : query,
        messages: [],
      });
    }

    // Append User message to thread
    conversation.messages.push({
      sender: 'user',
      content: query.trim(),
      timestamp: new Date(),
    });

    await conversation.save();

    // Build conversation history for multi-turn context (last 5 turns)
    const recentMessages = conversation.messages
      .slice(-5)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: (msg.content || '').substring(0, 500),
      }));

    // Call FastAPI AI Service Agentic RAG endpoint with 30s timeout
    let ragResult;

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/v1/rag/query`,
        {
          query: query.trim(),
          user_id: userId,
          document_id: targetDocId,
          top_k: 4,
          min_score: 0.15,
          conversation_history: recentMessages,
        },
        { timeout: 30000 }
      );

      if (aiResponse.data && aiResponse.data.answer) {
        ragResult = aiResponse.data;
      } else {
        throw new Error('Empty or invalid response from AI service');
      }
    } catch (aiErr) {
      console.warn('AI Service RAG query error:', aiErr.message);
      ragResult = {
        success: false,
        answer: generateFallbackAnswer(query.trim()),
        evidence_found: false,
        confidence_score: 0.0,
        sources: [],
      };
    }

    // Format citations from RAG response sources (Task 4 Response Contract)
    const citations = (ragResult.sources || []).map((src) => ({
      document_id: src.doc_id || src.document_id || targetDocId || '',
      documentId: src.doc_id || src.document_id || targetDocId || '',
      chunk_id: src.chunk_id || 1,
      page: src.page || 1,
      pageNumber: src.page || 1,
      text: src.text_snippet || src.text || '',
      sourceText: src.text_snippet || src.text || '',
      similarity_score: src.score || 0.0,
      relevanceScore: src.score || 0.0,
    }));

    // Append Assistant response to thread
    const assistantMsg = {
      sender: 'assistant',
      content: ragResult.answer || 'I cannot find relevant evidence in the uploaded document.',
      citations: citations,
      timestamp: new Date(),
    };

    conversation.messages.push(assistantMsg);
    await conversation.save();

    // Log Activity
    if (ActivityLog) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'CHAT_QUERY',
        details: `Query executed for conversation ${conversation._id}`,
      }).catch(() => {});
    }

    const isEvidenceFound = ragResult.evidence_found !== false && citations.length > 0;

    return res.status(200).json({
      success: ragResult.success !== false,
      answer: ragResult.answer || 'I cannot find relevant evidence in the uploaded document.',
      document_id: targetDocId || null,
      documentId: targetDocId || null,
      evidence_found: isEvidenceFound,
      evidenceFound: isEvidenceFound,
      confidence_score: isEvidenceFound ? (ragResult.confidence_score || 0.0) : 0.0,
      confidenceScore: isEvidenceFound ? (ragResult.confidence_score || 0.0) : 0.0,
      sources: citations,
      conversationId: conversation._id,
      messages: conversation.messages,
      disclaimer: 'LegalMind AI Co-Pilot analysis is for legal intelligence only.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all chat conversation threads for logged in user
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await ChatHistory.find({ user: req.user._id, status: 'active' })
      .populate('document', 'title originalName fileUrl')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific conversation thread by ID
 * @route   GET /api/v1/chat/conversations/:id
 * @access  Private
 */
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await ChatHistory.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('document', 'title originalName fileUrl');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new conversation thread
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
const createConversation = async (req, res, next) => {
  try {
    const { documentId, title } = req.body;

    let docTitle = title || 'New Legal Query Session';
    if (documentId) {
      const doc = await Document.findById(documentId);
      if (doc) docTitle = `Chat: ${doc.title}`;
    }

    const conversation = await ChatHistory.create({
      user: req.user._id,
      document: documentId || null,
      title: docTitle,
      messages: [
        {
          sender: 'assistant',
          content: 'Hello Counsel. I am **LegalMind AI Co-Pilot**. I am ready to interrogate your legal documents. Ask me a question or select an uploaded contract.',
          citations: [],
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit user feedback on AI response message
 * @route   POST /api/v1/chat/feedback
 * @access  Private
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { conversationId, messageId, helpful, comment } = req.body;

    const conversation = await ChatHistory.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation session not found',
      });
    }

    // Log Activity for feedback audit
    if (ActivityLog) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'FEEDBACK_SUBMITTED',
        details: `Message ${messageId} marked helpful=${helpful} in conversation ${conversationId}`,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      conversationId,
      messageId,
      helpful,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete conversation thread
 * @route   DELETE /api/v1/chat/conversations/:id
 * @access  Private
 */
const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await ChatHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation thread not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation thread deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendQuery,
  getConversations,
  getConversationById,
  createConversation,
  submitFeedback,
  deleteConversation,
};
