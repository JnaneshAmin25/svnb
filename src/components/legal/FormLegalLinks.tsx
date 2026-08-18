import Link from "next/link";

type FormLegalLinksProps = {
  className?: string;
};

const LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export default function FormLegalLinks({ className = "" }: FormLegalLinksProps) {
  return (
    <nav
      aria-label="Legal information"
      className={`flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] leading-5 text-zinc-500 sm:text-xs ${className}`}
    >
      {LINKS.map((link, index) => (
        <span key={link.href} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <Link
            href={link.href}
            className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900"
          >
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
