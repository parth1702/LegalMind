import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  UploadCloud,
  ShieldAlert,
  MessageSquare,
  FileDown,
  User,
  Moon,
  Bell,
  Database,
  Users,
  HelpCircle,
} from 'lucide-react';
import Logo from '../brand/Logo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard',      path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Documents',      path: '/app/documents',  icon: FileText },
  { name: 'AI Risk Analysis', path: '/app/analysis', icon: BarChart3 },
  { name: 'AI Assistant',   path: '/app/assistant',  icon: Sparkles },
  { name: 'Audit Activity', path: '/app/activity',   icon: Activity },
  { name: 'Settings',       path: '/app/settings',   icon: Settings },
];

const CONTEXTUAL_QUICK_ACTIONS = {
  '/app/dashboard': {
    title: 'Dashboard Actions',
    items: [
      { name: 'Upload Document',  path: '/app/documents', icon: UploadCloud, color: 'text-blue-500' },
      { name: 'Batch Risk Audit', path: '/app/analysis',  icon: ShieldAlert, color: 'text-rose-500' },
      { name: 'AI Legal Co-Pilot', path: '/app/assistant', icon: MessageSquare, color: 'text-indigo-500' },
      { name: 'Export Summary',   path: '/app/documents', icon: FileDown,    color: 'text-emerald-500' },
    ],
  },
  '/app/settings': {
    title: 'Settings Sub-Menu',
    items: [
      { name: 'Account Profile',     path: '/app/settings?tab=account',       icon: User,        color: 'text-blue-500' },
      { name: 'Security & Sessions', path: '/app/settings?tab=security',      icon: ShieldCheck, color: 'text-rose-500' },
      { name: 'Appearance',          path: '/app/settings?tab=appearance',    icon: Moon,        color: 'text-purple-500' },
      { name: 'Notifications',       path: '/app/settings?tab=notifications', icon: Bell,        color: 'text-amber-500' },
      { name: 'Privacy & Data',      path: '/app/settings?tab=privacy',       icon: Database,    color: 'text-emerald-500' },
    ],
  },
  '/app/admin': {
    title: 'Admin Tools',
    items: [
      { name: 'System Overview',   path: '/app/admin?tab=overview',   icon: Database,   color: 'text-blue-500' },
      { name: 'User Accounts',     path: '/app/admin?tab=users',      icon: Users,      color: 'text-indigo-500' },
      { name: 'Global Repository', path: '/app/admin?tab=documents',  icon: FileText,   color: 'text-purple-500' },
      { name: 'Support Inquiries', path: '/app/admin?tab=inquiries',  icon: HelpCircle, color: 'text-amber-500' },
      { name: 'System Audit Logs', path: '/app/admin?tab=logs',       icon: Activity,   color: 'text-rose-500' },
    ],
  },
};

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const activeNavItems = user?.role === 'admin'
    ? [
        ...navItems.slice(0, 5),
        { name: 'Admin Console', path: '/app/admin', icon: ShieldCheck, isAdmin: true },
        ...navItems.slice(5),
      ]
    : navItems;

  const currentContext = CONTEXTUAL_QUICK_ACTIONS[location.pathname] || null;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-full
          bg-white dark:bg-[#070b18]
          border-r border-slate-200 dark:border-slate-800/90
          flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 h-16">
          <Link to="/" title="Back to Home" className="focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
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
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close mobile sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation & Contextual Quick Actions Container */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {/* Main Navigation Section */}
          <div className="space-y-0.5">
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-3.5 pb-1 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigation
              </p>
            )}
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (isMobileOpen) onMobileClose(); }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group relative
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${isActive
                      ? item.isAdmin
                        ? 'bg-red-50 dark:bg-rose-500/15 text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-500/40 font-semibold'
                        : 'bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30'
                      : item.isAdmin
                      ? 'text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-200 hover:bg-red-50 dark:hover:bg-rose-950/40 border border-red-100 dark:border-rose-800/40 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                    }
                    ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? item.isAdmin ? 'text-red-600 dark:text-rose-400' : 'text-blue-600 dark:text-cyan-400'
                          : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`} />

                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.name}</span>
                      )}

                      {/* Active indicator dot */}
                      {isActive && (!isCollapsed || isMobileOpen) && (
                        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${
                          item.isAdmin ? 'bg-red-500' : 'bg-blue-600 dark:bg-cyan-400'
                        }`} />
                      )}

                      {/* Collapsed tooltip */}
                      {isCollapsed && !isMobileOpen && (
                        <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                          {item.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Contextual Quick Actions Section (only rendered if currentContext exists) */}
          {currentContext && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5 transition-all">
              {(!isCollapsed || isMobileOpen) && (
                <p className="px-3.5 pt-1 pb-1 text-[9px] font-mono font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{currentContext.title}</span>
                </p>
              )}
              {currentContext.items.map((action) => {
                const ActionIcon = action.icon;
                const fullCurrentPath = `${location.pathname}${location.search}`;
                const isActionActive =
                  action.path === fullCurrentPath ||
                  (action.path === '/app/settings?tab=account' && (fullCurrentPath === '/app/settings' || fullCurrentPath === '/app/settings?tab=account')) ||
                  (action.path === '/app/admin?tab=overview' && (fullCurrentPath === '/app/admin' || fullCurrentPath === '/app/admin?tab=overview'));

                return (
                  <Link
                    key={action.name}
                    to={action.path}
                    onClick={() => { if (isMobileOpen) onMobileClose(); }}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group relative
                      ${isActionActive
                        ? 'bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 font-semibold border border-blue-200 dark:border-cyan-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                      }
                      ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                    `}
                    title={isCollapsed ? `${currentContext.title}: ${action.name}` : undefined}
                  >
                    <ActionIcon className={`w-4 h-4 shrink-0 ${isActionActive ? 'text-blue-600 dark:text-cyan-400' : action.color} group-hover:scale-110 transition-transform`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{action.name}</span>
                    )}

                    {/* Active indicator dot */}
                    {isActionActive && (!isCollapsed || isMobileOpen) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                    )}

                    {/* Collapsed tooltip */}
                    {isCollapsed && !isMobileOpen && (
                      <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                        {action.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Panel */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#050814]/60">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`
              hidden lg:flex items-center justify-center w-full py-2 text-xs font-medium
              text-slate-500 dark:text-slate-400
              hover:text-slate-800 dark:hover:text-slate-200
              hover:bg-slate-200 dark:hover:bg-slate-900
              border border-slate-200 dark:border-slate-800/80
              rounded-lg transition-colors
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
