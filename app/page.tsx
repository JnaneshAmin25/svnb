import BookNow from "@/components/home/BookNow";
import Hero from "@/components/home/Hero";
import SiteHeader from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <BookNow />
      </main>
    </>
  );
}