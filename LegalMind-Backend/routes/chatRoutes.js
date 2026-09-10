const express = require('express');
const {
  sendQuery,
  getConversations,
  getConversationById,
  createConversation,
  submitFeedback,
  deleteConversation,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.post('/query', sendQuery);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.post('/conversations', createConversation);
router.post('/feedback', submitFeedback);
router.delete('/conversations/:id', deleteConversation);

module.exports = router;
