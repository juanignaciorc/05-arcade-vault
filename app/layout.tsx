import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Nav, { NavView } from "@/components/Nav";
import "./globals.css";

// Fonts are loaded exactly like the reference template (same Google Fonts CSS
// URL) instead of next/font: next/font served a different Press Start 2P build
// and its metric-adjusted Arial fallbacks drew glyphs outside the latin subset
// (▲ ⌕ ≡ ♥ ★) differently, so the UI was not pixel-identical to the template.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Courier+Prime:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap";

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Juega online y compite por la puntuación más alta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
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
