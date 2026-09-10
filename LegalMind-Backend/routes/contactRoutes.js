const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getContactSubmissions,
  getUserInquiries,
  updateInquiry,
} = require('../controllers/contactController');

// POST /api/contact — Submit new contact form
router.post('/', submitContactForm);

// GET /api/contact/user — Fetch inquiries by user email or ticket ID
router.get('/user', getUserInquiries);

// GET /api/contact — Fetch contact submissions list
router.get('/', getContactSubmissions);

// PUT /api/contact/:id — Update an inquiry details or admin status/notes
router.put('/:id', updateInquiry);

module.exports = router;
