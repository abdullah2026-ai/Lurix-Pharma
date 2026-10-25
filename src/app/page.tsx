import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { DashboardPreviewMockup } from "@/components/landing/DashboardPreviewMockup";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <LandingNavbar />
      
      <div className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Live System Preview (Pharmly Inspired Mockup) */}
        <section id="preview" className="px-4 sm:px-6 lg:px-8 py-10 -mt-6">
          <DashboardPreviewMockup />
        </section>

        {/* Feature Highlights Grid */}
        <FeaturesSection />

        {/* Daily Operations Workflow */}
        <WorkflowSection />

        {/* Why Upgrade / Modern vs Manual */}
        <BenefitsSection />
      </div>

      <LandingFooter />
    </main>
  );
}
