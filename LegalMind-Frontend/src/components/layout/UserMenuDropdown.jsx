import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, ShieldCheck, LogOut, ChevronDown, Globe } from 'lucide-react';
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
    <div className="relative">
      {/* User Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-sm overflow-hidden">
          <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-xs font-bold text-cyan-300 font-mono overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover rounded-[5px]" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
        </div>

        <div className="hidden lg:block text-left leading-tight">
          <div className="text-xs font-semibold text-slate-200">{user?.name || 'Legal Counsel'}</div>
          <div className="text-[10px] text-slate-400 font-mono capitalize">{user?.role || 'Attorney'}</div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {/* User Menu Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 bg-[#0b1021] border border-slate-800 rounded-2xl shadow-2xl z-40 p-1.5 space-y-1 animate-in fade-in duration-150">
            {/* Profile Info Header */}
            <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
              <div className="text-xs font-bold text-slate-100">{user?.name || 'Legal Counsel'}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'counsel@legalmind.ai'}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 capitalize">
                <ShieldCheck className="w-3 h-3" /> {user?.role || 'Attorney'}
              </div>
            </div>

            {/* Menu Links */}
            {user?.role === 'admin' && (
              <Link
                to="/app/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors mb-1"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              to="/app/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>User Profile</span>
            </Link>

            <Link
              to="/app/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>System Settings</span>
            </Link>

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Back to Home</span>
            </Link>

            <div className="border-t border-slate-800/80 my-1" />

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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
