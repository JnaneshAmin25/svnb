import Link from "next/link";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SocialIconRow from "@/components/ui/SocialIconRow";
import { site } from "@/data/site";

export default function TopBar({ isDark = false }: { isDark?: boolean }) {
  return (
    <div
      className={`border-b text-xs transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-black text-white"
          : "border-white/10 bg-transparent text-white"
      }`}
    >
      <Container>
        <div className="flex h-10 items-center justify-between gap-4">
          <div className="text-white">
            <SocialIconRow
              items={site.socials}
              iconClassName="h-4 w-4 sm:h-5 sm:w-5"
              listClassName="flex items-center gap-3 sm:gap-4"
            />
          </div>
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