const ContactSubmission = require('../models/ContactSubmission');
const { sendContactEmails } = require('../utils/emailService');

/**
 * Generate a unique human-friendly Ticket ID (e.g. TKT-2026-7849)
 */
const generateTicketId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${randomDigits}`;
};

/**
 * @desc    Submit a new contact inquiry form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, category, preferredContact, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Email, Subject, and Message.',
      });
    }

    // Basic email format check
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    // Generate unique Ticket ID
    let ticketId = generateTicketId();
    let isDuplicate = await ContactSubmission.findOne({ ticketId });
    while (isDuplicate) {
      ticketId = generateTicketId();
      isDuplicate = await ContactSubmission.findOne({ ticketId });
    }

    // Capture client IP
    const ipAddress =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // Create DB Submission Record
    const contactSubmission = await ContactSubmission.create({
      ticketId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      category: category || 'General Inquiry',
      preferredContact: preferredContact || 'email',
      message: message.trim(),
      ipAddress,
    });

    // Send emails / notifications
    const emailResult = await sendContactEmails({
      ticketId,
      name: contactSubmission.name,
      email: contactSubmission.email,
      phone: contactSubmission.phone,
      subject: contactSubmission.subject,
      category: contactSubmission.category,
      preferredContact: contactSubmission.preferredContact,
      message: contactSubmission.message,
    });

    if (emailResult.emailSent) {
      contactSubmission.emailSent = true;
      await contactSubmission.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been successfully submitted! We have sent a confirmation details ticket to your email.',
      data: {
        ticketId: contactSubmission.ticketId,
        name: contactSubmission.name,
        email: contactSubmission.email,
        phone: contactSubmission.phone,
        subject: contactSubmission.subject,
        category: contactSubmission.category,
        preferredContact: contactSubmission.preferredContact,
        createdAt: contactSubmission.createdAt,
      },
    });
  } catch (error) {
    console.error('[ContactController Error]:', error);
    next(error);
  }
};


/**
 * @desc    Get contact submissions list
 * @route   GET /api/contact
 * @access  Public / Admin
 */
const getContactSubmissions = async (req, res, next) => {
  try {
    const { status, category, query } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (query) {
      filter.$or = [
        { ticketId: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
      ];
    }

    const submissions = await ContactSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get contact inquiries by user email or ticket ID
 * @route   GET /api/contact/user
 * @access  Public
 */
const getUserInquiries = async (req, res, next) => {
  try {
    const { email, query } = req.query;

    let filter = {};
    if (email) {
      filter.email = email.trim().toLowerCase();
    }
    if (query) {
      filter.$or = [
        { ticketId: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    const submissions = await ContactSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact inquiry details or admin status/notes
 * @route   PUT /api/contact/:id
 * @access  Public / Admin
 */
const updateInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, message, preferredContact, category, phone, status, adminNotes } = req.body;

    const inquiry = await ContactSubmission.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Update user fields if provided
    if (subject) inquiry.subject = subject.trim();
    if (message) inquiry.message = message.trim();
    if (preferredContact) inquiry.preferredContact = preferredContact;
    if (category) inquiry.category = category;
    if (phone !== undefined) inquiry.phone = phone.trim();

    // Update admin fields if provided
    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes.trim();

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactForm,
  getContactSubmissions,
  getUserInquiries,
  updateInquiry,
};
