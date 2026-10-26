# Fase 4: la puerta y el interior

## La puerta

Se ajustó varias veces con Renzo. Lo que quedó:

- **Una puerta que se lee como puerta**: dos hojas, cada una con un panel en relieve y una manija junto a la abertura. El texto va en la primera hoja, sin que la línea del medio lo cruce, y se va con ella al abrirse. En pantallas anchas las hojas están lado a lado; en pantallas altas (celular), una arriba de la otra.
- **Se abre hacia la cámara**, y por la abertura se ve el interior del cubo. Nada de efectos negros: "es mejor que se sienta natural".
- **Warp**: con las hojas abiertas, la cámara sube en línea recta como un cohete, arranca acelerando fuerte y, cerca del techo, frena de golpe y se asienta, "como si estuvieras viajando warp y de repente tenés que frenar porque estás en órbita". La curva (`warp` en `camera.ts`) sube la velocidad en el primer octavo, la mantiene y frena desde el 62 %.
- **Hacia atrás**: es el mismo camino al revés, y la puerta se cierra detrás.
- **Su propio tiempo**: cruzar dura 2,4 s con cualquier entrada (30 % para abrir y 70 % de viaje).

Intentos descartados: una trampilla demasiado rápida; un agujero negro en lugar de la puerta; un abismo oscuro detrás de las hojas (un abismo gigante atravesaba el cubo entero y dejaba una franja negra en todo el recorrido); un agujero negro dibujado sobre la pantalla ("ya ni parece una puerta").

## El interior

Es el mismo cubo visto desde dentro, con las cinco capas interiores del plan. **La cara interior 1 es el techo, justo enfrente de la puerta**, así que se va derecho hacia ella. Después, las cuatro paredes.

- **Las paredes interiores** son más oscuras y tienen tinta clara: se nota que cambió el ámbito, pero el espacio es el mismo. glass-midas vuelve ahí a sus valores para fondo oscuro.
- **Entre caras**, la cámara orbita alrededor del centro igual que afuera. En lugar de alejarse se inclina un poco hacia adentro, porque alejarse la haría atravesar la pared de enfrente.

## La GPU (probado en la de Renzo, una Radeon RX 9060 XT con Chrome)

- **Solo se pintan las caras visibles**: afuera, la de enfrente o las dos de una transición; en la puerta, la puerta y el interior mientras se abre, y solo el interior desde que la cámara sube. Una vez abiertas, las hojas quedan fuera del cuadro, y pintada, la puerta explotaba de tamaño al cruzar la cámara su plano y perdía tiles. Adentro, todas las interiores.
- **Las caras ocultas salen del todo** (`display: none`): ocultas pero vivas, Chrome reusaba tiles perdidos al volver a mostrarlas.
- **Las hojas se dibujan una sola vez** (`will-change: transform`) y solo se giran; redibujadas en cada ángulo, perdían tiles tras unos cruces.
- **Las caras interiores quedan 8 px antes de las aristas**, para no tocar el plano de la puerta ni las paredes exteriores, y con el interior a la vista el fondo es oscuro, así que esas juntas no se ven.
- Verificado: 5 cruces seguidos con la rueda y varios saltos del riel a través de la puerta. La puerta vuelve entera siempre.

## Salir y saltar

- **"Volver afuera"** (en la última pared) y los saltos del riel entre adentro y afuera vuelan **a través de la puerta**: van hasta ella, la cruzan y siguen. Nunca atraviesan una pared. El vuelo es una sola curva de principio a fin, así que los tramos se encadenan sin detenerse.
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

Desde entonces las pruebas también se hacen en un Chrome visible con la GPU de la máquina, el mismo camino de dibujo que usa el Brave de Renzo.

## Pendiente

- Fase 5: decidir con Renzo el contenido real de las diez capas.
