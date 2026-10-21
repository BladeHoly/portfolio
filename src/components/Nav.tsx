import { Glass } from '@glass-midas/react';

const LINKS = [
  ['#trabajo', 'Trabajo'],
  ['#proyectos', 'Proyectos'],
  ['#stack', 'Stack'],
  ['#contacto', 'Contacto'],
] as const;

/** A glass pill that refracts the page as it scrolls underneath. */
export default function Nav() {
  return (
    <Glass glass={{ radius: 26, bezel: 16, thickness: 32 }} className="nav">
      <nav aria-label="Secciones">
        <a href="#top" className="nav-home">
          Renzo
        </a>
        {LINKS.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </Glass>
  );
}
