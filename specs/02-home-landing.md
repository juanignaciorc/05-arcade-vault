# SPEC 02 — Home (landing page) de Arcade Vault

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-23
> **Objective:** Portar el Home de `references/templates/home-about/home-about/home.jsx` a `/` y mover la Biblioteca a `/games`, con datos mock y sin la página Acerca de.

## Por qué existe esta spec

SPEC 01 dejó la Biblioteca en `/`. El nuevo template suma una landing page (Home) y una página Acerca de. Esta spec trae solo el Home. Eso obliga a reubicar la Biblioteca y a revisar todos los enlaces que hoy apuntan a `/` con el sentido de "volver a la Biblioteca".

El `styles.css` del nuevo template incluye completo al de SPEC 01 (las primeras 930 líneas son idénticas) y suma los bloques `HOME PAGE`, `ACTIVITY`, `PRICING`, `ABOUT` y `GAMEPAD`. Aquí solo se portan los tres primeros.

## Scope

**In:**

- Home en `/` con todas sus secciones del template:
  - Hero: siluetas pixel flotantes (8 SVG), eyebrow `▸ INSERTA UNA MONEDA_`, título de 3 líneas `EL ARCADE / CLÁSICO ESTÁ / DE VUELTA`, subtítulo, CTAs `▶  EXPLORAR JUEGOS` y `✦  CREAR CUENTA`, indicador `DESLIZA ▼`.
  - `// 01 ¿POR QUÉ ARCADE VAULT?`: 4 feature cards con íconos pixel (`GAMEPAD`, `FREE`, `TROPHY`, `ROCKET`).
  - `// 02 JUEGOS DISPONIBLES AHORA`: rail con las 6 primeras mini-cards de `GAMES` y botón `VER TODOS LOS JUEGOS →`.
  - Franja de stats (3 bloques).
  - `// 03 ACTIVIDAD EN VIVO`: ticker `▸ ÚLTIMAS PUNTUACIONES` (7 filas) y `▸ TOP JUGADORES · HOY` (5 filas con barra) con link `VER SALÓN →`.
  - `// 04 PRECIOS`: card `JUGADOR VAULT` `$0 / SIEMPRE` con sello `FREE PLAY` y 3 FAQ.
  - CTA final `¿LISTO PARA JUGAR?` con botón `INSERTAR MONEDA →`.
- Animación `.reveal` al hacer scroll con `IntersectionObserver`, desactivada con `prefers-reduced-motion: reduce`.
- Biblioteca movida de `/` a `/games` (mismo componente `Library`, sin cambios de comportamiento).
- Nav: nuevo link `Inicio` (escritorio y panel móvil) activo solo en `/`. `Biblioteca` apunta a `/games` y queda activo en `/games` y `/games/*`.
- Enlaces de "volver" existentes redirigidos de `/` a `/games`.
- Copy adaptado al vault: nombres de juegos propios en vez de marcas de terceros, y cantidad de juegos derivada de `GAMES.length`.
- Datos mock del Home tipados en `lib/home.ts`.
- Bloques CSS `HOME PAGE`, `ACTIVITY` y `PRICING` portados a `app/globals.css`.

**Out of scope (para specs futuras):**

- Página Acerca de / Contacto (`about.jsx`) y su link `Acerca de` en el Nav.
- Bloques CSS `ABOUT`, `GAMEPAD` y `Theme variants`, y utilidades sin uso del template (`.tw-*`, `.spinner`, `.slide-in`).
- Actividad y ranking reales (el ticker y el top 5 son mock estáticos).
- Abrir `/auth` directamente en la tab `CREAR CUENTA` desde el CTA del Home.
- Créditos funcionales, sesión de usuario y nombre en el Nav.
- `prefers-reduced-motion` para animaciones fuera de `.reveal` (siluetas, `pulse`, `bounce`, ticker).
- Tests automatizados.

## Data model

