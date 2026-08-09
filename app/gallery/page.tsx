import PageHero from "@/components/shared/PageHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";

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
      <GalleryGrid />
    </main>
  );
}
