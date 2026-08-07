import Link from "next/link";
import { SOCIAL_ICONS, type SocialIconName } from "@/components/ui/socialIcons";

export type SocialLink = {
  name: string;
  href: string;
  icon: SocialIconName;
};

type SocialIconRowProps = {
  items: readonly SocialLink[];
  /** Tailwind classes applied to each icon's wrapping anchor (size, color). */
  iconClassName?: string;
  /** Tailwind classes applied to the `<ul>` (gap, alignment). */
  listClassName?: string;
};

export default function SocialIconRow({
  items,
  iconClassName = "h-4 w-4",
  listClassName = "flex items-center gap-5",
}: SocialIconRowProps) {
  return (
    <ul className={listClassName}>
      {items.map(({ name, href, icon }) => {
        const Icon = SOCIAL_ICONS[icon];
        return (
          <li key={name}>
            <Link
              href={href}
              aria-label={name}
              className="transition-opacity hover:opacity-70"
            >
              <Icon className={iconClassName} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}