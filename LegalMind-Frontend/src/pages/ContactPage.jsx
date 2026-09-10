import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Headphones,
  FileText,
  User,
  Globe,
  Search,
  Edit3,
  History,
  Tag,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  CheckSquare,
} from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { submitContactForm, getUserInquiries, updateInquiry } from '../services/contactService';

export default function ContactPage() {
  const location = useLocation();
  const isInsideApp = location.pathname.startsWith('/app');

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'General Inquiry',
    preferredContact: 'email',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // History & Tracker State
  const [searchEmail, setSearchEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editFormData, setEditFormData] = useState({ subject: '', message: '', category: '', phone: '' });
  const [updating, setUpdating] = useState(false);

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Sales & Enterprise',
    'Legal Advisory',
    'Partnership & Demo',
  ];

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message content is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await submitContactForm(formData);
      if (response && response.success) {
        setSubmissionSuccess(response.data);
        // Also pre-fill search email for history tab
        setSearchEmail(formData.email);
      } else {
        setErrors({ submit: response?.message || 'Failed to send message. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Server connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingInquiries(true);
    try {
      const res = await getUserInquiries(searchEmail, searchQuery);
      if (res && res.success) {
        setInquiries(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const startEdit = (inquiry) => {
    setEditingInquiry(inquiry);
    setEditFormData({
      subject: inquiry.subject,
      message: inquiry.message,
      category: inquiry.category,
      phone: inquiry.phone || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingInquiry) return;

    setUpdating(true);
    try {
      const res = await updateInquiry(editingInquiry._id, editFormData);
      if (res && res.success) {
        setEditingInquiry(null);
        fetchHistory();
      }
    } catch (err) {
      alert('Failed to update inquiry: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleStatus = async (inquiry, newStatus) => {
    try {
      const res = await updateInquiry(inquiry._id, {
        status: newStatus,
        adminNotes: newStatus === 'resolved' ? 'Marked as resolved by user.' : inquiry.adminNotes,
      });
      if (res && res.success) {
        fetchHistory();
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: 'General Inquiry',
      preferredContact: 'email',
      message: '',
    });
    setSubmissionSuccess(null);
    setErrors({});
  };

  // Generate direct Gmail compose web link targeting nainil9845patel@gmail.com
  const getGmailLink = () => {
    const to = 'nainil9845patel@gmail.com';
    const subject = encodeURIComponent(formData.subject || 'LegalMind AI Inquiry');
    const body = encodeURIComponent(
      `Full Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCategory: ${formData.category}\nPreferred Contact: ${formData.preferredContact}\n\nMessage:\n${formData.message}`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Inquiry</span>
          </span>
        );
    }
  };

  return (
    <div className={isInsideApp ? "space-y-8 animate-in fade-in duration-200" : "min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950"}>
      {/* Top Header Navbar - Only render on standalone public route */}
      {!isInsideApp && <LandingNavbar />}

      {/* Main Container */}
      <main className={isInsideApp ? "space-y-10" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12"}>
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Client Support & Ticket Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Contact <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">LegalMind AI</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Send us a direct inquiry via email or phone, or track past submitted tickets and view official support responses in real-time.
          </p>

          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'submit'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Submit New Inquiry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Inquiry History & Tracker</span>
            </button>
          </div>
        </div>

        {/* Quick Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Email Contact */}
          <div className="p-6 rounded-2xl bg-[#090d1f]/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Email Us</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct mail inbox for legal teams & general support.
              </p>
            </div>
            <div className="bg-[#050814] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <a
                href="mailto:nainil9845patel@gmail.com"
                className="text-xs font-mono font-semibold text-cyan-300 hover:underline truncate"
              >
                nainil9845patel@gmail.com
              </a>
              <button
                type="button"
                onClick={() => handleCopy('nainil9845patel@gmail.com', 'email')}
                className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-md transition-colors shrink-0"
                title="Copy Email"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Response Time: &lt; 2 Hours</span>
            </div>
          </div>

          {/* Card 2: Phone Number Contact */}
          <div className="p-6 rounded-2xl bg-[#090d1f]/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 shadow-xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Phone Support</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Immediate phone helpline for legal emergencies & sales.
              </p>
            </div>
            <div className="bg-[#050814] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <a
                href="tel:+18005550199"
                className="text-xs font-mono font-semibold text-indigo-300 hover:underline truncate"
              >
                +1 (800) 555-0199
              </a>
              <button
                type="button"
                onClick={() => handleCopy('+1 (800) 555-0199', 'phone')}
                className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-md transition-colors shrink-0"
                title="Copy Phone Number"
              >
                {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mon - Fri: 9:00 AM - 8:00 PM EST</span>
            </div>
          </div>

          {/* Card 3: AI Legal Assistant Direct */}
          <div className="p-6 rounded-2xl bg-[#090d1f]/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Instant AI Assistant</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Get real-time contract analysis and legal query responses.
              </p>
            </div>
            <Link
              to="/app/assistant"
              className="w-full btn btn-secondary btn-sm justify-center text-emerald-400 hover:text-emerald-300 gap-2 font-semibold"
            >
              <span>Chat with AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Available 24/7/365</span>
            </div>
          </div>
        </div>

        {/* TAB 1: FORM SUBMISSION */}
        {activeTab === 'submit' && (
          <div className="bg-[#070b19] rounded-3xl border border-slate-800/90 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

            {submissionSuccess ? (
              /* Success Ticket Summary State */
              <div className="max-w-2xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Message Sent Successfully!
                  </h2>
                  <p className="text-slate-300 text-sm">
                    We have logged your request and sent a notification email to <strong className="text-cyan-300">nainil9845patel@gmail.com</strong>.
                  </p>
                </div>

                {/* Ticket Details Badge Box */}
                <div className="bg-[#050814] rounded-2xl border border-slate-800 p-6 text-left space-y-4 max-w-lg mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Support Ticket ID</span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-xs font-bold">
                      {submissionSuccess.ticketId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">Name</span>
                      <span className="font-semibold text-slate-200">{submissionSuccess.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Email</span>
                      <span className="font-semibold text-cyan-300">{submissionSuccess.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Category</span>
                      <span className="font-semibold text-slate-200">{submissionSuccess.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Preferred Contact</span>
                      <span className="font-semibold text-indigo-300 uppercase">{submissionSuccess.preferredContact}</span>
                    </div>
                    {submissionSuccess.phone && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-mono">Phone Number</span>
                        <span className="font-semibold text-slate-200">{submissionSuccess.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a
                    href={getGmailLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-md w-full sm:w-auto shadow-lg shadow-cyan-500/20 text-slate-950 font-bold gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Send Email to nainil9845patel@gmail.com</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="btn btn-secondary btn-md w-full sm:w-auto text-cyan-300"
                  >
                    <History className="w-4 h-4" />
                    <span>View in Inquiry Tracker</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost btn-md w-full sm:w-auto text-slate-300"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              /* Active Contact Form */
              <div className="space-y-8">
                <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <span>Send Us a Direct Inquiry</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Messages are saved to our support system and sent directly to <strong className="text-cyan-300 font-mono">nainil9845patel@gmail.com</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure & Confidential</span>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Sarah Jenkins"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050814] border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.name ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                      {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
                    </div>

                    {/* Work Email */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Email Address <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. sarah@firmname.com"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050814] border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.email ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-[11px] text-rose-400">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Row 2: Phone & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +1 (555) 234-5678"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Inquiry Category */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preferred Contact Method Radio Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Preferred Contact Method
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Email Response</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Phone Call</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="any"
                          checked={formData.preferredContact === 'any'}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Either Email or Phone</span>
                      </label>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Subject / Topic <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Inquiry regarding Enterprise API Access and SLA"
                      className={`w-full px-4 py-2.5 rounded-xl bg-[#050814] border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                        errors.subject ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.subject && <p className="text-[11px] text-rose-400">{errors.subject}</p>}
                  </div>

                  {/* Detailed Message */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Detailed Message <span className="text-cyan-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formData.message.length}/3000 chars
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please detail your question, requirements, or issue here..."
                      className={`w-full px-4 py-3 rounded-xl bg-[#050814] border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-y ${
                        errors.message ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.message && <p className="text-[11px] text-rose-400">{errors.message}</p>}
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <a
                      href={getGmailLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-md text-xs gap-2 font-semibold text-slate-200 hover:text-white hover:border-cyan-500/40 w-full sm:w-auto"
                      title="Open pre-filled Gmail compose window targeting nainil9845patel@gmail.com"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>Send Copy via Gmail Web</span>
                    </a>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20 min-w-[200px] justify-center w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Inquiry</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INQUIRY HISTORY & TRACKER */}
        {activeTab === 'history' && (
          <div className="bg-[#070b19] rounded-3xl border border-slate-800/90 p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span>Inquiry History & Ticket Tracker</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  View past submitted inquiries, monitor support team actions, and update open tickets.
                </p>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loadingInquiries}
                className="btn btn-secondary btn-sm gap-2 text-slate-300 shrink-0 self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            {/* Filter Search Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#050814] p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Filter by Email</label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="e.g. sarah@firmname.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#090d1f] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Ticket ID or Keyword</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. TKT-2026-7849 or API"
                  className="w-full px-3 py-2 rounded-xl bg-[#090d1f] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-end sm:col-span-1">
                <button type="submit" className="btn btn-primary btn-md w-full justify-center text-xs">
                  <Search className="w-4 h-4" />
                  <span>Search Tickets</span>
                </button>
              </div>
            </form>

            {/* Inquiries List */}
            {loadingInquiries ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs font-mono">Fetching support tickets database...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3 bg-[#050814]/50 rounded-2xl border border-slate-800/80">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Contact Tickets Found</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Submit a new inquiry using the form tab above, or filter by your email address to view logged tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((item) => (
                  <div
                    key={item._id}
                    className="p-6 rounded-2xl bg-[#050814] border border-slate-800/90 hover:border-slate-700 transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg">
                          {item.ticketId}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{item.category}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Subject & Message */}
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-slate-100">{item.subject}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#090d1f] p-3 rounded-xl border border-slate-800/60 font-mono">
                        "{item.message}"
                      </p>
                    </div>

                    {/* User Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1 border-t border-slate-800/60 text-slate-400">
                      <div>
                        <span className="block text-[11px] font-mono text-slate-500">Submitted By</span>
                        <span className="text-slate-200 font-semibold">{item.name}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono text-slate-500">Email</span>
                        <span className="text-cyan-400 font-semibold">{item.email}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono text-slate-500">Preferred Method</span>
                        <span className="text-indigo-300 uppercase font-semibold">{item.preferredContact}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono text-slate-500">Phone</span>
                        <span className="text-slate-200 font-semibold">{item.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Admin Action Notes Section */}
                    {item.adminNotes && (
                      <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-1">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold uppercase text-[11px]">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Support Team Note & Action Taken</span>
                        </div>
                        <p className="text-slate-300">{item.adminNotes}</p>
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="btn btn-ghost btn-xs text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Inquiry</span>
                      </button>

                      {item.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => toggleStatus(item, 'resolved')}
                          className="btn btn-secondary btn-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleStatus(item, 'in_progress')}
                          className="btn btn-ghost btn-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reopen Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDIT INQUIRY MODAL */}
        {editingInquiry && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d1f] rounded-2xl border border-slate-800 max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  <span>Edit Inquiry [{editingInquiry.ticketId}]</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Subject</label>
                  <input
                    type="text"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Detailed Message</label>
                  <textarea
                    rows={4}
                    value={editFormData.message}
                    onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingInquiry(null)}
                    className="btn btn-ghost btn-sm text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary btn-sm min-w-[120px] justify-center"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Footer - Only render on standalone public route */}
      {!isInsideApp && <LandingFooter />}
    </div>
  );
}
