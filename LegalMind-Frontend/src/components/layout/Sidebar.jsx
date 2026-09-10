import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Sparkles,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Globe,
  Home,
  Headphones,
  Info,
  ShieldCheck,
} from 'lucide-react';
import Logo from '../brand/Logo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    name: 'Dashboard',
    path: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Documents',
    path: '/app/documents',
    icon: FileText,
  },
  {
    name: 'AI Risk Analysis',
    path: '/app/analysis',
    icon: BarChart3,
  },
  {
    name: 'AI Assistant',
    path: '/app/assistant',
    icon: Sparkles,
  },
  {
    name: 'Audit Activity',
    path: '/app/activity',
    icon: Activity,
  },
  {
    name: 'About Us',
    path: '/app/about',
    icon: Info,
  },
  {
    name: 'Contact Support',
    path: '/app/contact',
    icon: Headphones,
  },
  {
    name: 'Settings',
    path: '/app/settings',
    icon: Settings,
  },
  {
    name: 'Home',
    path: '/',
    icon: Globe,
    isExternalLink: true,
  },
];

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) {
  const { user } = useAuth();

  const activeNavItems = user?.role === 'admin'
    ? [
        ...navItems.slice(0, 5),
        { name: 'Admin Console', path: '/app/admin', icon: ShieldCheck, isAdmin: true },
        ...navItems.slice(5),
      ]
    : navItems;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-full bg-[#070b18] border-r border-slate-800/90
          flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80 h-16">
          <Link to="/" title="Back to Home" className="focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
            {isCollapsed && !isMobileOpen ? (
              <div className="mx-auto">
                <Logo size="md" layout="mark-only" animated />
              </div>
            ) : (
              <Logo size="md" animated />
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            aria-label="Close mobile sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {activeNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) onMobileClose();
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                  ${
                    isActive
                      ? item.isAdmin
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : item.isAdmin
                      ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-800/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                  }
                  ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {/* Active Route Indicator Dot */}
                    {isActive && (!isCollapsed || isMobileOpen) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow" />
                    )}

                    {/* Tooltip for Collapsed Sidebar */}
                    {isCollapsed && !isMobileOpen && (
                      <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-slate-200 text-xs rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Panel (Collapse Button) */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050814]/60">

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`
              hidden lg:flex items-center justify-center w-full py-2 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-colors
              ${isCollapsed ? 'px-0' : 'px-3 gap-2'}
            `}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
