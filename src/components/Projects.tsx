import { Glass } from '@glass-midas/react';
import { useMemo, useState } from 'react';
import type { Project } from '../data/content';

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const STATUS: Record<Project['status'], string> = {
  público: 'Código abierto',
  'pronto público': 'Código abierto pronto',
  privado: 'Código privado',
};

export default function Projects({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return projects;
    return projects.filter((p) => normalize([p.name, p.what, ...p.stack].join(' ')).includes(q));
  }, [projects, query]);

  return (
    <>
      {/* The search box from kube.io's article; over a page of text it gets more tint and
          frost than the original to keep the input readable. */}
      <Glass glass={{ radius: 28, blur: '4px' }} className="search">
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <label className="visually-hidden" htmlFor="project-search">
          Buscar proyectos
        </label>
        <input
          id="project-search"
          type="search"
          placeholder="Buscar por nombre o tecnología"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </Glass>

      <ul className="projects" aria-live="polite">
        {shown.map((p) => (
          <li key={p.name} className="project">
            <h3>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </h3>
            <p>{p.what}</p>
            <p className="project-meta">
              <span>{p.stack.join(', ')}</span>
              <span className={`status status-${p.status === 'público' ? 'open' : 'closed'}`}>
                {STATUS[p.status]}
              </span>
            </p>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="empty">
          Ningún proyecto coincide con “{query}”. Probá con un lenguaje, como Rust o React.
        </p>
      )}
    </>
  );
}
