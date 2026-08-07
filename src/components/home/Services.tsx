import ServiceCard from "./ServiceCard";

const SERVICES = [
  {
    title: "Wedding Band",
    description: "Traditional wedding procession music",
    image: "/Images/Festival/Ganesh_Chaturthi.jpg",
  },
  {
    title: "Temple Festival",
    description: "Professional ceremonial performances",
    image: "/Images/Festival/Ganesh_Chaturthi.jpg",
  },
  {
    title: "Cultural Events",
    description: "Live performances for festivals and celebrations",
    image: "/Images/Festival/Ganesh_Chaturthi.jpg",
  },
];

// Center card is wider and rendered in front; side cards overlap behind it.
const CARD_WIDTH = "w-full md:w-72";
const POSITIONS = [
  "md:absolute md:left-[6%] md:top-1/2 md:-translate-y-1/2 md:z-10 md:scale-90",
  "md:relative md:z-20 md:scale-110",
  "md:absolute md:right-[6%] md:top-1/2 md:-translate-y-1/2 md:z-10 md:scale-90",
];

export default function Services() {
  return (
    <section className="bg-white pb-16 md:pb-24">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 md:flex-row md:justify-center md:gap-0 md:py-16">
        {SERVICES.map((service, i) => (
          <div key={service.title} className={`${CARD_WIDTH} ${POSITIONS[i]}`}>
            <ServiceCard
              title={service.title}
              description={service.description}
              image={service.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
