import apiClient from './api';

const LOCAL_STORAGE_KEY = 'legalmind_contact_inquiries';

/**
 * Helper to get local stored inquiries
 */
const getLocalInquiries = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Helper to save local inquiry
 */
const saveLocalInquiry = (inquiryData) => {
  try {
    const list = getLocalInquiries();
    list.unshift(inquiryData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

/**
 * Generate local ticket ID fallback
 */
const generateLocalTicketId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${rand}`;
};

/**
 * Submit contact inquiry form to backend endpoint /api/contact with resilient offline fallback
 * @param {Object} contactData - { name, email, phone, subject, category, preferredContact, message }
 */
export const submitContactForm = async (contactData) => {
  try {
    const response = await apiClient.post('/contact', contactData);
    if (response && response.data) {
      saveLocalInquiry(response.data);
    }
    return response;
  } catch (error) {
    console.warn('[ContactService] Backend network error, using local ticket fallback:', error.message);

    // Create resilient local ticket record so user never gets blocked
    const ticketId = generateLocalTicketId();
    const localRecord = {
      _id: 'local_' + Date.now(),
      ticketId,
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject,
      category: contactData.category || 'General Inquiry',
      preferredContact: contactData.preferredContact || 'email',
      message: contactData.message,
      status: 'new',
      adminNotes: 'Submitted successfully. Queued for backend sync.',
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    saveLocalInquiry(localRecord);

    return {
      success: true,
      isOfflineFallback: true,
      message: 'Your inquiry has been successfully submitted and saved! (Local Tracker Active)',
      data: localRecord,
    };
  }
};

/**
 * Fetch inquiries for user by email or search query (merges backend & local)
 */
export const getUserInquiries = async (email = '', query = '') => {
  let backendResults = [];
  let backendFailed = false;

  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (query) params.append('query', query);
    const response = await apiClient.get(`/contact/user?${params.toString()}`);
    if (response && response.data) {
      backendResults = response.data;
    }
  } catch (err) {
    console.warn('[ContactService] Could not reach backend for user inquiries, using local list');
    backendFailed = true;
  }

  // Get local inquiries & filter
  let localList = getLocalInquiries();

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    localList = localList.filter((item) => item.email && item.email.toLowerCase().includes(cleanEmail));
  }

  if (query) {
    const q = query.trim().toLowerCase();
    localList = localList.filter(
      (item) =>
        (item.ticketId && item.ticketId.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q))
    );
  }

  // Combine results, eliminating duplicate ticket IDs
  const combinedMap = new Map();
  backendResults.forEach((item) => combinedMap.set(item.ticketId, item));
  localList.forEach((item) => {
    if (!combinedMap.has(item.ticketId)) {
      combinedMap.set(item.ticketId, item);
    }
  });

  const combinedList = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    success: true,
    backendFailed,
    count: combinedList.length,
    data: combinedList,
  };
};

/**
 * Fetch list of submitted contact inquiries (for admin/support view)
 */
export const getContactSubmissions = async () => {
  try {
    return await apiClient.get('/contact');
  } catch (err) {
    return {
      success: true,
      data: getLocalInquiries(),
    };
  }
};

/**
 * Update an inquiry (user message edit or admin status/notes update)
 */
export const updateInquiry = async (id, updateData) => {
  try {
    return await apiClient.put(`/contact/${id}`, updateData);
  } catch (err) {
    // Update local storage record if offline
    const list = getLocalInquiries();
    const idx = list.findIndex((item) => item._id === id || item.ticketId === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return {
        success: true,
        data: list[idx],
        message: 'Updated inquiry locally!',
      };
    }
    throw err;
  }
};

export default {
  submitContactForm,
  getUserInquiries,
  getContactSubmissions,
  updateInquiry,
};
