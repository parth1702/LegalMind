import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Sun, Moon } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import GlobalSearch from './GlobalSearch';
import NotificationsPopover from './NotificationsPopover';
import UserMenuDropdown from './UserMenuDropdown';
import { useTheme } from '../../context/ThemeContext';

export default function TopNavbar({ onMobileMenuOpen }) {
  const { theme, toggleLightDark } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors shadow-sm dark:shadow-none">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb className="hidden sm:flex" />
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-md mx-2">
        <GlobalSearch />
      </div>

      {/* Right: Controls & User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-[0.97] group"
          title="Back to Home"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Home</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleLightDark}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle light and dark theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <NotificationsPopover />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
        <UserMenuDropdown />
      </div>
    </header>
  );
}
