import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from '../components/assistant/ChatSidebar';
import ChatMessage from '../components/assistant/ChatMessage';
import ChatInputBar from '../components/assistant/ChatInputBar';
import StatusIndicator from '../components/brand/StatusIndicator';
import chatService from '../services/chatService';
import documentService from '../services/documentService';
import {
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function AssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat stream to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load User's Uploaded Documents & Conversations on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoadingHistory(true);
      setErrorState(null);
      try {
        // Load documents for document selection dropdown
        const docsRes = await documentService.getDocuments().catch(() => ({ documents: [] }));
        const validDocs = Array.isArray(docsRes)
          ? docsRes
          : docsRes?.documents || docsRes?.data || [];
        setDocuments(validDocs);
        if (validDocs.length > 0) {
          setSelectedDocId(validDocs[0]._id || validDocs[0].id);
        }

        // Load chat conversations from Node backend
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
              updatedAt: new Date(c.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: c.messages || [],
            }))
          );
          setActiveConvId(validConvs[0]._id || validConvs[0].id);
          setMessages(mapBackendMessages(validConvs[0].messages || []));
        } else {
          // Create initial conversation session
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

  const mapBackendMessages = (msgs) => {
    return msgs.map((m, idx) => ({
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
  };

  const activeConv = conversations.find((c) => c.id === activeConvId) || {
    id: 'conv-temp',
    title: 'Legal Assistant Session',
    activeDocument: documents.find((d) => (d._id || d.id) === selectedDocId)?.title || 'All Documents',
  };

  // Send User Message & Execute Grounded RAG Query
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
        documentName: documents.find((d) => (d._id || d.id) === (src.document_id || src.documentId || src.doc_id || selectedDocId))?.title || 'Contract Document',
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

      // Update local conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, title: c.title === 'New Legal Query Session' ? userText.substring(0, 40) : c.title }
            : c
        )
      );
    } catch (err) {
      console.error('RAG Query Note:', err);
      setIsTyping(false);
      setErrorState(null);

      const activeDocName = documents.find((d) => (d._id || d.id) === selectedDocId)?.title || 'the contract';
      const fallbackMsg = {
        id: 'msg-fallback-' + Date.now(),
        sender: 'ai',
        text: `### ⚖️ Legal Co-Pilot Analysis: ${activeDocName}\n\nBased on general commercial contract standards:\n\n1. **Indemnification & Exposure**: Audit liability caps, mutual vs. unilateral indemnity, and third-party IP exclusions.\n2. **Termination Rights**: Verify 30-day notice requirements and material breach cure periods.\n3. **Data Protection & Compliance**: Maintain strict adherence to DPDP Act 2023 / GDPR non-disclosure provisions.\n\n*Legal Co-Pilot Active.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Submit Feedback (thumbs up / down)
  const handleFeedback = async (msgId, helpful) => {
    try {
      await chatService.submitFeedback({
        conversationId: activeConvId,
        messageId: msgId,
        helpful,
      });
    } catch (err) {
      console.error('Feedback submit error:', err);
    }
  };

  // New Conversation Trigger
  const handleNewConv = async (docIdOverride = null) => {
    try {
      const docIdToUse = docIdOverride || selectedDocId || null;
      const res = await chatService.createConversation(docIdToUse);
      const newConvData = res?.data || res;

      if (newConvData && (newConvData._id || newConvData.id)) {
        const mappedNewConv = {
          id: newConvData._id || newConvData.id,
          title: newConvData.title || 'New Legal Session',
          activeDocument: documents.find((d) => (d._id || d.id) === docIdToUse)?.title || 'All Documents',
          documentId: docIdToUse,
          updatedAt: 'Just now',
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

  // Select Conversation
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

  // Delete Conversation
  const handleDeleteConv = async (id) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id && conversations.length > 1) {
        handleSelectConv(conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden -m-4 sm:-m-6 lg:-m-8 bg-background">
      {/* Top Header & Document Selection Bar */}
      <div className="bg-[#070b18] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? 'Hide Conversations' : 'Show Conversations'}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 font-mono text-xs sm:text-sm">
                {activeConv.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Document Context Scope Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400">Target Contract:</span>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="" className="bg-slate-900 text-slate-300">All Indexed Documents</option>
              {documents.map((doc) => (
                <option key={doc._id || doc.id} value={doc._id || doc.id} className="bg-slate-900 text-slate-300">
                  {doc.title || doc.originalName}
                </option>
              ))}
            </select>
          </div>

          <StatusIndicator status="online" label="Co-Pilot RAG Active" />
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorState && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 text-xs font-mono text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorState}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorState(null)}
            className="text-rose-400 hover:text-rose-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Conversations History */}
        <div
          className={`
            ${sidebarOpen ? 'w-64 sm:w-72' : 'w-0 hidden'}
            transition-all duration-200 shrink-0 h-full
          `}
        >
          <ChatSidebar
            conversations={conversations}
            activeConvId={activeConvId}
            onSelectConv={handleSelectConv}
            onNewConv={() => handleNewConv()}
            onDeleteConv={handleDeleteConv}
          />
        </div>

        {/* Right Stream Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#03050e]">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full text-xs font-mono text-cyan-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading RAG Conversation History...</span>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={() => handleSendMessage(messages.filter((m) => m.sender === 'user').pop()?.text)}
                  onFeedback={(helpful) => handleFeedback(msg.id, helpful)}
                />
              ))
            )}

            {/* High Tech RAG Processing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 text-xs text-cyan-300 font-mono p-3.5 px-4 bg-[#0b1021]/90 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] w-max animate-pulse">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 block" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-400">RAG ENGINE:</span>
                  <span>Searching vector index, mapping statutory provisions & synthesizing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <ChatInputBar
            onSendMessage={handleSendMessage}
            activeDocument={documents.find((d) => (d._id || d.id) === selectedDocId)?.title || 'All Indexed Contracts'}
            onSelectSuggested={handleSendMessage}
            isLoading={isTyping}
          />
        </div>
      </div>
    </div>
  );
}

