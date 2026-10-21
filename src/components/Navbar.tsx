import { useGlass } from '@glass-midas/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Project } from '../data/content';

const SECTIONS = [
  ['top', 'Inicio'],
  ['trabajo', 'Trabajo'],
  ['proyectos', 'Proyectos'],
  ['stack', 'Stack'],
  ['contacto', 'Contacto'],
] as const;

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The section whose top has passed a line a third of the way down the viewport. */
function useActiveSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = () => {
      const line = innerHeight * 0.35;
      let current = 0;
      SECTIONS.forEach(([id], i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      // The last section may be too short to reach the line: count the page bottom as its own.
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
        current = SECTIONS.length - 1;
      }
      setActive(current);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, []);
  return active;
}

/** Like iOS 26: minimize while scrolling down, expand when scrolling back up. */
function useCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let last = scrollY;
    const narrow = matchMedia('(max-width: 40rem)');
    const update = () => {
      const y = scrollY;
      if (narrow.matches) setCollapsed(true);
      else if (y < 120) setCollapsed(false);
      else if (y - last > 6) setCollapsed(true);
      else if (last - y > 6) setCollapsed(false);
      last = y;
    };
    update();
    addEventListener('scroll', update, { passive: true });
    narrow.addEventListener('change', update);
    return () => {
      removeEventListener('scroll', update);
      narrow.removeEventListener('change', update);
    };
  }, []);
  return collapsed;
}

/**
 * A glass droplet that slides to the link it marks on a spring, stretching with its speed,
 * the way a drop of liquid would. It's a lens: the link under it shows magnified.
 */
function useDroplet(target: () => { x: number; width: number } | undefined, deps: unknown[]) {
  const droplet = useRef<HTMLSpanElement>(null);
  const state = useRef({ x: 0, w: 0, vx: 0, vw: 0, running: false, placed: false });

  useGlass(droplet, {
    radius: 999,
    bezel: 14,
    thickness: 26,
    magnify: 0.16,
    specular: 0.5,
    specularSaturation: 3,
  });

  useEffect(() => {
    const el = droplet.current;
    const goal = target();
    if (!el || !goal) return;
    const s = state.current;
    const apply = (stretch: number) => {
      el.style.width = `${s.w}px`;
      el.style.transform = `translateX(${s.x}px) scaleX(${1 + stretch})`;
    };
    if (!s.placed || reduceMotion()) {
      Object.assign(s, { x: goal.x, w: goal.width, vx: 0, vw: 0, placed: true });
      apply(0);
      return;
    }
    if (s.running) return;
    s.running = true;
    let last = performance.now();
    const step = (now: number) => {
      const t = target() ?? goal;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const k = 320; // stiffness
      const c = 28; // damping: a little bounce at the end
      s.vx += (k * (t.x - s.x) - c * s.vx) * dt;
      s.vw += (k * (t.width - s.w) - c * s.vw) * dt;
      s.x += s.vx * dt;
      s.w += s.vw * dt;
      apply(Math.min(0.35, Math.abs(s.vx) / 2600));
      const settled = Math.abs(t.x - s.x) < 0.3 && Math.abs(s.vx) < 8 && Math.abs(t.width - s.w) < 0.3;
      if (settled) {
        Object.assign(s, { x: t.x, w: t.width, vx: 0, vw: 0, running: false });
        apply(0);
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, deps);

  return droplet;
}

interface Result {
  label: string;
  hint: string;
  href: string;
}

export default function Navbar({ projects }: { projects: Project[] }) {
  const active = useActiveSection();
  const collapsed = useCollapsed();
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const pill = useRef<HTMLElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  useGlass(pill, { radius: 999, bezel: 18, thickness: 36 });
  useGlass(search, { radius: 999, bezel: 18, thickness: 36 });
  useGlass(results, { radius: 24, bezel: 18, thickness: 32, blur: '6px' });

  const marked = hovered ?? active;
  const droplet = useDroplet(
    () => {
      const a = links.current[marked];
      return a ? { x: a.offsetLeft, width: a.offsetWidth } : undefined;
    },
    [marked, collapsed],
  );

  const matches: Result[] = useMemo(() => {
    const norm = (s: string) => slug(s).replace(/-/g, ' ');
    const q = norm(query.trim());
    const all: Result[] = [
      ...projects.map((p) => ({
        label: p.name,
        hint: p.stack.join(', '),
        href: `#proyecto-${slug(p.name)}`,
      })),
      ...SECTIONS.map(([id, label]) => ({ label, hint: 'Sección', href: `#${id}` })),
    ];
    if (!q) return all.slice(0, 7);
    return all.filter((r) => norm(`${r.label} ${r.hint}`).includes(q)).slice(0, 7);
  }, [projects, query]);

  useEffect(() => setSelected(0), [query]);

  // Ctrl/⌘ K opens the search from anywhere; Escape closes it.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!search.current?.contains(t) && !results.current?.contains(t)) setOpen(false);
    };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onPointer);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('pointerdown', onPointer);
    };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
    else setQuery('');
  }, [open]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    setOpen(false);
    const target = document.querySelector(r.href);
    target?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
    if (target instanceof HTMLElement) {
      target.classList.remove('is-found');
      void target.offsetWidth; // restart the highlight
      target.classList.add('is-found');
    }
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(matches[selected]);
    }
  };

  return (
    <header className={`navbar${collapsed ? ' is-collapsed' : ''}${open ? ' is-searching' : ''}`}>
      <nav ref={pill} className="nav-pill" aria-label="Secciones" onPointerLeave={() => setHovered(null)}>
        <span ref={droplet} className="nav-droplet" aria-hidden="true" />
        {SECTIONS.map(([id, label], i) => (
          <a
            key={id}
            ref={(a) => {
              links.current[i] = a;
            }}
            href={`#${id}`}
            className={i === active ? 'is-active' : collapsed ? 'is-hidden' : undefined}
            aria-current={i === active ? 'location' : undefined}
            onPointerEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
          >
            {label}
          </a>
        ))}
      </nav>

      <div ref={search} className="nav-search">
        <button
          type="button"
          className="nav-search-button"
          aria-label="Buscar (Ctrl+K)"
          aria-expanded={open}
          aria-controls="nav-results"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </button>
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label="Buscar proyectos y secciones"
          aria-expanded={open}
          aria-controls="nav-results"
          aria-activedescendant={open && matches[selected] ? `result-${selected}` : undefined}
          placeholder="Buscar proyectos o tecnologías"
          tabIndex={open ? 0 : -1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
        />
      </div>

      <div ref={results} id="nav-results" className="nav-results" role="listbox" hidden={!open}>
        {matches.length ? (
          matches.map((r, i) => (
            <div
              key={r.href}
              id={`result-${i}`}
              role="option"
              aria-selected={i === selected}
              className="nav-result"
              onPointerEnter={() => setSelected(i)}
              onClick={() => go(r)}
            >
              <span>{r.label}</span>
              <small>{r.hint}</small>
            </div>
          ))
        ) : (
          <p className="nav-empty">Nada coincide con “{query}”. Probá con un lenguaje, como Rust.</p>
        )}
      </div>
    </header>
  );
}
