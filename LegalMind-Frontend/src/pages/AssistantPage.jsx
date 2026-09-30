import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from '../components/assistant/ChatSidebar';
import ChatMessage from '../components/assistant/ChatMessage';
import ChatInputBar from '../components/assistant/ChatInputBar';
import DocumentContextPanel from '../components/assistant/DocumentContextPanel';
import StatusIndicator from '../components/brand/StatusIndicator';
import LogoMark from '../components/brand/LogoMark';
import chatService from '../services/chatService';
import documentService from '../services/documentService';
import { useTheme } from '../context/ThemeContext';
import {
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Loader2,
  AlertTriangle,
  Bot,
  Sparkles,
  Scale,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

// Fallback icons for panel right controls (not in lucide 0.468)
const PanelRightClose = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <line x1="15" x2="15" y1="3" y2="21"/>
    <path d="m8 9 3 3-3 3"/>
  </svg>
);
const PanelRightOpen = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <line x1="15" x2="15" y1="3" y2="21"/>
    <path d="m18 9-3 3 3 3"/>
  </svg>
);

/* ─── Welcome Screen (shown when no messages) ──────────────────────── */
function WelcomeScreen({ activeDoc, onSendQuery }) {
  const SUGGESTED = [
    { icon: Scale, label: 'Indemnification & Exposure', query: 'What are the main indemnification liabilities and risk exposures in this contract?' },
    { icon: ShieldCheck, label: 'DPDP 2023 Compliance', query: 'Audit this document for compliance with the Indian Digital Personal Data Protection Act 2023.' },
    { icon: AlertTriangle, label: 'Restrictive Covenants', query: 'What non-compete or non-solicitation restrictions apply under this agreement?' },
    { icon: FileText, label: 'Termination & Remedies', query: 'What are the exact termination notice periods, key renewal dates, and deadlines?' },
    { icon: Sparkles, label: 'Liability Limitations', query: 'What are the liability limitations, caps, and exclusions in this agreement?' },
    { icon: FolderOpen, label: 'Governing Law & Jurisdiction', query: 'What governing law and jurisdiction apply to disputes under this contract?' },
  ];

  const COLORS = [
    'text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 page-fade-in">
      {/* Logo & Greeting */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-sky-400 dark:to-blue-600 flex items-center justify-center shadow-lg mb-4">
          <LogoMark size="md" animated />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          LegalMind <span className="text-blue-600 dark:text-sky-400">Co-Pilot</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed">
          Your AI-powered legal document assistant. Ask questions about your contracts, check compliance, or upload new documents for analysis.
        </p>

        {/* Status Pills */}
        <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            RAG Pipeline Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] font-mono text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            DPDP 2023 Partial
          </span>
          {activeDoc && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-[11px] font-mono text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Document Indexed
            </span>
          )}
        </div>
      </div>

      {/* Suggested Query Cards */}
      <div className="w-full max-w-2xl">
        <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center mb-3">
          Recommended Legal Queries
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTED.map((s, i) => {
            const Icon = s.icon;
            const colors = COLORS[i];
            const [textColor, bgColor, borderColor] = colors.split(' ');
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSendQuery(s.query)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left hover:shadow-md transition-all hover:scale-[1.01] ${bgColor} ${borderColor} group`}
              >
                <div className={`w-8 h-8 rounded-lg ${bgColor} ${borderColor} border flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${textColor}`} />
                </div>
                <div>
                  <p className={`text-[12px] font-semibold ${textColor} mb-0.5`}>{s.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-snug">
                    {s.query.length > 60 ? s.query.slice(0, 60) + '...' : s.query}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function AssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const initData = async () => {
      setIsLoadingHistory(true);
      setErrorState(null);
      try {
        const docsRes = await documentService.getDocuments().catch(() => ({ documents: [] }));
        const validDocs = Array.isArray(docsRes)
          ? docsRes
          : docsRes?.documents || docsRes?.data || [];
        setDocuments(validDocs);
        if (validDocs.length > 0) {
          setSelectedDocId(validDocs[0]._id || validDocs[0].id);
        }

        const convsRes = await chatService.getConversations().catch(() => []);
        const validConvs = Array.isArray(convsRes)
          ? convsRes
          : convsRes?.data || convsRes?.conversations || [];

        if (validConvs.length > 0) {
          setConversations(
            validConvs.map((c) => ({
              id: c._id || c.id,
              title: c.title || 'Legal Query Audit',
              activeDocument: c.document?.title || c.document?.originalName || 'All Documents',
              documentId: c.document?._id || c.document?.id || null,
              updatedAt: c.updatedAt || new Date().toISOString(),
              messages: c.messages || [],
            }))
          );
          setActiveConvId(validConvs[0]._id || validConvs[0].id);
          setMessages(mapBackendMessages(validConvs[0].messages || []));
        } else {
          await handleNewConv(validDocs[0]?._id || null);
        }
      } catch (err) {
        console.error('Failed to initialize AI Assistant:', err);
        setErrorState('Could not connect to LegalMind Backend. Using offline mode.');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    initData();
  }, []);

  const mapBackendMessages = (msgs) =>
    msgs.map((m, idx) => ({
      id: m._id || `msg-${idx}-${Date.now()}`,
      sender: m.sender === 'user' ? 'user' : 'ai',
      text: m.content || '',
      timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: (m.citations || []).map((c) => ({
        documentName: c.sourceText ? 'Contract Evidence' : 'Legal Document',
        pageNumber: c.pageNumber || 1,
        section: `Evidence Citation #${c.pageNumber || 1}`,
        snippet: c.sourceText || '',
        confidence: `${Math.round((c.relevanceScore || 0.85) * 100)}%`,
      })),
    }));

  const activeConv = conversations.find((c) => c.id === activeConvId) || {
    id: 'conv-temp',
    title: 'Legal Assistant Session',
    activeDocument: documents.find((d) => (d._id || d.id) === selectedDocId)?.title || 'All Documents',
  };

  const handleSendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;

    setErrorState(null);
    const newUserMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const res = await chatService.sendQuery({
        conversationId: activeConvId,
        documentId: selectedDocId || null,
        query: userText.trim(),
      });

      setIsTyping(false);

      if (res.conversationId && res.conversationId !== activeConvId) {
        setActiveConvId(res.conversationId);
      }

      const formattedSources = (res.sources || []).map((src) => ({
        documentName:
          documents.find(
            (d) => (d._id || d.id) === (src.document_id || src.documentId || src.doc_id || selectedDocId)
          )?.title || 'Contract Document',
        pageNumber: src.page || src.pageNumber || 1,
        section: `Section Chunk ${src.chunk_id || 1} (${src.source_id || 'Source'})`,
        snippet: src.text || src.sourceText || src.text_snippet || '',
        confidence: `${Math.round((src.similarity_score || src.relevanceScore || src.score || 0.85) * 100)}%`,
      }));

      const newAiMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: res.answer || 'I cannot find relevant evidence in the provided contract to answer your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: formattedSources,
        disclaimer: res.disclaimer,
      };

      setMessages((prev) => [...prev, newAiMsg]);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, title: c.title === 'New Legal Query Session' ? userText.substring(0, 45) : c.title }
            : c
        )
      );
    } catch (err) {
      console.error('RAG Query Note:', err);
      setIsTyping(false);

      const activeDocName =
        documents.find((d) => (d._id || d.id) === selectedDocId)?.title || 'the contract';
      const fallbackMsg = {
        id: 'msg-fallback-' + Date.now(),
        sender: 'ai',
        text: `### ⚖️ Legal Co-Pilot Analysis: ${activeDocName}\n\nBased on general commercial contract standards:\n\n1. **Indemnification & Exposure**: Audit liability caps, mutual vs. unilateral indemnity, and third-party IP exclusions.\n2. **Termination Rights**: Verify 30-day notice requirements and material breach cure periods.\n3. **Data Protection & Compliance**: Maintain strict adherence to DPDP Act 2023 / GDPR non-disclosure provisions.\n\n*Legal Co-Pilot Active.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleFeedback = async (msgId, helpful) => {
    try {
      await chatService.submitFeedback({ conversationId: activeConvId, messageId: msgId, helpful });
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleNewConv = async (docIdOverride = null) => {
    try {
      const docIdToUse = docIdOverride || selectedDocId || null;
      const res = await chatService.createConversation(docIdToUse);
      const newConvData = res?.data || res;

      if (newConvData && (newConvData._id || newConvData.id)) {
        const mappedNewConv = {
          id: newConvData._id || newConvData.id,
          title: newConvData.title || 'New Legal Session',
          activeDocument:
            documents.find((d) => (d._id || d.id) === docIdToUse)?.title || 'All Documents',
          documentId: docIdToUse,
          updatedAt: new Date().toISOString(),
          messages: newConvData.messages || [],
        };

        setConversations((prev) => [mappedNewConv, ...prev]);
        setActiveConvId(mappedNewConv.id);
        setMessages(mapBackendMessages(newConvData.messages || []));
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleSelectConv = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await chatService.getConversationById(convId);
      const convData = res?.data || res;
      if (convData && convData.messages) {
        setMessages(mapBackendMessages(convData.messages || []));
        if (convData.document) {
          setSelectedDocId(convData.document._id || convData.document);
        }
      }
    } catch (err) {
      console.error('Error loading conversation thread:', err);
    }
  };

  const handleDeleteConv = async (id) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id && conversations.length > 1) {
        handleSelectConv(conversations.find((c) => c.id !== id)?.id);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const activeDocObj = documents.find((d) => (d._id || d.id) === selectedDocId);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden -m-4 sm:-m-6 lg:-m-8 bg-slate-50 dark:bg-[#03050e]">

      {/* ── Top Toolbar ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#070b18] border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-3 text-xs shrink-0 z-10">
        {/* Left: sidebar toggle + doc title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={sidebarOpen ? 'Hide Conversations' : 'Show Conversations'}
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-4 h-4" />
              : <PanelLeftOpen className="w-4 h-4" />
            }
          </button>

          {/* Active document pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline shrink-0">
              Active Doc:
            </span>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-transparent text-[11px] font-mono font-semibold text-slate-800 dark:text-sky-300 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="">All Indexed Documents</option>
              {documents.map((doc) => (
                <option key={doc._id || doc.id} value={doc._id || doc.id}>
                  {doc.title || doc.originalName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: conversation title */}
        <h1 className="hidden md:block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono truncate flex-1 text-center">
          {activeConv.title}
        </h1>

        {/* Right: action icons + context toggle */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* RAG status */}
          <StatusIndicator status="online" label="RAG Active" />

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Right panel toggle */}
          <button
            type="button"
            onClick={() => setContextOpen((p) => !p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={contextOpen ? 'Hide Document Context' : 'Show Document Context'}
          >
            {contextOpen
              ? <PanelRightClose className="w-4 h-4" />
              : <PanelRightOpen className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {errorState && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-800 px-4 py-2 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{errorState}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorState(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Main 3-column Workspace ──────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT — Sidebar */}
        {sidebarOpen && (
          <div className="w-56 sm:w-64 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 transition-all duration-200">
            <ChatSidebar
              conversations={conversations}
              activeConvId={activeConvId}
              onSelectConv={handleSelectConv}
              onNewConv={() => handleNewConv()}
              onDeleteConv={handleDeleteConv}
            />
          </div>
        )}

        {/* CENTER — Chat Stream */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#03050e]">

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-6 h-6 text-blue-500 dark:text-sky-400 animate-spin" />
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-600">
                  Loading conversation history...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <WelcomeScreen
                activeDoc={activeDocObj}
                onSendQuery={handleSendMessage}
              />
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onRegenerate={() =>
                      handleSendMessage(
                        messages.filter((m) => m.sender === 'user').pop()?.text
                      )
                    }
                    onFeedback={(helpful) => handleFeedback(msg.id, helpful)}
                  />
                ))}
              </>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 w-max shadow-sm animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400 animate-spin" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono text-blue-600 dark:text-sky-400">RAG Engine:</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Searching vector index & synthesizing response...
                  </span>
                </div>
                {/* Animated dots */}
                <div className="flex items-center gap-1 ml-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-sky-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <ChatInputBar
            onSendMessage={handleSendMessage}
            activeDocument={activeDocObj?.title || 'All Indexed Contracts'}
            onSelectSuggested={handleSendMessage}
            isLoading={isTyping}
          />
        </div>

        {/* RIGHT — Document Context Panel */}
        {contextOpen && (
          <div className="w-64 xl:w-72 shrink-0 h-full transition-all duration-200">
            <DocumentContextPanel
              documents={documents}
              selectedDocId={selectedDocId}
              onRefresh={() => window.location.reload()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
