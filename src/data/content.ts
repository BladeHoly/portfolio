// Everything the page says, in one place.

export const contact = {
  email: 'renzohpg@gmail.com',
  github: 'https://github.com/BladeHoly',
  linkedin: 'https://www.linkedin.com/in/renzo-pandolfo-genoud-a062283a0',
};

export interface Job {
  company: string;
  /** Leave empty until it's confirmed; the page then shows only the company. */
  role: string;
  start: string;
  end?: string;
  summary: string;
}

// TODO: a one-line summary of the work at Mozart, from the LinkedIn profile.
export const jobs: Job[] = [
  { company: 'Mozart Fintech', role: 'AI Engineer', start: 'octubre de 2025', summary: '' },
];

export interface Project {
  name: string;
  what: string;
  stack: string[];
  /** Public repository; private projects have none. */
  url?: string;
  status: 'público' | 'privado' | 'pronto público';
}

export const projects: Project[] = [
  {
    name: 'glass-midas',
    what: 'Un sistema de estilos de vidrio líquido para la web. Refracta lo que hay detrás con óptica real, en SVG o WebGL, y se adapta a lo que cada navegador puede dibujar. Este sitio está hecho con él.',
    stack: ['TypeScript', 'WebGL', 'SVG', 'Astro'],
    url: 'https://github.com/BladeHoly/glass-midas',
    status: 'público',
  },
  {
    name: 'qpck-tools',
    what: 'Desempaqueta y reempaqueta los contenedores .qpck de God Eater Resurrection para poder moddear el juego. Una librería con el formato y una herramienta de línea de comandos.',
    stack: ['Rust'],
    status: 'pronto público',
  },
  {
    name: 'Migrador IMAP a Gmail',
    what: 'Copia el correo de un servidor IMAP a Gmail sin tocar nunca el origen. Si se corta a la mitad, retoma desde donde quedó sin duplicar mensajes.',
    stack: ['Node.js', 'React', 'Gmail API'],
    status: 'pronto público',
  },
  {
    name: 'Juampi Deals',
    what: 'Un comparador de ofertas de videojuegos para Argentina y Uruguay: busca un juego y ves cuánto cuesta en cada tienda.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1'],
    status: 'privado',
  },
  {
    name: 'Calculadora de interés compuesto',
    what: 'Calcula cuánto crece una inversión con aportes periódicos e interés compuesto.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/BladeHoly/Calculadora-Interes-Compuesto',
    status: 'público',
  },
];

export const stack = [
  { area: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'Rust', 'HTML', 'CSS'] },
  { area: 'Frontend', items: ['React', 'Astro', 'Vite', 'WebGL', 'SVG'] },
  { area: 'Backend', items: ['Node.js', 'Cloudflare Workers', 'D1'] },
  { area: 'Herramientas', items: ['Git', 'GitHub', 'pnpm', 'Vitest'] },
];
