import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import ProductPreview from '../components/landing/ProductPreview';
import CoreCapabilities from '../components/landing/CoreCapabilities';
import AnalysisWorkflow from '../components/landing/AnalysisWorkflow';
import RiskIntelligenceSection from '../components/landing/RiskIntelligenceSection';
import DocumentIntelligenceSection from '../components/landing/DocumentIntelligenceSection';
import AiAssistantSection from '../components/landing/AiAssistantSection';
import SecurityTrustSection from '../components/landing/SecurityTrustSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* 1. Navigation */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Product Preview */}
        <ProductPreview />

        {/* 4. Core Capabilities */}
        <CoreCapabilities />

        {/* 5. AI Document Analysis Workflow */}
        <AnalysisWorkflow />

        {/* 6. Risk Intelligence Section */}
        <RiskIntelligenceSection />

        {/* 7. Document Intelligence Section */}
        <DocumentIntelligenceSection />

        {/* 8. AI Assistant Section */}
        <AiAssistantSection />

        {/* 9. Security & Trust Section */}
        <SecurityTrustSection />

        {/* 10. Final Call To Action */}
        <FinalCtaSection />
      </main>

      {/* 11. Footer */}
      <LandingFooter />
    </div>
  );
}
