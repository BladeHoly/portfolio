import { useGlass } from '@glass-midas/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Project } from '../data/content';
import { scrollToTarget } from '../lib/scroll';

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

/** Wide screens get a sidebar; narrow ones keep a bar along the top. */
function useSidebar() {
  const [side, setSide] = useState(false);
  useEffect(() => {
    const wide = matchMedia('(min-width: 48rem)');
    const update = () => setSide(wide.matches);
    update();
    wide.addEventListener('change', update);
    return () => wide.removeEventListener('change', update);
  }, []);
  return side;
}

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

/** The top bar, like iOS 26: minimized on small screens and while scrolling down. */
function useCollapsed(side: boolean) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (side) {
      setCollapsed(false);
      return;
    }
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
  }, [side]);
  return collapsed;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A glass droplet under the link it marks. It slides there on a spring and stretches along
 * the way it moves, like a drop of liquid. It sits under the text, like the selected tab on
 * iOS: thin clear glass that bends the pill behind it and leaves the text crisp.
 */
function useDroplet(target: () => Box | undefined, deps: unknown[]) {
  const droplet = useRef<HTMLSpanElement>(null);
  const targetRef = useRef(target);
  targetRef.current = target;
  const s = useRef({ x: 0, y: 0, w: 0, h: 0, vx: 0, vy: 0, vw: 0, vh: 0 }).current;
  const run = useRef({ running: false, placed: false, until: 0 }).current;

  useGlass(droplet, {
    radius: 999,
    bezel: 10,
    thickness: 16,
    caustics: false,
    blur: '0px',
    specular: 0.45,
    specularSaturation: 3,
  });

  const apply = (sx: number, sy: number) => {
    const el = droplet.current;
    if (!el) return;
    el.style.width = `${s.w}px`;
    el.style.height = `${s.h}px`;
    el.style.transform = `translate(${s.x}px, ${s.y}px) scale(${sx}, ${sy})`;
  };

  // Starts the spring and keeps it following the target for at least `ms`: the links
  // themselves move while the bar animates its size.
  const follow = (ms: number) => {
    const goal = targetRef.current();
    if (!droplet.current || !goal) return;
    if (!run.placed || reduceMotion()) {
      Object.assign(s, goal, { vx: 0, vy: 0, vw: 0, vh: 0 });
      run.placed = true;
      apply(1, 1);
      return;
    }
    run.until = Math.max(run.until, performance.now() + ms);
    if (run.running) return;
    run.running = true;
    let last = performance.now();
    const step = (now: number) => {
      const t = targetRef.current() ?? goal;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const k = 320; // stiffness
      const c = 28; // damping: a little bounce at the end
      for (const [p, v] of [
        ['x', 'vx'],
        ['y', 'vy'],
        ['w', 'vw'],
        ['h', 'vh'],
      ] as const) {
        s[v] += (k * (t[p] - s[p]) - c * s[v]) * dt;
        s[p] += s[v] * dt;
      }
      apply(1 + Math.min(0.3, Math.abs(s.vx) / 2600), 1 + Math.min(0.3, Math.abs(s.vy) / 2600));
      const close =
        Math.abs(t.x - s.x) + Math.abs(t.y - s.y) + Math.abs(t.w - s.w) + Math.abs(t.h - s.h) < 0.6 &&
        Math.abs(s.vx) + Math.abs(s.vy) < 10;
      if (close && now > run.until) {
        Object.assign(s, t, { vx: 0, vy: 0, vw: 0, vh: 0 });
        run.running = false;
        apply(1, 1);
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const followRef = useRef(follow);
  followRef.current = follow;

  // Long enough to cover the bar's 0.45 s size transition.
  useEffect(() => followRef.current(600), deps);

  // Any other size change of the bar (fonts loading, a resized window) moves the links too.
  useEffect(() => {
    const bar = droplet.current?.parentElement;
    if (!bar) return;
    const observer = new ResizeObserver(() => followRef.current(200));
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return droplet;
}

interface Result {
  label: string;
  hint: string;
  href: string;
}

export default function Navbar({ projects }: { projects: Project[] }) {
  const side = useSidebar();
  const active = useActiveSection();
  const collapsed = useCollapsed(side);
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const pill = useRef<HTMLElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  useGlass(pill, { radius: 28, bezel: 18, thickness: 36 });
  useGlass(search, { radius: 999, bezel: 18, thickness: 36 });
  useGlass(results, { radius: 24, bezel: 18, thickness: 32, blur: '6px' });

  const marked = hovered ?? active;
  const droplet = useDroplet(
    () => {
      const a = links.current[marked];
      return a ? { x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight } : undefined;
    },
    [marked, collapsed, side],
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
    const target = document.querySelector<HTMLElement>(r.href);
    if (!target) return;
    scrollToTarget(target);
    target.classList.remove('is-found');
    void target.offsetWidth; // restart the highlight
    target.classList.add('is-found');
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

  const classes = ['navbar', side && 'is-side', collapsed && 'is-collapsed', open && 'is-searching'];

  return (
    <header className={classes.filter(Boolean).join(' ')}>
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
