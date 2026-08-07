import Image from "next/image";

type ServiceCardProps = {
  title: string;
  description: string;
  image: string;
  className?: string;
};

export default function ServiceCard({
  title,
  description,
  image,
  className = "",
}: ServiceCardProps) {
  return (
    <article
      className={`relative w-full overflow-hidden bg-zinc-50 ring-1 ring-zinc-200 ${className}`}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          className="object-cover"
        />
      </div>
      <div className="px-5 py-6 text-center">
        <h5 className="font-title text-lg font-bold uppercase tracking-wide text-zinc-900">
          {title}
        </h5>
        <p className="mt-3 text-xs leading-6 text-zinc-600 sm:text-sm">
          {description}
        </p>
      </div>
    </article>
  );
}
