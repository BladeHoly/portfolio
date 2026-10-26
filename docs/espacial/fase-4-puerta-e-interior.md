# Fase 4: la puerta y el interior

## La puerta

La cara de abajo está partida en dos hojas que, al seguir avanzando, se abren hacia dentro del cubo como una trampilla.

- **El primer tramo** (35 % del paso): las hojas se abren y la cámara se acerca un poco. Por la abertura ya se ve el interior.
- **El resto**: la cámara sube por el centro de la abertura siguiendo una curva y, mientras sube, baja la vista del techo hacia la primera pared interior.
- **Hacia atrás**: es el mismo camino al revés. La cámara baja, sale y las hojas se cierran detrás.

No es un botón que abre otra página. La puerta es parte de la escena y la apertura la maneja el scroll, igual que el resto del recorrido. El texto de la puerta se desvanece al abrirse las hojas.

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
| Un paso de rueda en la puerta | entra, la puerta queda abierta (`--open` 1) ✅ |
| Un paso de rueda hacia atrás | sale, la puerta se cierra ✅ |
| Abrir `#interior-5` | empieza en el techo ✅ |
| "Volver afuera" desde el techo | pasa por la puerta (que se cierra durante el vuelo) y termina en la cara 1 ✅ |
| Del riel a la cara interior 3 desde afuera | entra por la puerta ✅ |
| En el celular, el riel frente al texto y los links | no se tocan en ninguna cara ✅ |

Rendimiento (servidor de desarrollo, Chromium, transición de 900 ms):

| Transición | Escritorio, p95 / peor | CPU 4× más lenta, p95 / peor |
| --- | --- | --- |
| A través de la puerta | 7,0 / 7,1 ms | 7,1 / 14,1 ms |
| Entre paredes interiores | 7,0 / 7,1 ms | 7,1 / 7,2 ms |

## Pendiente

- El piso interior: desde adentro, la puerta abierta deja un hueco. En reposo nunca se ve; quizás se vea al pasar entre paredes en algún ángulo.
- Fase 5: decidir con Renzo el contenido real de las diez capas.
