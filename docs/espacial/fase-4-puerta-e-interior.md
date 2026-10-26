# Fase 4: la puerta y el interior

## La puerta

Hubo tres versiones, todas ajustadas con Renzo:

1. Una trampilla de dos hojas. Era demasiado rápida al abrirse y al cerrarse.
2. Un agujero negro en lugar de la puerta. El efecto le gustó, pero tenía que seguir siendo una puerta.
3. **Ahora: la puerta, y del otro lado, la caída del agujero negro.** "Pre agujero estaba bien, pero la animación post agujero es lo bueno".

Cómo funciona la versión actual:

- **La puerta**: la cara de abajo tiene dos hojas que se abren despacio hacia dentro del cubo. Detrás no hay sala, sino un abismo oscuro con un brillo cobalto profundo en el centro. El texto se desvanece al separarse las hojas.
- **La caída**: con las hojas bien abiertas, el abismo tira de la cámara cada vez más rápido y la hace girar sobre su eje, hasta que todo se oscurece.
- **La salida**: desde lo oscuro, la cámara frena frente a la primera pared interior, girando en el mismo sentido hasta asentarse.
- **Hacia atrás**: es el mismo camino al revés; la puerta se cierra detrás.
- **Su propio tiempo**: cruzar dura 2,4 s con cualquier entrada (rueda, swipe, chips o riel). En el celular, sigue desde donde lo dejó el dedo. Solo la barra de scroll y el teclado siguen al scroll exacto.
- **Para la GPU**: el abismo mide exactamente lo que la cara y está pegado detrás de ella, y las hojas se abren hacia la cámara, alejándose del abismo. Ningún plano cruza a otro ni sale de la cara. Un primer intento con un abismo gigante dentro del cubo lo atravesaba entero y dejaba una franja negra en todo el recorrido; Renzo: "quedó todo mucho peor".

## El interior

Es el mismo cubo visto desde dentro: las cuatro paredes y el techo, las cinco capas interiores del plan. Así queda simétrico con el exterior, que va de arriba hacia abajo; el interior da la vuelta por las paredes y termina mirando hacia arriba.

- **Las paredes interiores** están del lado de adentro de las mismas paredes, más oscuras y con tinta clara. Se nota que cambió el ámbito, pero el espacio es el mismo. glass-midas vuelve ahí a sus valores para fondo oscuro.
- **El techo** se lee derecho desde la puerta: es lo primero que se ve al entrar.
- **Entre paredes**, la cámara orbita alrededor del centro igual que afuera. En lugar de alejarse se inclina un poco hacia adentro, porque alejarse la haría atravesar la pared de enfrente.

## Salir y saltar

- **"Volver afuera"** (en el techo) y los saltos del riel entre adentro y afuera vuelan **a través de la puerta**: van hasta ella, la cruzan y siguen. Nunca atraviesan una pared. El vuelo es una sola curva de principio a fin, así que los tramos se encadenan sin detenerse.
- **El riel** tiene once marcas: las seis de afuera, una línea y las cinco de adentro. En el celular es más angosto y va en el margen lateral, a media altura, sin tapar texto ni links.
- **Las direcciones**: `#interior-1` … `#interior-5`.

## Verificado

| Prueba | Resultado |
| --- | --- |
| Un paso de rueda en la puerta | abre la puerta, cae y llega a la cara interior 1 en 2,4 s ✅ |
| Un paso de rueda hacia atrás | sale por el mismo camino en 2,4 s y la puerta queda cerrada ✅ |
| Abrir `#interior-5` | empieza en el techo ✅ |
| "Volver afuera" desde el techo | pasa por la puerta y termina en la cara 1 ✅ |
| Del riel a la cara interior 3 desde afuera | entra por la puerta ✅ |
| En el celular, el riel frente al texto y los links | no se tocan en ninguna cara ✅ |

Rendimiento (servidor de desarrollo, Chromium, transición de 900 ms; medido con la trampilla):

| Transición | Escritorio, p95 / peor | CPU 4× más lenta, p95 / peor |
| --- | --- | --- |
| A través de la puerta | 7,0 / 7,1 ms | 7,1 / 14,1 ms |
| Entre paredes interiores | 7,0 / 7,1 ms | 7,1 / 7,2 ms |

## Corregido en una GPU real

Renzo lo abrió en Brave, con GPU y en una pantalla de 1920×950, y estaba roto. Por la puerta cerrada se veían las paredes interiores y el techo, la puerta aparecía a parches y su texto quedaba detrás. Además, a los lados y abajo había franjas blancas. El navegador emulado de las pruebas dibuja por software y ordenaba bien los planos, así que no mostraba nada de esto.

- **Solo se pintan las caras que la cámara puede ver.** Afuera, en reposo, la cara de enfrente, y entre dos caras, esas dos (al orbitar, las demás quedan de espaldas). En los vuelos largos, todas las de afuera. Adentro, todas las interiores, porque en una sala todas las paredes miran a la cámara.
- **Además, solo el lado del cubo donde está la cámara.** Desde afuera, las caras interiores tienen `visibility: hidden`, y desde adentro, las exteriores. El cambio se hace en lo más oscuro del agujero (55 % del paso), donde no se ve. Así ya nada puede transparentarse, dibuje la GPU los planos en el orden que sea, y hay la mitad de planos para pintar.
- **El cubo mide ahora 2400 px de lado**, en lugar de 1600, así que en reposo una cara cubre hasta una pantalla de 2560 px.

Esto no se puede reproducir sin una GPU real; queda pendiente que Renzo lo confirme.

## Pendiente

- Fase 5: decidir con Renzo el contenido real de las diez capas.
