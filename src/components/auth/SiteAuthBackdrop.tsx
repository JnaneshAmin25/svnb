import Hero from "@/components/home/Hero";
import SiteHeader from "@/components/layout/SiteHeader";

export default function SiteAuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none min-h-screen select-none overflow-hidden">
      <SiteHeader />
      <Hero zIndex="z-100" />
    </div>
  );
}
