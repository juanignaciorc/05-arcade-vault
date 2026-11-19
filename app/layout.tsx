import type { Metadata } from "next";
import { Courier_Prime, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Nav, { NavView } from "@/components/Nav";
import "./globals.css";

// Same fonts the reference template loads from Google Fonts:
// Press Start 2P (pixel headings), JetBrains Mono (body), Courier Prime (mono fallback).
const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Juega online y compite por la puntuación más alta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart2P.variable} ${jetbrainsMono.variable} ${courierPrime.variable}`}
    >
      <body>
        {/* background layers from the reference template */}
        <div className="av-bg" aria-hidden="true" />
        <div className="av-noise" aria-hidden="true" />
        <div id="root">
          {/* usePathname suspends on routes with params unknown at build time
              (cacheComponents), so the Nav needs a Suspense boundary. The
              fallback is the same Nav without an active link. */}
          <Suspense fallback={<NavView pathname={null} />}>
            <Nav />
          </Suspense>
          <main className="av-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
