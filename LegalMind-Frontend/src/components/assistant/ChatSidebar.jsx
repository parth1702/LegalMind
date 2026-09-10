import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Trash2, ChevronRight, FileText } from 'lucide-react';

export default function ChatSidebar({
  conversations,
  activeConvId,
  onSelectConv,
  onNewConv,
  onDeleteConv,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.activeDocument.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#070b18] border-r border-slate-800 flex flex-col justify-between overflow-hidden">
      {/* Top Action & Search */}
      <div className="p-3.5 space-y-3 border-b border-slate-800 bg-[#050814]">
        <button
          type="button"
          onClick={onNewConv}
          className="btn btn-primary btn-md w-full justify-center shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input-base pl-8 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Conversations History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block px-1 mb-1">
          Recent Legal Audits ({filtered.length})
        </span>

        {filtered.map((conv) => {
          const isActive = conv.id === activeConvId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConv(conv.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 group flex items-center justify-between ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-xs truncate block font-bold">{conv.title}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{conv.activeDocument}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConv(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity shrink-0"
                title="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-[#050814] text-[10px] font-mono text-slate-500 text-center">
        LegalMind AI Co-Pilot Active
      </div>
    </div>
  );
}
