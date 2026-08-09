import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost";
  className?: string;
};

const base =
  "inline-flex items-center justify-center font-medium uppercase tracking-widest transition-colors duration-200";
const variants = {
  solid: "bg-[#e63946] px-4 md:px-8 py-4 text-white hover:bg-[#c1121f]",
  ghost: "text-white hover:text-[#e63946]",
};

export default function Button({
  children,
  href,
  variant = "solid",
  className = "",
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}