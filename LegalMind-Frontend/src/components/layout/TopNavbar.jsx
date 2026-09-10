import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import GlobalSearch from './GlobalSearch';
import NotificationsPopover from './NotificationsPopover';
import UserMenuDropdown from './UserMenuDropdown';

export default function TopNavbar({ onMobileMenuOpen }) {
  return (
    <header className="h-16 bg-[#070b18]/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Section: Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumb className="hidden sm:flex" />
      </div>

      {/* Center Section: Global Search Trigger */}
      <div className="flex-1 max-w-md mx-2">
        <GlobalSearch />
      </div>

      {/* Right Section: Controls & User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          to="/"
          className="btn btn-ghost btn-xs text-slate-400 hover:text-cyan-300 gap-1.5 font-mono hidden md:flex"
          title="Back to Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <NotificationsPopover />
        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />
        <UserMenuDropdown />
      </div>
    </header>
  );
}
