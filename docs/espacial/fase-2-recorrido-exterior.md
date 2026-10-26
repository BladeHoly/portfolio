# Fase 2: el recorrido exterior

## Decidido con Renzo (fin de la fase 1)

Curva **nativa** (la cámara sigue el scroll exacto), ruta **órbita** y rueda **por etapas**. Las alternativas (curva suave, ruta deslizar, rueda nativa) y el panel del prototipo se quitaron. El medidor de frames queda detrás de `?debug`.

En el celular, el snap nativo pedía mucha "fuerza": arrastrar media pantalla o un swipe muy rápido. Ahora el táctil también se lee como gesto: la cámara sigue al dedo, y al soltar pasa de etapa con un arrastre corto (12 % de la pantalla) o con un swipe rápido (0,35 px/ms); si no, vuelve. Solo se toman los arrastres verticales: los toques, los links, la selección de texto y el gesto lateral de "volver" del sistema no se tocan. `overscroll-behavior: none` evita que el pull-to-refresh compita con el swipe.

## Lo que hay

- **Las seis caras exteriores, en el orden que pidió Renzo:** 1 arriba, 2 a 5 los cuatro lados y 6 abajo, que es la puerta (cerrada; se diseña en la fase 4). El recorrido va en una sola dirección: de arriba hacia abajo, y después hacia adentro. El primer orden (lados, abajo, puerta arriba) se notaba raro, sobre todo en el celular.
- **Órbita en 3D:** la cámara gira alrededor del centro del cubo y también sube y baja por las aristas. Se aleja más cuanto más larga es la vuelta; de arriba baja por una arista hasta el primer lado, y del último lado baja por otra hasta la puerta. Así la forma del cubo se entiende de pasada, sin mostrarla de golpe.
- **Caras opacas:** son paredes de hielo con un borde fino. Al moverse, el cubo se ve como un bloque, y lo de una cara no se transparenta en las otras.
- **Encuadre adaptativo:** se probó mirar la cara 3 en ángulo (24°). Renzo la vio rara: con texto de prueba, la perspectiva parece un error. Todas las caras quedan de frente y en reposo se dibujan 1:1. El mecanismo (`frame` en `stages.ts`) se conserva para cuando alguna cara tenga contenido que se entienda mejor en perspectiva.
- **Profundidad:** las capas salen de la cara hacia la cámara, nunca hacia dentro del cubo. El vidrio de glass-midas está sobre esas capas.

## Mediciones

Servidor de desarrollo (sin minificar), Chromium. Cada medición es una transición de 900 ms.

| Transición | Escritorio, p95 / peor | Móvil 4×, p95 / peor |
| --- | --- | --- |
| 1 → 2 | 7,0 / 7,2 ms | 13,9 / 14,0 ms |
| 3 → 4 (medido con el encuadre en ángulo) | 7,0 / 7,4 ms | 7,0 / 13,9 ms |
| 4 → 5 (baja por la arista) | 7,0 / 7,3 ms | 7,0 / 7,1 ms |
| 5 → 6 (media vuelta hasta la puerta) | 7,1 / 14,0 ms | 7,0 / 20,8 ms |

Gestos táctiles (móvil emulado, eventos táctiles reales):

| Gesto | Resultado |
| --- | --- |
| Arrastre lento de 130 px (15 %) | avanza ✅ |
| Swipe rápido de 60 px | avanza ✅ |
| Arrastre lento de 50 px | se queda ✅ |
| Arrastre hacia abajo | vuelve una etapa ✅ |
| Toque | no mueve nada ✅ |

## Pendiente

- Probar en un celular real cuánta fuerza pide ahora el swipe.
- Fase 3: navegación directa a cualquier cara y cómo mostrar dónde estás.
