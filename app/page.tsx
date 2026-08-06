import Hero from "@/components/home/Hero";
import SiteHeader from "@/components/layout/SiteHeader";
import BookNow from "@/components/home/BookNow";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero zIndex="z-100" />
        <div className="relative z-[101] w-full bg-white pb-152 md:pb-120">
          <div className="absolute inset-x-0 -top-10 z-20 md:-top-12">
            <BookNow />
          </div>
        </div>
      </main>
    </>
  );
}