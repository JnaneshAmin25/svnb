import BookingForm from "./BookingForm";
import VideoPreview from "./VideoPreview";

export default function BookNow() {
  return (
    <div className="mx-auto w-full px-6 md:max-w-[70%]">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <BookingForm />
        <VideoPreview />
      </div>
    </div>
  );
}
