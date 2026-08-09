export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "booking-process",
    question: "How do I book the band for my event?",
    answer:
      "You can book us directly through the Book Now form at the top of this page, or call us on the phone number listed in the footer. Share your event date, venue, and expected headcount — we will confirm availability within 24 hours and send you a detailed quote.",
  },
  {
    id: "areas-covered",
    question: "Which areas do you cover?",
    answer:
      "We are based in Udupi and regularly perform across Dakshina Kannada, Udupi, and surrounding districts. For weddings and temple events further afield, please reach out and we will let you know if travel is feasible for your dates.",
  },
  {
    id: "performance-duration",
    question: "How long is a typical performance?",
    answer:
      "A standard procession or entry set runs between 45 minutes and 2 hours. For multi-day events like Ganesh Chaturthi, we offer day-long and evening slots. We will work with you to plan the right structure for the occasion.",
  },
  {
    id: "customization",
    question: "Can the performance be customized for our occasion?",
    answer:
      "Yes. Tell us the theme of your event — wedding, temple festival, religious procession, family function — and we will tailor our formations, costume colours, and the tasha patterns accordingly. Custom requests are always welcome.",
  },
  {
    id: "pricing",
    question: "What are your charges?",
    answer:
      "Pricing depends on the duration, the number of performers, and travel distance. Send us your event details through the booking form and we will share a transparent quote with no hidden costs.",
  },
  {
    id: "what-makes-different",
    question: "What makes Shri Veera Vinayaka Nasik Band different?",
    answer:
      "Three generations of disciplined nasik players, a uniformed troupe, and a sound that has carried temple processions through Udupi for nearly four decades. We play with devotion, not just volume.",
  },
];