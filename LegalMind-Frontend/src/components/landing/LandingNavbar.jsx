import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, LogIn, Sun, Moon, Layers, Shield, HelpCircle, Info, Mail } from 'lucide-react';
import Logo from '../brand/Logo';
import UserMenuDropdown from '../layout/UserMenuDropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LandingNavbar() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggleLightDark } = useTheme();

  const NAV_ITEMS = [
    { label: 'Features', href: '/#capabilities', icon: Layers },
    { label: 'How It Works', href: '/#workflow', icon: HelpCircle },
    { label: 'Risk AI', href: '/#risk-intelligence', icon: Shield },
    { label: 'About', href: '/about', isLink: true, icon: Info },
    { label: 'Contact', href: '/contact', isLink: true, icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        
        {/* ── TOP LEFT BAR: Menu button + Light Green "Go to Console" Button ── */}
        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNavMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all font-medium text-xs sm:text-sm shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Features & Navigation Menu"
              title="Features & Navigation Menu"
            >
              {navMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              )}
              <span className="hidden sm:inline font-semibold">Menu</span>
            </button>

            {/* Floating Dropdown for 5 Features */}
            {navMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNavMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-full mt-2 w-60 bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Platform Features
                    </p>
                  </div>

                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return item.isLink ? (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setNavMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setNavMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400" />
                        </div>
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Light Green "Go to Console" Button on Top Left Bar */}
          {isAuthenticated && (
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Go to Console</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </Link>
          )}
        </div>

        {/* ── TOP MIDDLE BAR: Logo centered ── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
          <Link to="/" className="rounded-lg p-1 flex items-center justify-center">
            <Logo size="md" subtitle animated />
          </Link>
        </div>

        {/* ── TOP RIGHT BAR: Profile widget after login, or Login/Get Started when logged out ── */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleLightDark}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {isAuthenticated ? (
            <UserMenuDropdown />
          ) : (
            <>
              <Link to="/auth/login" className="btn btn-ghost btn-sm text-slate-700 dark:text-slate-300 hidden sm:flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /><span>Login</span>
              </Link>
              <Link to="/auth/login" className="btn btn-primary btn-sm">
                <span>Get Started</span><ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
