# Fase 0: auditoría técnica

Octubre 2026. Plan de referencia: el brief "portfolio espacial con Glass-Midas".

## Lo que había

- Astro 7 con islas de React 19, Lenis (scroll suavizado), GSAP y `@glass-midas/react` 0.1.
- Una página larga de secciones apiladas (hero, trabajo, proyectos, stack, contacto), con vidrio en la navbar, la búsqueda, la barra de scroll y los paneles.
- Los datos (`src/data/content.ts`) son lo único que se conserva. Renzo decidió descartar el resto: no sirve de base para la experiencia nueva.
- Deploy: GitHub Pages con `.github/workflows/deploy.yml` en cada push a `main`, servido en `/portfolio/`.

## Decisiones

- **Astro se queda.** Genera HTML estático, el contenido llega en el primer byte y no obliga a usar ningún framework. Cambiarlo no aportaría nada.
- **Se van React, Lenis y GSAP.** La experiencia es una sola escena con una cámara: la cámara es matemática propia y pequeña (`src/scene/camera.ts`), y el vidrio son los Web Components de glass-midas, que no necesitan React. Menos JS y menos dependencias.
- **El vidrio y los controles son glass-midas, sin excepciones.** Se usan `@glass-midas/components` 0.6 (`gm-surface`, `gm-button` y los demás) y se tematizan solo con sus tokens `--gm-*`. Si falta algo, se agrega a glass-midas en su propia PR, no en el portfolio.
- **Escena en CSS 3D, no en WebGL.** El contenido sigue siendo DOM: texto seleccionable, foco, lectores de pantalla y búsqueda en la página funcionan solos, y glass-midas funciona dentro (verificado: el `backdrop-filter` ve las capas de la escena). WebGL (`@glass-midas/webgl`) queda para efectos puntuales si alguna cara lo justifica.

## Riesgos

| Riesgo | Cómo se mide o se mitiga |
| --- | --- |
| La rueda, el trackpad y el táctil se comportan distinto en cada navegador con scroll snap. | Medido en la Fase 1: el snap nativo no basta con la rueda, así que la rueda se lee por gestos. |
| El vidrio en 3D y en movimiento cuesta GPU. | Medir fps y el peor frame en cada fase; en móvil, tier `blur` si hace falta. |
| El texto en 3D puede verse borroso. | En reposo, la cara queda a la distancia de la perspectiva, así que se dibuja 1:1. |
| Safari y Firefox no dibujan la refracción de glass-midas. | Sus tiers `blur` y `solid` ya cubren ese caso; los visuales se revisan en dispositivos reales. |

## Cómo se ejecuta

- `pnpm dev`: servidor local en `http://localhost:4321/portfolio/`.
- `pnpm build`, luego `pnpm preview`: la versión de producción.
