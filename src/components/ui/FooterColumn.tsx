import Link from "next/link";

export type FooterLink = { label: string; href: string };

type FooterColumnProps = {
  heading: string;
  links: readonly FooterLink[];
  /** `mixed` (default) leaves labels as-is; `uppercase` tracks-wide like legal text. */
  variant?: "mixed" | "uppercase";
};

export default function FooterColumn({
  heading,
  links,
  variant = "mixed",
}: FooterColumnProps) {
  const labelClass =
    variant === "uppercase"
      ? "text-xs uppercase tracking-wider text-zinc-700 hover:text-zinc-900"
      : "text-sm text-zinc-700 hover:text-zinc-900";

  return (
    <div>
      <h3 className="font-title text-lg font-semibold text-zinc-900">{heading}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={labelClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}