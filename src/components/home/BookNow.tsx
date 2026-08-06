import BookingForm from "./BookingForm";
import VideoPreview from "./VideoPreview";

export default function BookNow() {
  return (
    <section className="w-full bg-white z-500">
      <div className="mx-auto w-full px-6 md:max-w-[60%] py-16 sm:py-20 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 -mt-32 sm:-mt-32 md:-mt-40">
          <BookingForm />
          <VideoPreview />
        </div>
      </div>
    </section>
  );
}
