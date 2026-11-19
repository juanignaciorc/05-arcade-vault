# SPEC 01 — MVP visual de Arcade Vault (todas las pantallas del template)

> **Status:** Implemented
> **Depends on:** —
> **Date:** 2026-11-19
> **Objective:** Portar a Next.js App Router las cinco pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama) con datos mock y sin juegos reales ni persistencia.

## Por qué existe esta spec

El repo es un scaffold de `create-next-app` con los estilos del template ya portados a `app/globals.css`. Falta la estructura de rutas y los componentes. El template es un SPA en un solo HTML con React UMD + Babel y navegación por hash. Esta spec lo traduce a la convención de Next.js 16 con rutas reales, manteniendo fidelidad visual 1:1.

## Scope

**In:**

- Layout común: `Nav` (logo, links, contador `CRÉDITOS · 03`, botón `Iniciar Sesión`, menú hamburguesa móvil con backdrop) y footer `© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0`.
- Pantalla **Biblioteca** en `/`: hero, buscador por nombre, chips de categoría, grilla de `GameCard` con efecto tilt, estado vacío `NO HAY RESULTADOS`.
- Pantalla **Detalle** en `/games/[id]`: cover, tags, descripción larga, stat-strip, botones `▶ JUGAR AHORA` y `VOLVER AL VAULT`, leaderboard de 10 filas.
- Pantalla **Reproductor** en `/games/[id]/play`: HUD (jugador `INVITADO`, puntuación, vidas, nivel), CRT con arena decorativa, simulación de puntuación que sube sola, `PAUSA`/`REANUDAR`, `FIN`, `SALIR`, modal de fin de juego.
- Pantalla **Auth** en `/auth`: tabs `INICIAR SESIÓN` / `CREAR CUENTA`, campo email solo en "crear cuenta", botón invitado, botones sociales Google/GitHub decorativos.
- Pantalla **Salón de la Fama** en `/hall-of-fame`: tabs por juego, podio top 3, tabla de 12 filas, botón `VOLVER A LA BIBLIOTECA`.
- Página 404 con estética arcade (`app/not-found.tsx`) usada cuando el `id` de juego no existe.
- Datos mock tipados (`GAMES`, `CATS`, `seededScores`) en `lib/games.ts`.

**Out of scope (para specs futuras):**

- Cualquier juego real (canvas, lógica, controles de teclado/táctil).
- Autenticación real, sesión de usuario y backend.
- Persistencia de cualquier tipo (localStorage, base de datos): ni usuario ni puntuaciones.
- Fila "TU MEJOR MARCA" del Salón de la Fama (depende de que exista un usuario).
- Nombre de usuario en el Nav y menú de cuenta.
- Sistema de créditos funcional.
- Login social real (Google/GitHub).
- Pestaña del Salón en la URL (`?game=`).
- Tests automatizados (no hay test runner configurado).

## Data model

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;        // slug usado en la URL: "bloque-buster"
  title: string;     // "BLOQUE BUSTER"
  short: string;     // descripción de la card
  long: string;      // descripción del detalle
  cat: GameCategory;
  cover: string;     // clase CSS de globals.css: "cover-bricks"
  color: GameColor;  // color del botón JUGAR
  best: number;      // mejor puntuación global mock
  plays: string;     // "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;      // "DD/MM/2026"
}

