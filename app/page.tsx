import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ExcavationSection } from "@/components/excavation-section"
import { AISection } from "@/components/ai-section"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ExcavationSection />
      <AISection />
      <CTASection />
    </>
  )
}

