import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

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

export default function RootLayout({ children, auth }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${trajanPro.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          {children}
          {auth}
        </AuthProvider>
      </body>
    </html>
  );
}