```ts
// lib/home.ts
import type { GameColor } from "@/lib/games";

export type FeatureIconKind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

export interface Feature {
  icon: FeatureIconKind;
  title: string;     // "JUEGOS CLÁSICOS"
  desc: string;
  color: GameColor;  // clase de la feature-card: "cyan"
}

export interface HomeStat {
  value: string;     // "8"
  unit: string;      // "JUEGOS"
  sub: string;       // "Y CONTANDO"
}

export interface RecentScore {
  player: string;    // "NEONFOX"
  game: string;      // "Caída"
  score: number;     // 184220
  ago: string;       // "hace 2 min"
  color: GameColor;
}

export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const FEATURES: Feature[];          // 4 items
export const HOME_STATS: HomeStat[];       // 3 items
export const RECENT_SCORES: RecentScore[]; // 7 items, mismos valores que home.jsx
export const TOP_PLAYERS: TopPlayer[];     // 5 items, mismos valores que home.jsx
export const PRICING_PERKS: string[];      // 6 items de la lista "✔ ..."
export const FAQ: FaqItem[];               // 3 items
export const HOME_RAIL_COUNT = 6;
```

Conventions:

- Todos los textos salen de `home.jsx` sin cambios, salvo los dos ajustes de copy:
  - Feature `JUEGOS CLÁSICOS`: `"Bloque Buster, Caída, Serpentina y muchos más. Los mejores arcades de todos los tiempos en un solo lugar."`.
  - Primer stat: `value = String(GAMES.length)`, `unit = "JUEGOS"`, `sub = "Y CONTANDO"`.
- Los nombres de juego de `RECENT_SCORES` ya son títulos del vault y se mantienen.
- El ancho de la barra del top 5 se calcula como en el template: `100 - index * 16` por ciento.
- Números formateados con `toLocaleString("es-ES")`, igual que SPEC 01.
- No hay estado persistente. El único estado del cliente es la clase `.in` que agrega el observer.

## Estructura de archivos

```
lib/home.ts                        (nuevo: datos mock del Home)
components/FloatingSilhouettes.tsx (nuevo: 8 SVG decorativos, aria-hidden)
components/FeatureIcon.tsx         (nuevo: íconos pixel por FeatureIconKind)
components/MiniCard.tsx            (nuevo: Link a /games/[id])
components/RevealObserver.tsx      (nuevo, client: IntersectionObserver sobre .reveal, render null)
app/page.tsx                       (reemplazado: Home, Server Component)
app/games/page.tsx                 (nuevo: Biblioteca, contenido del app/page.tsx actual)
app/globals.css                    (modificado: bloques HOME PAGE, ACTIVITY, PRICING + regla reduced-motion)
components/Nav.tsx                 (modificado: link Inicio, Biblioteca → /games)
app/games/[id]/page.tsx            (modificado: VOLVER AL VAULT → /games)
components/GamePlayer.tsx          (modificado: VOLVER AL VAULT → /games)
components/HallOfFame.tsx          (modificado: VOLVER A LA BIBLIOTECA → /games)
components/AuthForm.tsx            (modificado: submit e invitado → /games)
app/not-found.tsx                  (modificado: botón → /games)
```

## Implementation plan

1. Crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` (`<Library games={GAMES} />`). `/` sigue mostrando la Biblioteca y `/games` también. `npm run build` pasa.
2. Cambiar los enlaces de "volver" de `/` a `/games`: `app/games/[id]/page.tsx`, `components/GamePlayer.tsx`, `components/HallOfFame.tsx`, `components/AuthForm.tsx` (submit y `JUGAR COMO INVITADO`) y `app/not-found.tsx`. El logo del Nav sigue en `/`.
3. Actualizar `components/Nav.tsx`. Agregar la sección `"inicio"` (activa solo si `pathname === "/"`). `"biblioteca"` pasa a estar activa en `/games` y `/games/*`. Agregar el link `Inicio` antes de `Biblioteca` en `.links` y en `.av-mobile-panel`. `Biblioteca` apunta a `/games`. Se mantiene el fallback con `pathname === null`.
4. Portar a `app/globals.css` los bloques `HOME PAGE` (líneas 930–1069 del template, incluido `.reveal`), `ACTIVITY` (1621–1671) y `PRICING` (1672–1725) de `references/templates/home-about/home-about/styles.css`. No duplicar `.fade-in` ni `@keyframes fadeIn`, que ya existen. Agregar `@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }`.
5. Crear `lib/home.ts` con los tipos y constantes del data model. `npm run lint` pasa.
6. Crear `components/FloatingSilhouettes.tsx` y `components/FeatureIcon.tsx` portando los SVG de `home.jsx` (atributos JSX en camelCase, por ejemplo `strokeWidth`).
7. Crear `components/MiniCard.tsx` como `next/link` a `/games/[id]` con la misma estructura `.mini-card` / `.mini-cover` / `.mini-meta`.
8. Crear `components/RevealObserver.tsx` (client). En `useEffect`, si `matchMedia("(prefers-reduced-motion: reduce)")` coincide, agregar `.in` a todos los `.reveal` sin observar. Si no, observar con `threshold: 0.12`, agregar `.in` y dejar de observar. Desconectar al desmontar.
9. Reemplazar `app/page.tsx` por el Home (Server Component). Secciones en el orden del template. Envoltorio `<div className="home fade-in">`. `<RevealObserver />` al final. CTAs con `next/link`: `EXPLORAR JUEGOS`, `VER TODOS LOS JUEGOS` e `INSERTAR MONEDA` → `/games`; `CREAR CUENTA` y `EMPEZAR GRATIS` → `/auth`; `VER SALÓN →` → `/hall-of-fame`. Rail: `GAMES.slice(0, HOME_RAIL_COUNT)`. Los `transitionDelay` y `animationDelay` inline se mantienen como en el template.
10. Comparar visualmente `/` contra `references/templates/home-about/home-about/arcade-vault-standalone.html` a 1440 px y a 375 px, y ajustar diferencias de CSS.

## Acceptance criteria

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `/` muestra el hero con el título `EL ARCADE / CLÁSICO ESTÁ / DE VUELTA` y los botones `EXPLORAR JUEGOS` y `CREAR CUENTA`.
- [ ] `/` muestra las secciones `// 01` a `// 04`, la franja de stats y el CTA `¿LISTO PARA JUGAR?`, en ese orden.
- [ ] La sección `// 02` muestra exactamente 6 mini-cards, de `BLOQUE BUSTER` a `ROCAS`.
- [ ] Click en una mini-card navega a `/games/<id>` del juego correcto.
- [ ] El primer stat muestra `8` / `JUEGOS` / `Y CONTANDO`.
- [ ] Ningún texto de `/` contiene `Arkanoid`, `Tetris` ni `Snake`.
- [ ] El ticker muestra 7 filas y el top muestra 5 filas, con el primero en `312.840`.
- [ ] `EXPLORAR JUEGOS`, `VER TODOS LOS JUEGOS →` e `INSERTAR MONEDA →` navegan a `/games`.
- [ ] `CREAR CUENTA` y `EMPEZAR GRATIS →` navegan a `/auth`. `VER SALÓN →` navega a `/hall-of-fame`.
- [ ] `/games` muestra la Biblioteca con buscador, chips y las 8 cards, igual que antes en `/`.
- [ ] En `/` el link activo del Nav es `Inicio`. En `/games` y `/games/<id>` es `Biblioteca`.
- [ ] El panel móvil (375 px) muestra `Inicio`, `Biblioteca`, `Salón de la Fama` e `Iniciar Sesión`. No muestra `Acerca de`.
- [ ] `VOLVER AL VAULT` (Detalle y modal del Reproductor), `VOLVER A LA BIBLIOTECA` (Salón), el botón de la 404 y el submit/invitado de `/auth` navegan a `/games`.
- [ ] Click en el logo navega a `/`.
- [ ] Al hacer scroll, cada sección `.reveal` pasa de invisible a visible.
- [ ] Con `prefers-reduced-motion: reduce` emulado, todas las secciones `.reveal` son visibles sin hacer scroll.
- [ ] A 375 px de ancho `/` no tiene scroll horizontal.
- [ ] Recargar `/` no produce warnings de hidratación en la consola.

## Decisions

- **Yes:** Home en `/` y Biblioteca en `/games`. Encaja con `/games/[id]` y `/games/[id]/play`, que ya existen.
- **No:** Biblioteca en `/library`. Abre un segundo árbol de rutas para el mismo recurso.
- **No:** Home en `/home`. El landing no sería la portada.
- **Yes:** los enlaces de "volver" van a `/games`. Conservan el sentido de SPEC 01. Solo el logo y `Inicio` llevan a `/`.
- **Yes:** agregar solo `Inicio` al Nav. `Acerca de` llega con la spec de About, así no hay un link a una 404.
- **No:** link `Acerca de` apuntando a una ruta inexistente.
- **Yes:** portar solo los bloques CSS `HOME PAGE`, `ACTIVITY` y `PRICING`. Evita CSS muerto. Cada pantalla trae su CSS en su spec.
- **No:** copiar todo el diff de `styles.css`.
- **Yes:** adaptar el copy al vault (nombres propios y `GAMES.length`). Es consistente con la Biblioteca y evita marcas de terceros.
- **No:** copy verbatim con `Arkanoid, Tetris, Snake` y `12+`. Contradice los 8 juegos reales del vault.
- **Yes:** datos mock en `lib/home.ts`. Separa datos de markup. Una futura spec de scores reemplaza un solo archivo.
- **No:** datos inline en el componente, como en el template.
- **Yes:** `.reveal` respeta `prefers-reduced-motion`. Accesibilidad básica sin costo.
- **Yes:** `app/page.tsx` como Server Component con un único `RevealObserver` client. El resto del Home es estático y no necesita JS.
- **No:** `useReveal` dentro de un Home client completo, como en el template. Mandaría todo el Home como JS al cliente.
- **Yes:** mini-cards a `/games/[id]`, como el template.
- **Yes:** `CREAR CUENTA` va a `/auth` sin preseleccionar la tab. La tab de Auth es estado local (SPEC 01). Preseleccionarla requiere `searchParams` y queda fuera.

## Risks

| Risk | Mitigation |
| --- | --- |
| Secciones `.reveal` invisibles si el observer no corre (JS deshabilitado o error) | La regla `prefers-reduced-motion` cubre a parte de los usuarios. Si aparece en la práctica, invertir la lógica: ocultar solo cuando `<html>` tenga una clase `js`. |
| `RevealObserver` corre antes de que existan los `.reveal` | Se renderiza al final del mismo árbol del Home, así su `useEffect` ve todas las secciones ya montadas. |
| Enlaces a `/` olvidados que ahora llevan al Home en vez de la Biblioteca | El paso 2 lista los 5 archivos detectados con `grep 'href="/"\|push("/")'`. Repetir el grep antes de cerrar. |
| Las clases portadas chocan con nombres existentes en `globals.css` (`.kicker`, `.stat-block`, etc.) | Antes de pegar cada bloque, buscar sus selectores en `globals.css` y revisar `/games/<id>` y `/hall-of-fame` después del paso 4. |
| Cambiar `/` rompe navegación en caché del dev server | Reiniciar `npm run dev` después del paso 1. |

## What is **not** in this spec

- Página Acerca de / Contacto y su link en el Nav.
- CSS de `ABOUT`, `GAMEPAD` y theme variants.
- Actividad, ranking y créditos reales.
- Abrir `/auth` en la tab `CREAR CUENTA`.
- `prefers-reduced-motion` fuera de `.reveal`.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
