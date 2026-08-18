import Image from "next/image";

type PageBannerProps = {
  eyebrow: string;
  title: string;
  image: string;
};

export default function PageBanner({ eyebrow, title, image }: PageBannerProps) {
  return (
    <section className="relative h-[260px] w-full overflow-hidden bg-zinc-900 sm:h-[340px]">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-white/85 sm:text-sm">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tight text-white sm:text-6xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
