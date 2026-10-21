# Portfolio de Renzo

Sitio personal hecho con [Astro](https://astro.build), islas de React y
[glass-midas](https://github.com/BladeHoly/glass-midas), mi librería de vidrio líquido. También es
el banco de pruebas de glass-midas: cada vidrio de la página es la librería funcionando en un sitio
real.

La versión anterior, la del curso, está en el tag [`v1-curso`](https://github.com/BladeHoly/portfolio/tree/v1-curso).

## Desarrollo

glass-midas llega desde npm, como `@glass-midas/react`.

```sh
git clone https://github.com/BladeHoly/portfolio.git
pnpm install
pnpm dev                        # http://localhost:4321/portfolio/
pnpm build
pnpm update "@glass-midas/*"    # trae la última versión de glass-midas
```

Todo el contenido (experiencia, proyectos, stack, contacto) está en `src/data/content.ts`.
