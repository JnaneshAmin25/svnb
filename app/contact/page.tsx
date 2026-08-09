import PageHero from "@/components/shared/PageHero";

export const metadata = { title: "Contact — SVNB" };

export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Contact Us"
        subtitle="Reach out to book the band, ask a question, or share a moment with us."
        image="/Images/Hero/hero-section.png"
      />
    </main>
  );
}