import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  ProcessSection,
  TestimonialsSection,
  GallerySection,
  CTASection,
  FooterSection,
} from '@/components/landing';

function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ProcessSection />
      <TestimonialsSection />
      <GallerySection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

export default LandingPage;
