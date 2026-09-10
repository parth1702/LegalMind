import React, { useState } from 'react';
import { Bell, ShieldAlert, Sparkles, CheckCircle2, FileText } from 'lucide-react';

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 1,
      type: 'high-risk',
      title: 'High Risk Clause Anomaly',
      message: 'Unilateral liability clause flagged in Commercial MSA agreement.',
      time: '12m ago',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
    },
    {
      id: 2,
      type: 'ai',
      title: 'AI Analysis Complete',
      message: 'Document extraction finished for Employment_Agreement_v3.pdf.',
      time: '45m ago',
      icon: Sparkles,
      iconColor: 'text-cyan-400',
    },
    {
      id: 3,
      type: 'system',
      title: 'Security Audit Logged',
      message: 'SOC2 Compliance audit scan finished cleanly with 0 vulnerabilities.',
      time: '2h ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="Notifications menu"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0b1021] border border-slate-800 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in duration-150">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#070b18]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Notifications
                </span>
                <span className="badge badge-ai text-[10px]">{unreadCount} New</span>
              </div>
              <button
                type="button"
                onClick={() => setUnreadCount(0)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            </div>

            {/* Notification Items */}
            <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
              {notifications.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-slate-900/60 transition-colors flex items-start gap-3 cursor-pointer"
                  >
                    <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${item.iconColor} shrink-0 mt-0.5`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{item.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
              <span className="text-[11px] font-mono text-slate-500">LegalMind Security & Activity Stream</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
