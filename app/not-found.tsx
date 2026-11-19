import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 · Arcade Vault",
};

export default function NotFound() {
  return (
    <div className="fade-in">
      <section className="av-hero" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <h1 className="flicker">GAME OVER · 404</h1>
        <div className="sub">
          ESTE NIVEL NO EXISTE <span className="blink">_</span>
        </div>
        <p style={{ margin: "28px auto 36px", maxWidth: 440, color: "var(--ink-dim)", lineHeight: 1.6 }}>
          La dirección no coincide con ningún juego ni pantalla del vault. Revisa el enlace o vuelve a la
          biblioteca para elegir otro juego.
        </p>
        <Link href="/" className="btn lg">
          VOLVER AL VAULT
        </Link>
      </section>
    </div>
  );
}
