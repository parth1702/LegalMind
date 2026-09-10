let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.log('[EmailService] Nodemailer module fallback active');
}

/**
 * Creates nodemailer transporter if SMTP credentials are provided
 */
const getTransporter = () => {
  if (!nodemailer) return null;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Dispatch contact inquiry emails:
 * 1. Admin Alert Email -> Sent TO nainil9845patel@gmail.com
 * 2. User Confirmation Email -> Sent TO submitter's email address
 */
const sendContactEmails = async ({ ticketId, name, email, phone, subject, category, preferredContact, message }) => {
  const adminEmail = process.env.SUPPORT_EMAIL || 'nainil9845patel@gmail.com';
  const transporter = getTransporter();

  // Email 1: Notification sent TO ADMIN (nainil9845patel@gmail.com)
  const adminAlertContent = {
    from: `"LegalMind AI Portal" <${adminEmail}>`,
    to: adminEmail,
    replyTo: email,
    subject: `🚨 [NEW INQUIRY TICKET ${ticketId}] - ${subject}`,
    text: `NEW INQUIRY RECEIVED FOR ADMIN:\n\nTicket ID: ${ticketId}\nFrom: ${name} (${email})\nPhone: ${phone || 'N/A'}\nCategory: ${category}\nPreferred Contact: ${preferredContact.toUpperCase()}\n\nSubject: ${subject}\nMessage:\n${message}\n\nSubmitted at: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050814; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b; padding: 28px;">
        <h2 style="color: #38bdf8; margin-top: 0;">🚨 New Contact Inquiry Received</h2>
        <p style="font-size: 13px; color: #94a3b8;">A new client ticket has been submitted to your admin dashboard.</p>
        
        <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
          <p style="margin: 4px 0;"><strong>Ticket ID:</strong> <span style="color: #38bdf8; font-family: monospace;">${ticketId}</span></p>
          <p style="margin: 4px 0;"><strong>Client Name:</strong> ${name}</p>
          <p style="margin: 4px 0;"><strong>Client Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${phone || 'Not Provided'}</p>
          <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 4px 0;"><strong>Preferred Contact Method:</strong> ${preferredContact.toUpperCase()}</p>
        </div>

        <div style="background-color: #090d1f; border-left: 4px solid #38bdf8; padding: 12px 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #38bdf8;">Subject: ${subject}</h4>
          <p style="margin: 0; white-space: pre-wrap; color: #f1f5f9; font-size: 14px;">"${message}"</p>
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">LegalMind AI Automated Support Alert • <a href="mailto:${email}" style="color: #38bdf8;">Click to Reply directly to ${name}</a></p>
      </div>
    `,
  };

  // Email 2: Confirmation sent TO USER (email)
  const userConfirmationContent = {
    from: `"LegalMind AI Support" <${adminEmail}>`,
    to: email,
    subject: `[${ticketId}] We received your inquiry: ${subject}`,
    text: `Hello ${name},\n\nThank you for reaching out to LegalMind AI Support. We have logged your request under Ticket ID: ${ticketId}.\n\nInquiry Details:\n- Subject: ${subject}\n- Category: ${category}\n- Preferred Contact: ${preferredContact.toUpperCase()}\n${phone ? `- Phone Number: ${phone}\n` : ''}\nYour Message:\n${message}\n\nOur team will review your inquiry and reach back to you shortly.\n\nBest Regards,\nLegalMind AI Operations Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050814; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b; padding: 28px;">
        <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">LegalMind AI Support</h2>
        <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: bold; margin-bottom: 8px;">TICKET REFERENCE: <span style="color: #38bdf8; font-family: monospace;">${ticketId}</span></div>
          <p style="margin: 0; font-size: 14px;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1;">Thank you for contacting LegalMind AI. We have received your submission and created an active support ticket.</p>
        </div>
        <div style="background-color: #090d1f; border-left: 3px solid #38bdf8; padding: 12px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 13px; font-style: italic;">"${message}"</p>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">We will respond to your registered email or phone number within 2 business hours.</p>
      </div>
    `,
  };

  if (transporter) {
    try {
      // Send both admin alert & user confirmation
      await transporter.sendMail(adminAlertContent);
      await transporter.sendMail(userConfirmationContent);
      console.log(`[EmailService] Admin Alert dispatched to ${adminEmail} and Confirmation to ${email} for Ticket ${ticketId}`);
      return { success: true, emailSent: true };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP: ${err.message}`);
      return { success: false, emailSent: false, error: err.message };
    }
  } else {
    console.log(`[EmailService - ADMIN LOG] Admin Inquiry Alert target: ${adminEmail}`);
    console.log(`  Ticket: ${ticketId}`);
    console.log(`  Sender: ${name} <${email}>`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Message: ${message}`);
    return { success: true, emailSent: true, simulated: true };
  }
};

module.exports = {
  sendContactEmails,
};
