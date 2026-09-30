import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';

export default function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-3 md:col-span-1">
            <Logo size="sm" subtitle />
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs">
              LegalMind AI is an enterprise-grade legal document intelligence platform built for legal teams, law firms, and corporate counsel.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Platform</div>
            <ul className="space-y-1.5">
              {[
                { href: '/#capabilities', label: 'Clause Extraction' },
                { href: '/#risk-intelligence', label: 'Risk Scoring Matrix' },
                { href: '/#workflow', label: 'Analysis Pipeline' },
              ].map(({ href, label }) => (
                <li key={href}><a href={href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{label}</a></li>
              ))}
              <li><Link to="/app/assistant" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Legal Assistant</Link></li>
              <li><Link to="/about"        className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors">About LegalMind AI</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Console</div>
            <ul className="space-y-1.5">
              {[
                { to: '/app/dashboard', label: 'Dashboard' },
                { to: '/app/documents', label: 'Document Store' },
                { to: '/app/analysis',  label: 'Risk Analytics' },
                { to: '/app/activity',  label: 'Audit Stream' },
              ].map(({ to, label }) => (
                <li key={to}><Link to={to} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{label}</Link></li>
              ))}
              <li><Link to="/contact" className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Security</div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              Hardware-encrypted storage, 256-bit AES encryption, and zero customer data training for foundational AI models.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} LegalMind AI Platform. All rights reserved.</div>
          <div className="flex items-center space-x-3">
            <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors">Security Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
