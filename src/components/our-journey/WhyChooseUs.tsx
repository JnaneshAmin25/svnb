import Image from "next/image";

interface WhyChooseCard {
  title: string;
  description: string;
}

const cards: WhyChooseCard[] = [
  {
    title: "Energetic Performances",
    description:
      "Bring every procession and celebration to life with powerful beats, vibrant energy, and an engaging live performance.",
  },
  {
    title: "Experienced Team",
    description:
      "With years of experience and a skilled team, we deliver well coordinated performances with confidence, rhythm, and professionalism",
  },
  {
    title: "Tradition Meets Style",
    description:
      "Experience the charm of traditional Nasik band music with a vibrant presentation that perfectly complements festivals and wedding celebrations.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 px-4 bg-zinc-100">
        <h4 className="text-center mb-4 font-title text-2xl font-bold text-zinc-900 md:text-3xl">
          Why Choose Us
        </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 max-w-7xl mx-auto md:divide-x md:divide-zinc-200">
        {cards.map((card) => (
          <article
            key={card.title}
            className="group relative flex flex-col items-center text-center bg-white md:bg-transparent px-4 pt-6 pb-6 transition-colors duration-200 hover:bg-white hover:shadow-lg md:px-5"
          >
            <div className="relative h-40 w-54 flex items-center justify-center -mb-16">
              <Image
                src="/Images/Hero/cardIcon.PNG"
                alt={card.title}
                width={1536}
                height={1024}
                className="object-contain w-full h-full transition-transform duration-300 ease-out group-hover:-translate-y-4"
              />
            </div>

            <div className="relative z-10 -mt-6 h-6 bg-gradient-to-b from-transparent to-zinc-100 group-hover:to-white transition-colors duration-200"></div>

            <div className="relative z-10 bg-zinc-100 group-hover:bg-white transition-colors duration-200">
              <h3 className="text-zinc-900 font-semibold text-lg md:text-xl mb-3 transition-colors duration-200 group-hover:text-[#e63946]">
                {card.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}