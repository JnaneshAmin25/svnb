import Hero from "@/components/home/Hero";
import BookNow from "@/components/home/BookNow";
import AboutUs from "@/components/home/AboutUs";
import Services from "@/components/home/Services";
import UpcomingEvent from "@/components/home/UpcomingEvent";
import ClientReview from "@/components/home/ClientReview";
import Faq from "@/components/home/Faq";

export default function Home() {
  return (
    <main>
      <Hero zIndex="z-100" />
      <div
        data-scroll-reveal-skip
        className="relative z-[101] w-full bg-white pb-[750px] md:pb-120"
      >
        <div className="absolute inset-x-0 -top-10 z-20 md:-top-12">
          <BookNow />
        </div>
      </div>
      <AboutUs />
      <Services />
      <UpcomingEvent />
      <ClientReview />
      <Faq />
    </main>
  );
}
