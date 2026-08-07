import Hero from "@/components/home/Hero";
import SiteHeader from "@/components/layout/SiteHeader";
import BookNow from "@/components/home/BookNow";
import AboutUs from "@/components/home/AboutUs";
import Services from "@/components/home/Services";
import UpcomingEvent from "@/components/home/UpcomingEvent";
import Gallery from "@/components/home/Gallery";
import ClientReview from "@/components/home/ClientReview";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero zIndex="z-100" />
        <div className="relative z-[101] w-full bg-white pb-[750px] md:pb-120">
          <div className="absolute inset-x-0 -top-10 z-20 md:-top-12">
            <BookNow />
          </div>
        </div>
        <AboutUs />
        <Services />
        <UpcomingEvent />
        <ClientReview />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