export const GAMES: Game[];                 // los 8 juegos de data.jsx, mismos textos
export const CATS: readonly ["TODOS", ...GameCategory[]];
export function getGame(id: string): Game | undefined;
export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista, mismo algoritmo que data.jsx
```

Convenciones:

- Seeds iguales al template: Detalle usa `id.length * 17 + 3` con 10 filas. Salón usa `id.length * 23 + 7` con 12 filas.
- Números formateados con `toLocaleString("es-ES")`.
- `seededScores` es determinista, así el HTML de servidor y cliente coincide (sin errores de hidratación).
- El estado del Reproductor (`score`, `lives`, `level`, `paused`, `over`, `name`, `saved`) es local al componente y se pierde al salir.

## Estructura de archivos

```
lib/games.ts
components/Nav.tsx            (client: usePathname para el link activo, estado del menú móvil)
components/Footer.tsx
components/GameCard.tsx       (client: tilt con mouse)
components/Library.tsx        (client: búsqueda + filtro de categoría)
components/Leaderboard.tsx
components/GamePlayer.tsx     (client: simulación + modal)
components/AuthForm.tsx       (client: tabs + campos)
components/HallOfFame.tsx     (client: tab del juego seleccionado)
app/layout.tsx                (modificado: Nav + <main className="av-main"> + Footer)
app/page.tsx                  (reemplazado: Biblioteca)
app/games/[id]/page.tsx
app/games/[id]/play/page.tsx
app/auth/page.tsx
app/hall-of-fame/page.tsx
app/not-found.tsx
```

## Implementation plan

1. Consultar `node_modules/next/dist/docs/` para confirmar en Next 16.4: `params` como `Promise`, `generateStaticParams`, `notFound()` y su interacción con `cacheComponents: true`.
2. Crear `lib/games.ts` con los tipos, `GAMES`, `CATS`, `getGame` y `seededScores` portados de `data.jsx`. `npm run lint` pasa.
3. Crear `components/Nav.tsx` y `components/Footer.tsx`. Integrarlos en `app/layout.tsx` envolviendo `children` en `<main className="av-main">`. Links con `next/link`. El link "Biblioteca" queda activo en `/` y en `/games/*`. El link "Salón de la Fama" en `/hall-of-fame`. El botón y el link móvil de sesión navegan a `/auth`.
4. Crear `components/GameCard.tsx` y `components/Library.tsx`. Reemplazar `app/page.tsx` por la Biblioteca. Click en la card o en `JUGAR` navega a `/games/[id]`.
5. Crear `app/not-found.tsx` con estética arcade (título pixel tipo `GAME OVER · 404`, texto breve, botón a `/`).
6. Crear `components/Leaderboard.tsx` y `app/games/[id]/page.tsx`. Usa `getGame` y llama a `notFound()` si no existe. Usa `generateStaticParams` con los ids de `GAMES`. `▶ JUGAR AHORA` va a `/games/[id]/play`. `VOLVER AL VAULT` va a `/`.
7. Crear `components/GamePlayer.tsx` y `app/games/[id]/play/page.tsx` (con `notFound()` para ids inválidos). Simulación: cada 220 ms suma entre 10 y 99 puntos mientras no esté en pausa ni terminado. Sube un nivel cada vez que la puntuación cruza un múltiplo de 2500 (`Math.floor(score / 2500)` aumenta respecto del tick anterior). La regla original del template (`score % 2500 < 100`) se descartó porque subía varios niveles seguidos al inicio de cada tramo. `FIN` abre el modal. `GUARDAR PUNTUACIÓN` solo muestra `▸ PUNTUACIÓN GUARDADA_`. `JUGAR DE NUEVO` reinicia el estado. `VOLVER AL VAULT` va a `/`. `SALIR` va a `/games/[id]`.
8. Crear `components/AuthForm.tsx` y `app/auth/page.tsx`. Submit del formulario y `JUGAR COMO INVITADO` navegan a `/` sin guardar nada. Botones sociales sin acción.
9. Crear `components/HallOfFame.tsx` y `app/hall-of-fame/page.tsx`. Tab inicial = primer juego. Cambiar de tab regenera podio y tabla. Sin fila "TU MEJOR MARCA".
10. Eliminar assets del scaffold que queden sin uso (`public/next.svg`, `public/vercel.svg`, etc.) solo si ningún archivo los referencia.

## Acceptance criteria

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `/` muestra el hero `ARCADE VAULT` y las 8 cards de juego.
- [ ] Escribir `caí` en el buscador deja visible solo `CAÍDA`.
- [ ] Seleccionar el chip `SHOOTER` deja visibles solo `INVASORES` y `ROCAS`.
- [ ] Una búsqueda sin coincidencias muestra `NO HAY RESULTADOS`.
- [ ] Click en una card navega a `/games/<id>` del juego correcto.
- [ ] `/games/caida` muestra título, descripción larga, stat-strip y un leaderboard de 10 filas.
- [ ] `/games/no-existe` y `/games/no-existe/play` muestran la página 404 arcade con botón a `/`.
- [ ] En `/games/<id>/play` la puntuación aumenta sola y el jugador se muestra como `INVITADO`.
- [ ] `PAUSA` detiene la puntuación y muestra `EN PAUSA`. `REANUDAR` la reanuda.
- [ ] `FIN` abre el modal con la puntuación final. `GUARDAR PUNTUACIÓN` muestra `▸ PUNTUACIÓN GUARDADA_`.
- [ ] `JUGAR DE NUEVO` deja puntuación en 0, vidas en 3 y nivel en 01.
- [ ] `/auth` muestra el campo de correo solo en la tab `CREAR CUENTA`.
- [ ] Enviar el formulario de auth o pulsar `JUGAR COMO INVITADO` navega a `/` y el Nav sigue mostrando `Iniciar Sesión`.
- [ ] `/hall-of-fame` muestra podio de 3 y tabla de 12 filas. Cambiar de tab cambia los nombres.
- [ ] El link activo del Nav se resalta en `/`, `/games/<id>` y `/hall-of-fame`.
- [ ] A 375 px de ancho aparece el botón `≡` y abre el panel lateral. Click en el backdrop lo cierra.
- [ ] Recargar cualquier ruta no produce warnings de hidratación en la consola.
- [ ] Ningún archivo escribe ni lee `localStorage`.

## Decisions

- **Yes:** rutas reales del App Router. URLs compartibles e idiomáticas en Next.js.
- **No:** SPA con estado en el hash como el template. Fiel al original pero va contra el framework.
- **Yes:** rutas en inglés (`/games/[id]`, `/games/[id]/play`, `/auth`, `/hall-of-fame`). Decisión del usuario. La UI sigue en español.
- **Yes:** el Reproductor simula la partida como el template. Permite ver todos los estados visuales (jugando, pausa, fin, guardado).
- **No:** Reproductor estático. No permitiría revisar pausa ni el modal de fin.
- **Yes:** nada persiste. El MVP es solo visual. Usuario y puntuaciones quedan para una spec de auth/scores.
- **No:** mock en localStorage. Se descartó para no fijar un formato que luego reemplazará un backend.
- **Yes:** reusar las clases CSS ya portadas en `app/globals.css`. Fidelidad 1:1 y menos trabajo. Tailwind solo para ajustes puntuales.
- **No:** migrar a utilidades Tailwind. Más trabajo y riesgo de diferencias visuales.
- **Yes:** `lib/` y `components/` en la raíz. Encaja con el alias `@/*`.
- **Yes:** 404 arcade con `notFound()` para ids inválidos.
- **No:** redirect silencioso a `/`. Oculta errores de URL.
- **Yes:** pestaña del Salón como estado local. Evita `searchParams` + Suspense con `cacheComponents`.
- **Yes:** ocultar el botón `Iniciar Sesión` del Nav por debajo de 840 px. El panel móvil ya tiene el link de sesión, y así el `≡` entra completo a 375 px (en el template quedaba cortado).
- **Yes:** `export const instant = false` en `/games/[id]` y `/games/[id]/play`. Silencia en dev la validación de navegación instantánea por acceder a `params` fuera de `<Suspense>`; son 8 páginas estáticas livianas.
- **Yes:** componentes interactivos como Client Components aislados. Las `page.tsx` quedan como Server Components que pasan datos.

## Risks

| Risk | Mitigation |
| --- | --- |
| APIs de Next 16.4 distintas a las conocidas (`params` async, `cacheComponents`) | Paso 1 obliga a leer `node_modules/next/dist/docs/` antes de escribir rutas. |
| Errores de hidratación por valores no deterministas | `seededScores` es determinista. `Math.random` solo se usa dentro del intervalo del Reproductor, en el cliente. |
| `toLocaleString("es-ES")` distinto entre Node y navegador | Node trae ICU completo. Si aparece un mismatch, usar un formateador propio con separador `.`. |
| Las clases de `globals.css` divergen del `styles.css` del template | Comparar visualmente cada pantalla con `references/templates/Arcade Vault.html` abierto en el navegador. |

## What is **not** in this spec

- Juegos reales.
- Autenticación, sesión de usuario y backend.
- Persistencia de puntuaciones o usuario.
- Fila "TU MEJOR MARCA" y nombre de usuario en el Nav.
- Créditos funcionales y login social.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
