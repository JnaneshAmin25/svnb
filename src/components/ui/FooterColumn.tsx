import Link from "next/link";

export type FooterLink = { label: string; href: string };

type FooterColumnProps = {
  heading: string;
  links: readonly FooterLink[];
  /** `mixed` (default) leaves labels as-is; `uppercase` tracks-wide like legal text. */
  variant?: "mixed" | "uppercase";
  className?: string;
};

export default function FooterColumn({
  heading,
  links,
  variant = "mixed",
  className = "",
}: FooterColumnProps) {
  const labelClass =
    variant === "uppercase"
      ? "text-xs uppercase tracking-wider text-zinc-700 hover:text-[#e63946]"
      : "text-sm text-zinc-700 hover:text-[#e63946]";

  return (
    <div className={className}>
      <h3 className="font-title text-lg font-semibold uppercase tracking-wide text-zinc-900">
        {heading}
      </h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label} className="flex items-center gap-2">
            <span className="text-[#e63946]" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
            <Link href={link.href} className={labelClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
