import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const trajanPro = localFont({
  src: [
    { path: "../public/fonts/TrajanPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/TrajanPro-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-trajan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shri Veera Vinayaka Nasik Band",
  description:
    "Shri Veera Vinayaka Nasik Band — Hindu temple, sermons, events and community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${trajanPro.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
