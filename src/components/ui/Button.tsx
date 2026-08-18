import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost" | "outline";
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  onClick?: MouseEventHandler<HTMLElement>;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-widest transition-colors duration-200";
const variants = {
  solid: "bg-[#e63946] px-4 md:px-8 py-4 text-white hover:bg-[#c1121f]",
  ghost: "text-white hover:text-[#e63946]",
  outline:
    "border border-current bg-transparent px-4 md:px-8 py-4 hover:bg-white hover:bg-opacity-10",
};

export default function Button({
  children,
  href,
  variant = "solid",
  className = "",
  icon,
  iconPosition = "left",
  onClick,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {icon && iconPosition === "left" ? icon : null}
        {children}
        {icon && iconPosition === "right" ? icon : null}
      </Link>
    );
  }
  return (
    <button className={cls} onClick={onClick}>
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </button>
  );
}
