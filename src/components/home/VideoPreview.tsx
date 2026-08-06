export default function VideoPreview() {
  return (
    <button
      type="button"
      aria-label="Play video"
      className="group relative aspect-video w-full overflow-hidden bg-cover bg-center bg-no-repeat shadow-xl md:aspect-auto md:h-full"
      style={{ backgroundImage: "url('/video-thumbnail.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/30 transition-transform group-hover:scale-110 sm:h-24 sm:w-24">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-1 h-8 w-8 text-[#e63946] sm:h-10 sm:w-10"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </button>
  );
}
