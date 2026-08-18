import Timeline from "@/components/our-journey/Timeline";
import AboutVideo from "@/components/our-journey/AboutVideo";
import UpcomingEvent from "@/components/home/UpcomingEvent";
import ClientReview from "@/components/home/ClientReview";
import PageHero from "@/components/shared/PageHero";
import WhyChooseUs from "@/components/our-journey/WhyChooseUs";

export default function OurJourneyPage() {
  return (
    <main>
      <PageHero
        title="9 years of excellence"
        subtitle="Step into a sacred space where devotion meets community. Discover daily rituals, sermons, and events that bring the divine closer to every heart."
        image="/Images/Hero/hero-section.png"
        cta={{ href: "/events", label: "Explore Events" }}
      />
      <Timeline />
      <AboutVideo />
      <WhyChooseUs />
      <UpcomingEvent />
      <ClientReview />
    </main>
  );
}