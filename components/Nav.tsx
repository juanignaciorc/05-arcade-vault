"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Section = "inicio" | "biblioteca" | "salon" | "auth";

function sectionOf(pathname: string | null): Section | null {
  if (pathname === null) return null;
  if (pathname === "/") return "inicio";
  if (pathname === "/games" || pathname.startsWith("/games/")) return "biblioteca";
  if (pathname.startsWith("/hall-of-fame")) return "salon";
  if (pathname.startsWith("/auth")) return "auth";
  return null;
}

/**
 * Presentational navbar. `pathname` is null when rendered as the Suspense
 * fallback (no active link), which happens while prerendering routes whose
 * dynamic params are unknown at build time (cacheComponents).
 */
export function NavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const section = sectionOf(pathname);
  const cls = (name: Section) => (section === name ? "active" : "");
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("inicio")} onClick={close}>
            Inicio
          </Link>
          <Link href="/games" className={cls("biblioteca")} onClick={close}>
            Biblioteca
          </Link>
          <Link href="/hall-of-fame" className={cls("salon")} onClick={close}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        <Link href="/auth" className="btn auth-btn" onClick={close}>
          Iniciar Sesión
        </Link>
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={cls("inicio")} onClick={close}>
          Inicio
        </Link>
        <Link href="/games" className={cls("biblioteca")} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/hall-of-fame" className={cls("salon")} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/auth" className={cls("auth")} onClick={close}>
          Iniciar Sesión
        </Link>
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}

export default function Nav() {
  const pathname = usePathname();
  return <NavView pathname={pathname} />;
}
