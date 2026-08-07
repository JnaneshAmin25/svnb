import Button from "@/components/ui/Button";

export default function AboutUs() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-4xl px-6 text-center">
        <h4 className="font-title text-2xl font-bold text-zinc-900 md:text-3xl">
          9+ years of excellence
        </h4>

        <p className="mt-6 text-sm leading-7 text-zinc-700">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. 
        </p>

        <p className="mt-4 text-sm leading-7 text-zinc-700 e">
          It was popularised in the 1960s with the release of Letraset sheets
          containing Lorem Ipsum passages, and more recently with desktop
          publishing software like Aldus PageMaker including versions of Lorem
          Ipsum. It was popularised in the 1960s with the release of Letraset
          sheets containing Lorem Ipsum passages.
        </p>

        <Button href="#" className="mt-8">
          Learn More
        </Button>
      </div>
    </section>
  );
}
