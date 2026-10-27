# Fase 6: optimización y verificación

Medido sobre el build de producción (`pnpm build` + `pnpm preview`), en un Chrome con la GPU de la máquina (AMD Radeon RX 9060 XT).

## Carga

| | Escritorio 1920×950 | Celular 390×844, CPU 4× más lenta, 4G lento |
| --- | --- | --- |
| Primer pintado (FCP) | 0,23 s | 0,62 s |
| Mayor pintado (LCP) | 0,36 s | 0,79 s |
| Saltos de layout (CLS) | 0 | 0,011 |
| Peso transferido (sin la fuente) | 17 KB | 17 KB |

La página pesa unos 15 KB gzip: el HTML (4 KB), el script de la cámara (6,5 KB) y el CSS (4,3 KB). De glass-midas se importan solo las hojas que se usan (base, surface, badge y accordion), no el `styles.css` entero, que eran 12 KB gzip.

## Fluidez

Las 10 transiciones del recorrido, con el vidrio de los paneles:

| | p50 | p95 | Peor frame | Frames perdidos |
| --- | --- | --- | --- | --- |
| Escritorio | 8,0 ms | 8,1 ms | 44 ms | 1 de 1161 |
| Celular, CPU 4× | 8,0 ms | 8,1 ms | 15,7 ms | 0 de 1157 |

## Accesibilidad

- **axe** (WCAG 2.2 AA y buenas prácticas) en las 11 caras, en escritorio y celular: sin violaciones.
- **Contraste sobre vidrio**: axe no puede medirlo a través de `backdrop-filter`, así que se midió con píxeles. Se captura el fondo real con el texto oculto y se compara con el color del texto. El mínimo es 5,65:1. El gris del texto secundario se oscureció para llegar (antes daba 4,3 sobre el charco más azul).
- **Movimiento reducido**: la cámara corta a la cara siguiente, sin viaje.
- **Sin JavaScript**: `public/flat.css` (dentro de `<noscript>`) despliega el cubo como una página común, con las 11 caras en orden.

## Vidrio

Cada cara tiene detrás unos charcos de color (`src/faces/Art.astro`), en el plano de la cara para no dar problemas con la GPU, y el contenido va en un panel `gm-surface` esmerilado con borde nítido (tier `blur` en los paneles grandes, como en el portfolio anterior). La regla "nunca vidrio dentro de vidrio": dentro de los paneles, los botones son chips primarios de glass-midas, no `gm-button`. El riel también es vidrio.

## Redes sociales

`og.png` (1200×630, la cara "Renzo"), Open Graph y Twitter card, canonical y `theme-color`.
