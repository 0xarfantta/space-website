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

export const metadata = {
  title: "Orbitra — Explore The Universe",
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
    <html lang="en" className={`${poppins.variable} dark`}>
      <body className="font-sans text-slate-50">
        <BgScene />
        <LoadingScreen />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
