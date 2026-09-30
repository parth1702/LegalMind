import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    setIsOpen(false);
    await logout();
    navigate('/auth/login');
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate('/app/profile');
  };

  const getInitials = (name) => {
    if (!name) return 'LM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative flex items-center">
      {/* Profile Trigger Pill */}
      <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
        {/* Clickable Profile Area -> Redirects to /app/profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-2.5 px-1.5 py-0.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
          title="View User Profile"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-blue-600 dark:bg-slate-900 rounded-[6px] flex items-center justify-center text-xs font-bold text-white dark:text-blue-400 font-mono overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover rounded-[5px]" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
          </div>

          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
              {user?.name || (user?.email ? user.email.split('@')[0] : 'System Super Admin')}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono capitalize">
              {user?.role || 'Admin'}
            </div>
          </div>
        </button>

        {/* Separator line */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Lower Arrow Button -> Toggles Dropdown (Only Sign Out inside) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Account Options"
          aria-label="Account options dropdown"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-blue-600 dark:text-sky-400' : ''}`} />
        </button>
      </div>

      {/* User Dropdown Menu (Only Sign Out) */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-1.5 space-y-1 animate-in fade-in duration-150">
            {/* Profile Info Header */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {user?.name || 'System Super Admin'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {user?.email || 'admin@legalmind.ai'}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-cyan-500/20 capitalize">
                <ShieldCheck className="w-3 h-3" /> {user?.role || 'Admin'}
              </div>
            </div>

            {/* ONLY Sign Out Option */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
