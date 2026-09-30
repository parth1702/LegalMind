import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import StatusIndicator from '../brand/StatusIndicator';
import { Sparkles, CheckCircle2, Lock } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-100/50 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link to="/" className="focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1">
          <Logo size="md" subtitle animated />
        </Link>
        <StatusIndicator status="secure" label="256-bit AES Encrypted" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="grid lg:grid-cols-12 gap-8 max-w-5xl w-full items-center">
          {/* Left Branding Column (lg screens only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2">
              <span className="badge badge-ai">
                <Sparkles className="w-3 h-3 mr-1" /> Enterprise Security
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Institutional Access to <span className="text-blue-600 dark:text-cyan-400">Legal Intelligence</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Securely authenticate to access your contract repository, AI risk analytics matrix, and automated clause extraction co-pilot.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { color: 'text-green-600',  text: 'SOC 2 Type II Audited & Compliant' },
                { color: 'text-blue-600 dark:text-cyan-400',   text: 'Zero Foundational LLM Data Training' },
                { color: 'text-indigo-600', text: 'Isolated Tenant Vector Vaults' },
              ].map(({ color, text }) => (
                <div key={text} className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Auth Card Container */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-500" />
        <span>LegalMind AI • Secure Authentication Portal</span>
      </footer>
    </div>
  );
}
