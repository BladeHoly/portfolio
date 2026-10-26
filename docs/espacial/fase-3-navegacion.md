# Fase 3: navegación directa

Se puede recorrer el cubo con el scroll o saltar a cualquier cara, y siempre se ve dónde se está, sin una navbar convencional. Todos los controles son de glass-midas: chips `.gm-chip` (el activo con `aria-current`, que les da su borde) sobre un `gm-surface` de vidrio esmerilado.

## Cómo funciona

- **Contextual:** al pie de cada cara hay chips hacia la cara anterior y la siguiente, y en la puerta, uno de "Volver arriba". Es la forma de avanzar sin conocer la estructura.
- **El mapa espacial:** en una esquina, el cubo desplegado en cruz y en el orden del recorrido: la 1 arriba, los cuatro lados en fila y la puerta abajo. Muestra la forma del cubo sin dibujarlo en 3D, marca la cara actual, y tocar un número lleva a esa cara. Hay una alternativa para comparar, `?mapa=riel`: una columna de seis marcas.
- **Saltos:** a una cara vecina se llega con la órbita normal, por el scroll. A una lejana, con un vuelo directo compuesto: la cámara se aleja lo suficiente para ver el cubo entero un momento y aterriza en la cara, sin recorrer las de en medio. Su duración crece con el giro (de 0,5 s a 1,2 s) y usa una curva que empieza y termina en reposo. Con movimiento reducido, el salto es un corte.
- **Direcciones:** cada cara tiene la suya (`#cara-1` … `#cara-6`). La barra de direcciones sigue a la cara actual, un enlace abre directamente en esa cara, y los chips y el mapa son enlaces de verdad (se pueden abrir, copiar y compartir).
- **Teclado y lectores de pantalla:** el mapa es un `nav` con nombre, cada número dice qué cara es y el Tab que entra en otra cara lleva la cámara hasta ella.

## Verificado

| Prueba | Resultado |
| --- | --- |
| Del mapa, de la cara 1 a la puerta | vuelo directo; termina en la 6 con `#cara-6` ✅ |
| "Volver arriba" desde la puerta | vuelo directo hasta la 1 ✅ |
| Del mapa a una cara vecina | por la órbita normal ✅ |
| Abrir `/#cara-4` | empieza en la cara 4 ✅ |
| En el celular, los chips de una cara | se ven y se pueden tocar (las capas de profundidad ya no los tapan) ✅ |

## Decidido con Renzo

El **riel** (una columna con las seis caras) en lugar del mapa del cubo desplegado en cruz. La cruz y `?mapa=riel` se quitaron.
