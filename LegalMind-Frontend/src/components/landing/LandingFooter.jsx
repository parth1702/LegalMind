import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import StatusIndicator from '../brand/StatusIndicator';
import { Shield, Lock } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#03050e] border-t border-slate-800 text-slate-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" subtitle />
            <p className="text-slate-400 text-xs leading-relaxed">
              LegalMind AI is an enterprise-grade legal document intelligence platform built for legal teams, law firms, and corporate counsel.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Platform</div>
            <ul className="space-y-2">
              <li>
                <a href="#capabilities" className="hover:text-cyan-300 transition-colors">
                  Clause Extraction
                </a>
              </li>
              <li>
                <a href="#risk-intelligence" className="hover:text-cyan-300 transition-colors">
                  Risk Scoring Matrix
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-cyan-300 transition-colors">
                  Analysis Pipeline
                </a>
              </li>
              <li>
                <Link to="/app/assistant" className="hover:text-cyan-300 transition-colors">
                  AI Legal Assistant
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-300 font-semibold text-cyan-400 transition-colors">
                  About LegalMind AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Application Routes */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Console</div>
            <ul className="space-y-2">
              <li>
                <Link to="/app/dashboard" className="hover:text-cyan-300 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/documents" className="hover:text-cyan-300 transition-colors">
                  Document Store
                </Link>
              </li>
              <li>
                <Link to="/app/analysis" className="hover:text-cyan-300 transition-colors">
                  Risk Analytics
                </Link>
              </li>
              <li>
                <Link to="/app/activity" className="hover:text-cyan-300 transition-colors">
                  Audit Stream
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-300 font-semibold text-cyan-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Security</div>
            <p className="text-slate-400 leading-relaxed">
              Hardware-encrypted storage, 256-bit AES encryption, and zero customer data training for foundational AI models.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} LegalMind AI Platform. Final Year Major Engineering Project. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
