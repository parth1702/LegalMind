import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import StatusIndicator from '../brand/StatusIndicator';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link to="/" className="focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1">
          <Logo size="md" subtitle animated />
        </Link>
        <StatusIndicator status="secure" label="256-bit AES Encrypted" />
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="grid lg:grid-cols-12 gap-8 max-w-5xl w-full items-center">
          {/* Left Branding Column (Visible on lg screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2">
              <span className="badge badge-ai">
                <Sparkles className="w-3 h-3 mr-1" /> Enterprise Security
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 leading-tight">
                Institutional Access to <span className="text-cyan-400">Legal Intelligence</span>
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Securely authenticate to access your contract repository, AI risk analytics matrix, and automated clause extraction co-pilot.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SOC 2 Type II Audited & Compliant</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Foundational LLM Data Training</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Isolated Tenant Vector Vaults</span>
              </div>
            </div>
          </div>

          {/* Right Auth Card Container */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5 text-cyan-500" />
        <span>LegalMind AI • Secure Authentication Portal</span>
      </footer>
    </div>
  );
}
