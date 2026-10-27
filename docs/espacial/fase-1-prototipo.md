# Fase 1: prototipo de movimiento

Tres caras exteriores del cubo con contenido marcado como placeholder, una cámara que se mueve sobre contenido fijo y el scroll por etapas. El panel de la esquina ("Controles del prototipo") cambia en vivo la curva, la ruta y el modo de la rueda; también se pueden elegir por URL: `?curva=nativa|suave&ruta=orbita|deslizar&rueda=etapas|nativa`.

## Cómo funciona

- **La cámara.** Hay una sola escena CSS 3D (`.world`). La cámara es la transformación inversa que se le aplica a esa escena; las caras no se mueven nunca. En reposo, la cara queda a la distancia de la perspectiva y se dibuja 1:1, así que el texto es tan nítido como en una página plana.
- **El scroll.** Es el del navegador: un punto de snap por etapa, con `scroll-snap-stop: always`. La cámara lee la posición del scroll y se coloca sobre la ruta entre las dos etapas que la rodean. Como el scroll es nativo, funcionan la barra de scroll, el teclado (flechas, RePág, Inicio, Fin), el táctil y la accesibilidad, y nada queda secuestrado.
- **La rueda, por gestos (modo `etapas`).** Un gesto empieza después de una pausa de 160 ms, con un cambio de dirección o cuando los deltas vuelven a subir después de que la inercia del trackpad ya se apagó. Cada gesto avanza una etapa, y repetirlo encadena como máximo una etapa por delante de la cámara.
- **El foco.** Si el Tab o un lector de pantalla entran en otra cara, la cámara va hacia ella.
- **Movimiento reducido.** Con `prefers-reduced-motion`, la cámara no viaja: corta directo a la etapa más cercana.

## Mediciones

Chromium (Playwright). En escritorio, a 1440×900. En móvil, emulación de 390×844 a 3x con la CPU 4× más lenta. Cada medición es una transición completa de 900 ms.

| Caso | Media por frame | p95 | Peor frame |
| --- | --- | --- | --- |
| Escritorio, órbita | 6,9 ms (144 Hz, sin frames perdidos) | 7,0 ms | 7,1 ms |
| Escritorio, deslizar | 6,9 ms | 7,1 ms | 7,2 ms |
| Móvil 4×, órbita | 8,3 ms | 13,9 ms | 14,3 ms |
| Móvil 4×, deslizar | 8,9 ms | 14,0 ms | 20,7 ms (un frame perdido) |

Gestos de rueda: etapa a la que llega la cámara partiendo de la 0.

| Gesto | `etapas` | `nativa` |
| --- | --- | --- |
| Un paso de rueda (120 px) | 1 ✅ | 0 ❌ (vuelve al punto más cercano) |
| Un solo delta enorme (4000 px) | 1 ✅ | 2 ❌ (se salta una etapa) |
| Rueda girada rápido (12 pasos en 300 ms) | 1 ✅ | 0 ❌ |
| Trackpad con inercia | 1 ✅ | 0 ❌ |
| Dos gestos seguidos (250 ms entre ellos) | 2 ✅ | 0 ❌ |
| Gesto y vuelta atrás a mitad | 0 ✅ | 0 ✅ |

En todos los casos la cámara termina exactamente sobre una etapa.

**Decisión:** la rueda va en modo `etapas`. El táctil y el teclado se quedan nativos, porque el snap del navegador ya hace lo correcto con ellos.

## Para juzgar a mano

Esto no se puede medir y Renzo lo tiene que sentir:

- **Curva `nativa` frente a `suave`.** La nativa sigue el scroll exacto y el ritmo lo marca el navegador. La suave suaviza cada transición y deja que la cámara siga al scroll con un poco de retraso.
- **Ruta `órbita` frente a `deslizar`.** La órbita gira alrededor del cubo a altura constante y se aleja poco. Deslizar sube y se aleja más, corta por la esquina, y el giro va detrás del desplazamiento.

## Pendiente

- Probar en dispositivos reales: el swipe en iOS y Android (snap nativo), un trackpad de Mac y Safari, donde el vidrio usa el tier `blur`.
- Las caras de arriba y de abajo (pitch) y la puerta: Fase 2 y Fase 4.
- La navegación directa: Fase 3.
