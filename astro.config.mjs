import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bladeholy.github.io',
  base: '/portfolio',
  integrations: [react()],
});
