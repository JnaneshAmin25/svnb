import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import ScrollRevealController from "@/components/motion/ScrollRevealController";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollRevealController />
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
