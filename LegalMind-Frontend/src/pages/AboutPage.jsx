import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Eye,
  Award,
  Cpu,
  Lock,
  FileCheck,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Mail,
  Building2,
  BrainCircuit,
  Scale,
} from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function AboutPage() {
  const location = useLocation();
  const isInsideApp = location.pathname.startsWith('/app');

  const metrics = [
    {
      value: '99.4%',
      label: 'Clause Extraction Accuracy',
      description: 'Precision-tested on complex NLI contract datasets',
      icon: Target,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
    },
    {
      value: '10x',
      label: 'Faster Contract Audits',
      description: 'Instant risk scoring matrix & clause breakdown',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    {
      value: '50,000+',
      label: 'Clauses Processed',
      description: 'Tested across NDAs, SLAs, MSAs, & Employment terms',
      icon: FileCheck,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10',
    },
    {
      value: '100%',
      label: 'Zero Data Training',
      description: 'Your proprietary contracts remain 100% private',
      icon: Lock,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
  ];

  const corePillars = [
    {
      title: 'Contract NLI & Intelligent Extraction',
      description:
        'Our custom Neural Natural Language Inference engine parses dense legal prose, extracting indemnification, termination, liability caps, and non-compete clauses in seconds.',
      icon: BrainCircuit,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Automated Multi-Tier Risk Matrix',
      description:
        'Instantly quantifies contract exposure into Low, Medium, High, and Critical risk categories with actionable redline recommendations and mitigation advice.',
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'RAG-Powered AI Legal Assistant',
      description:
        'Engage in natural context-aware dialogue with your contracts. Ask detailed questions regarding governing law, renewal deadlines, or custom liabilities.',
      icon: MessageSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Enterprise Trust & Encryption',
      description:
        '256-bit AES hardware encryption protecting every legal document.',
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
  ];

  const targetAudience = [
    {
      role: 'Law Firms & Attorneys',
      benefit: 'Accelerate due diligence, automate clause extraction, and reduce billable review hours.',
      icon: Scale,
    },
    {
      role: 'In-House Corporate Counsel',
      benefit: 'Standardize risk assessments across vendor agreements, MSAs, and employment contracts.',
      icon: Building2,
    },
    {
      role: 'Compliance & Procurement Teams',
      benefit: 'Maintain strict policy adherence and uncover hidden liabilities before signing.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className={isInsideApp ? "space-y-12 animate-in fade-in duration-200" : "min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950"}>
      {/* Top Header Navbar - Only render on standalone public route */}
      {!isInsideApp && <LandingNavbar />}

      {/* Main Content Area */}
      <main className={isInsideApp ? "space-y-16" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20"}>
        {/* Section 1: Hero Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Pioneering Legal AI & Contract Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Empowering Legal Teams with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Next-Gen Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            LegalMind AI is an enterprise-grade legal document intelligence platform built to revolutionize how law firms, corporate counsel, and compliance teams review contracts, quantify risk, and make confident legal decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/app/documents" className="btn btn-primary btn-md shadow-lg shadow-cyan-500/25">
              <span>Analyze a Document</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-md text-slate-200">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>

        {/* Section 2: Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Our Mission */}
          <div className="p-8 rounded-3xl bg-[#070b19] border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 shadow-2xl relative overflow-hidden group space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Our Mission</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To eliminate tedious manual contract reviews and empower every legal professional with instantaneous, accurate, and actionable AI insights. We bridge the gap between complex legal prose and precise decision-making.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Precision-Tested Legal NLP Algorithms</span>
            </div>
          </div>

          {/* Card 2: Our Vision */}
          <div className="p-8 rounded-3xl bg-[#070b19] border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-300 shadow-2xl relative overflow-hidden group space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Eye className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Our Vision</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Setting the gold standard for secure, private, and ethical artificial intelligence in global legal technology. We believe AI should enhance human expertise, guaranteeing 100% data privacy and zero customer model training.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Lock className="w-4 h-4" />
              <span>Enterprise Privacy & Security Architecture</span>
            </div>
          </div>
        </div>

        {/* Section 3: Key Metrics Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered for Unmatched Precision
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Proven benchmark results across thousands of real-world legal contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-[#070b19] border ${m.border} shadow-xl space-y-3 hover:scale-[1.02] transition-transform`}
                >
                  <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-3xl font-extrabold font-mono ${m.color}`}>{m.value}</div>
                    <div className="text-sm font-bold text-slate-200 mt-1">{m.label}</div>
                  </div>
                  <p className="text-xs text-slate-400">{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Core Technology Pillars */}
        <div className="bg-[#070b19] rounded-3xl border border-slate-800/90 p-8 sm:p-12 shadow-2xl space-y-10">
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <span>Our Technological Foundation</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Combining Natural Language Inference, Vector RAG Retrieval, and Microservice Architecture.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Award className="w-4 h-4" />
              <span>Legal AI Engine Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-[#050814] border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className={`p-3 rounded-xl ${pillar.bg} ${pillar.color} shrink-0 h-fit`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100">{pillar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Built for Legal Teams */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built for Modern Legal Teams
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Designed to integrate seamlessly into law firm workflows, enterprise legal departments, and compliance operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {targetAudience.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[#070b19] border border-slate-800/90 hover:border-cyan-500/30 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{item.role}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.benefit}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Final Call To Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Upgrade Your Legal Workflow?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Upload your first contract to experience automated clause extraction, instant risk scoring, and interactive AI assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/app/documents" className="btn btn-primary btn-md shadow-lg shadow-cyan-500/25">
              <span>Start Analyzing Contracts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/app/assistant" className="btn btn-secondary btn-md text-emerald-400 hover:text-emerald-300">
              <MessageSquare className="w-4 h-4" />
              <span>Chat with AI Assistant</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer - Only render on standalone public route */}
      {!isInsideApp && <LandingFooter />}
    </div>
  );
}
