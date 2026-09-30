import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  FileText,
  Clock,
  Bot,
} from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr || dateStr === 'Just now') return 'Just now';
  const now = Date.now();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function ChatSidebar({
  conversations,
  activeConvId,
  onSelectConv,
  onNewConv,
  onDeleteConv,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.activeDocument || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#070b18] border-r border-slate-200 dark:border-slate-800 overflow-hidden select-none">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-sky-500 dark:to-blue-600 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">AI Assistant</p>
            <p className="text-[10px] font-mono text-blue-600 dark:text-sky-400 leading-tight">LegalMind Co-Pilot</p>
          </div>
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={onNewConv}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-400 dark:focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Recent Chats Label */}
      <div className="px-4 mb-1">
        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          Recent Chats
        </span>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-[11px] text-slate-400 dark:text-slate-600 font-mono">No conversations yet</p>
          </div>
        )}

        {filtered.map((conv) => {
          const isActive = conv.id === activeConvId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConv(conv.id)}
              className={`relative group px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <MessageSquare className={`w-3 h-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-[11px] font-semibold truncate leading-snug ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {conv.title}
                  </p>
                  {conv.activeDocument && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <FileText className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 truncate">
                        {conv.activeDocument}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">
                      {timeAgo(conv.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete on hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConv(conv.id);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
