import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, LogIn, UserPlus, LogOut } from 'lucide-react';
import Logo from '../brand/Logo';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#050814]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1">
          <Logo size="md" subtitle animated />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300" aria-label="Main Navigation">
          <a href="#capabilities" className="hover:text-cyan-300 transition-colors">
            Capabilities
          </a>
          <a href="#workflow" className="hover:text-cyan-300 transition-colors">
            Workflow
          </a>
          <a href="#risk-intelligence" className="hover:text-cyan-300 transition-colors">
            Risk Intelligence
          </a>
          <Link to="/about" className="hover:text-cyan-300 transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-cyan-300 transition-colors text-cyan-400 font-semibold">
            Contact Us
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/app/dashboard" className="btn btn-secondary btn-sm flex items-center gap-1.5 font-semibold text-cyan-300">
                <span>Go to Console</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
              <Link to="/app/documents" className="btn btn-primary btn-sm shadow-lg shadow-cyan-500/20">
                <span>Analyze a Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="btn btn-ghost btn-sm text-slate-300 hover:text-slate-100 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Log In</span>
              </Link>
              <Link to="/auth/register" className="btn btn-secondary btn-sm flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sign Up</span>
              </Link>
              <Link to="/auth/login" className="btn btn-primary btn-sm shadow-lg shadow-cyan-500/20">
                <span>Analyze a Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070b18] px-4 py-6 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-300 py-1 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-300 py-1 transition-colors"
            >
              Workflow
            </a>
            <a
              href="#risk-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-300 py-1 transition-colors"
            >
              Risk Intelligence
            </a>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-300 py-1 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-300 py-1 transition-colors text-cyan-400 font-semibold"
            >
              Contact Us
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/app/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-md w-full justify-center text-cyan-300"
                >
                  <span>Go to Console</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-ghost btn-md w-full justify-center text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
                <Link
                  to="/app/documents"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-md w-full justify-center"
                >
                  <span>Analyze a Document</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost btn-md w-full justify-center text-slate-200"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-md w-full justify-center"
                >
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <span>Sign Up / Create Account</span>
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-md w-full justify-center"
                >
                  <span>Analyze a Document</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
