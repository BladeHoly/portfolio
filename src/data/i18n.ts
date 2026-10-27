// The two languages of the page: the data of each, and the words of the page itself.
import * as en from './content.en';
import * as es from './content';

export type Lang = 'es' | 'en';

export const data = { es, en } satisfies Record<Lang, unknown>;

export const ui = {
  es: {
    htmlLang: 'es',
    locale: 'es_UY',
    title: 'Renzo, desarrollador',
    // The other language: its name, written in it, and where it lives.
    other: { lang: 'en' as Lang, name: 'English', path: 'en/' },
    faces: {
      'cara-1': 'Renzo',
      'cara-2': 'Trabajo',
      'cara-3': 'Proyectos',
      'cara-4': 'Stack',
      'cara-5': 'Contacto',
      'cara-6': 'Puerta',
    } as Record<string, string>,
    faceNav: 'Seguir',
    rail: 'Caras',
    backToTop: 'Volver arriba',
    backOutside: 'Volver afuera',
    door: { eyebrow: 'Proyectos', title: 'En profundidad', note: 'Detrás de esta puerta, cada proyecto en detalle.' },
    emailMe: 'Escribime',
    since: 'desde',
    until: 'hasta',
    more: 'Ver más',
    moreAbout: (name: string) => `Ver más de ${name}`,
    projectOf: (n: number, total: number) => `Proyecto ${n} de ${total}`,
    builtWith: 'Hecho con',
    code: 'Código en GitHub',
    docs: 'Documentación',
  },
  en: {
    htmlLang: 'en',
    locale: 'en_US',
    title: 'Renzo, developer',
    other: { lang: 'es' as Lang, name: 'Español', path: '' },
    faces: {
      'cara-1': 'Renzo',
      'cara-2': 'Work',
      'cara-3': 'Projects',
      'cara-4': 'Stack',
      'cara-5': 'Contact',
      'cara-6': 'Door',
    } as Record<string, string>,
    faceNav: 'Next',
    rail: 'Faces',
    backToTop: 'Back to the top',
    backOutside: 'Back outside',
    door: { eyebrow: 'Projects', title: 'In depth', note: 'Behind this door, each project in detail.' },
    emailMe: 'Email me',
    since: 'since',
    until: 'until',
    more: 'More',
    moreAbout: (name: string) => `More about ${name}`,
    projectOf: (n: number, total: number) => `Project ${n} of ${total}`,
    builtWith: 'Built with',
    code: 'Code on GitHub',
    docs: 'Documentation',
  },
};
