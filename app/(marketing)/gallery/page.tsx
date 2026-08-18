import PageHero from "@/components/shared/PageHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import AboutVideo from "@/components/our-journey/AboutVideo";

export const metadata = { title: "Gallery — SVNB" };

export default function GalleryPage() {
  return (
    <main>
      <PageHero
        title="Gallery"
        subtitle="Moments from our festivals, events, and celebrations."
        image="/Images/Hero/hero-section.png"
        cta={{ href: "/events", label: "Explore Events" }}
      />
      <AboutVideo />
      <GalleryGrid />
    </main>
  );
}
