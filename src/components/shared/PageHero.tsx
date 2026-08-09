import Image from "next/image";
import Button from "@/components/ui/Button";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  image: string;
  cta?: { href: string; label: string };
  alt?: string;
};

export default function PageHero({
  title,
  subtitle,
  image,
  cta,
  alt = "",
}: PageHeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-900">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-6 pt-24 text-center">
        <h1 className="max-w-4xl text-3xl font-semibold uppercase tracking-tight text-white sm:text-5xl md:text-7xl lg:text-[80px] lg:leading-[1.05]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 sm:mt-6 max-w-2xl text-sm text-white/85 sm:text-base md:text-lg">
            {subtitle}
          </p>
        )}
        {cta && (
          <div className="mt-10">
            <Button href={cta.href}>{cta.label}</Button>
          </div>
        )}
      </div>
    </section>
  );
}