import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ShareAnywhere } from "@/components/landing/ShareAnywhere";
import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { PreviewSandbox } from "@/components/landing/PreviewSandbox";
import { Faq } from "@/components/landing/Faq";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

// Marketing page — DM is installed from Whop's App Store, not a DM-hosted
// sign-up, so nothing here submits a form; it's the pitch that sends a
// creator to Whop's app listing.
export default function RootPage() {
  return (
    <div className="landing overflow-x-hidden">
      <Nav />
      <Hero />
      <ShareAnywhere />
      <IntegrationsMarquee />
      <FeaturesBento />
      <PreviewSandbox />
      <Faq />
      <Pricing />
      <Footer />
    </div>
  );
}
