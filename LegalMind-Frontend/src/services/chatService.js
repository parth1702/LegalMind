import apiClient from './api';

export const chatService = {
  /**
   * Fetch all user chat conversation sessions
   */
  async getConversations() {
    try {
      const response = await apiClient.get('/v1/chat/conversations');
      return response?.data || response || [];
    } catch (err) {
      try {
        const response = await apiClient.get('/chat/conversations');
        return response?.data || response || [];
      } catch (innerErr) {
        throw err;
      }
    }
  },

  /**
   * Fetch specific conversation thread with messages
   */
  async getConversationById(id) {
    try {
      const response = await apiClient.get(`/v1/chat/conversations/${id}`);
      return response?.data || response;
    } catch (err) {
      const response = await apiClient.get(`/chat/conversations/${id}`);
      return response?.data || response;
    }
  },

  /**
   * Create a new conversation thread linked to an active document
   */
  async createConversation(documentId = null, title = null) {
    try {
      const response = await apiClient.post('/v1/chat/conversations', { documentId, title });
      return response?.data || response;
    } catch (err) {
      const response = await apiClient.post('/chat/conversations', { documentId, title });
      return response?.data || response;
    }
  },

  /**
   * Send RAG query to Node Backend -> FastAPI AI Service
   */
  async sendQuery({ conversationId, documentId, query }) {
    try {
      const response = await apiClient.post('/v1/chat/query', {
        conversationId,
        documentId,
        query,
      });
      return response;
    } catch (err) {
      try {
        const response = await apiClient.post('/chat/query', {
          conversationId,
          documentId,
          query,
        });
        return response;
      } catch (innerErr) {
        throw err;
      }
    }
  },

  /**
   * Submit user feedback (helpful: true/false) on AI message
   */
  async submitFeedback({ conversationId, messageId, helpful, comment }) {
    try {
      const response = await apiClient.post('/v1/chat/feedback', {
        conversationId,
        messageId,
        helpful,
        comment,
      });
      return response;
    } catch (err) {
      const response = await apiClient.post('/chat/feedback', {
        conversationId,
        messageId,
        helpful,
        comment,
      });
      return response;
    }
  },

  /**
   * Delete conversation thread
   */
  async deleteConversation(id) {
    try {
      const response = await apiClient.delete(`/v1/chat/conversations/${id}`);
      return response;
    } catch (err) {
      const response = await apiClient.delete(`/chat/conversations/${id}`);
      return response;
    }
  },
};

export default chatService;
