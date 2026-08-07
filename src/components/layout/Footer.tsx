import Image from "next/image";
import Container from "@/components/ui/Container";
import SocialIconRow from "@/components/ui/SocialIconRow";
import FooterColumn from "@/components/ui/FooterColumn";
import { site } from "@/data/site";

type SocialLink = {
  name: string;
  href: string;
  icon: "facebook" | "youtube" | "instagram" | "twitter" | "linkedin";
};

export default function Footer() {
  const { phone, email, socials, footer } = site;
  const socialLinks = socials as SocialLink[];
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const mailtoHref = `mailto:${email}`;

  return (
    <footer className="bg-white">
      {/* Top dark band: logo / newsletter / social */}
      <div className="bg-zinc-700">
        <Container className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:justify-between sm:gap-0">
          <a href="/" aria-label={`${site.name} home`} className="shrink-0">
            <Image
              src="/Images/Logo/logo-light.png"
              alt={site.name}
              width={120}
              height={60}
              className="h-12 w-auto"
            />
          </a>

          <div className="text-white">
            <SocialIconRow items={socialLinks} />
          </div>
        </Container>
      </div>

      {/* White columns */}
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <h3 className="font-title text-lg font-semibold text-zinc-900">Contact Us</h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-700">
              <li>{footer.contact.address}</li>
              <li>
                Email:{" "}
                <a href={mailtoHref} className="hover:text-zinc-900">
                  {email}
                </a>
              </li>
              <li>
                Phone:{" "}
                <a href={telHref} className="hover:text-zinc-900">
                  {phone}
                </a>
              </li>
            </ul>
          </div>

          <FooterColumn heading="Quick Links" links={footer.quickLinks} />

          <FooterColumn
            heading="Useful Links"
            links={footer.usefulLinks}
            variant="uppercase"
          />
        </div>
      </Container>
    </footer>
  );
}