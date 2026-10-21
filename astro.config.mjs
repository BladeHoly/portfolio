import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// glass-midas comes from the vendor/glass-midas submodule, straight from source:
// nothing to build or publish, and `pnpm glass:update` pulls in library changes.
const glass = (pkg) =>
  fileURLToPath(new URL(`./vendor/glass-midas/packages/${pkg}/src/index.ts`, import.meta.url));

export default defineConfig({
  site: 'https://bladeholy.github.io',
  base: '/portfolio',
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@glass-midas/core': glass('core'),
        '@glass-midas/webgl': glass('webgl'),
        '@glass-midas/react': fileURLToPath(
          new URL('./vendor/glass-midas/packages/react/src/index.tsx', import.meta.url),
        ),
      },
    },
  },
});
