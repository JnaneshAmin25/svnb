import Link from "next/link";
import {
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { site } from "@/data/site";

const icons: Record<string, React.ReactNode> = {
  facebook: <FaFacebookF />,
  youtube: <FaYoutube />,
  instagram: <FaInstagram />,
};

export default function TopBar({ isDark = false }: { isDark?: boolean }) {
  return (
    <div
      className={`border-b text-xs transition-colors duration-300 ${
        isDark ? "border-white/10 bg-black text-white" : "border-white/10 bg-transparent text-white"
      }`}
    >
      <Container>
        <div className="flex h-10 items-center justify-between gap-4">
          <ul className="flex items-center gap-3 text-base text-white sm:text-lg">
            {site.socials.map((s) => (
              <li key={s.name}>
                <Link
                  href={s.href}
                  aria-label={s.name}
                  className="text-white transition-opacity hover:opacity-80"
                >
                  {icons[s.icon]}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex items-center gap-4 text-white sm:gap-6">
            <li className="hidden items-center gap-2 sm:flex">
              <FaPhone className="text-white" />
              <span>{site.phone}</span>
            </li>
            <li className="hidden items-center gap-2 md:flex">
              <FaEnvelope className="text-white" />
              <span>{site.email}</span>
            </li>
            <li>
              <Button href="#" variant="solid" className="px-4 py-1.5 text-[11px] sm:px-6 sm:py-2">
                Book Now
              </Button>
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}