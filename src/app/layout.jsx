import { Poppins } from "next/font/google";
import BgScene from "@/components/BgScene";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Orbitra — Explore The Universe",
    template: "%s · Orbitra",
  },
  description:
    "Orbitra is a modern celestial objects catalog. Explore planets, galaxies, nebulae, and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: browser extensions often inject attributes on
    // <html>/<body> (e.g. __processed_*) before React hydrates.
    <html lang="en" className={`${poppins.variable} dark`} suppressHydrationWarning>
      <body className="font-sans text-slate-50" suppressHydrationWarning>
        <BgScene />
        <LoadingScreen />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
