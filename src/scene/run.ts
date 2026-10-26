import '@glass-midas/components/surface';
import '@glass-midas/components/button';
import { smootherstep, worldTransform } from './camera';
import { PERSPECTIVE, STAGES, poseAt, type Path } from './stages';

// Scroll drives the camera. The page keeps the browser's own scrolling: one snap point per
// stage, each with `scroll-snap-stop: always`, so a fast flick moves one stage and never
// throws the camera across several, the wheel, trackpad, touch, keys and scrollbar all work,
// and nothing is hijacked. The camera reads the scroll position and puts itself on the path
// between the two stages around it.

type Curve = 'nativa' | 'suave';

const root = document.documentElement;
const world = document.querySelector<HTMLElement>('.world')!;
const stops = [...document.querySelectorAll<HTMLElement>('.stop')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const params = new URLSearchParams(location.search);
const settings = {
  curve: (params.get('curva') === 'suave' ? 'suave' : 'nativa') as Curve,
  path: (params.get('ruta') === 'deslizar' ? 'deslizar' : 'orbita') as Path,
  wheel: (params.get('rueda') === 'nativa' ? 'nativa' : 'etapas') as 'etapas' | 'nativa',
};

/** Where the scroll is, in stages: 1.5 is halfway between the second and third. */
function target() {
  const step = stops[0].offsetHeight;
  return Math.min(STAGES.length - 1, Math.max(0, scrollY / step));
}

function render(s: number) {
  const i = Math.min(Math.floor(s), STAGES.length - 2);
  const f = s - i;
  // Reduced motion: no travel at all; the camera cuts to the nearest stage.
  const t = reduce.matches ? Math.round(f) : settings.curve === 'suave' ? smootherstep(f) : f;
  world.style.transform = worldTransform(poseAt(i, t, settings.path), PERSPECTIVE);
  root.dataset.stage = String(Math.round(s));
}

// "nativa" follows the scroll exactly, so the browser's own snapping sets the rhythm.
// "suave" eases each move and lets the camera trail the scroll a little, which smooths the
// steps a mouse wheel makes.
const LAG = 0.14;
let shown = target();
let frame = 0;
let last = 0;

function tick(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
  last = now;
  const goal = target();
  if (settings.curve === 'suave' && !reduce.matches) {
    shown += (goal - shown) * (1 - Math.exp(-dt / LAG));
    if (Math.abs(goal - shown) < 0.0005) shown = goal;
  } else {
    shown = goal;
  }
  render(shown);
  meter.sample(now);
  frame = shown === goal ? 0 : requestAnimationFrame(tick);
  if (!frame) last = 0;
}

function wake() {
  if (!frame) frame = requestAnimationFrame(tick);
}

addEventListener('scroll', wake, { passive: true });
addEventListener('resize', wake);
reduce.addEventListener('change', wake);

// The wheel, one stage per gesture. Browsers snap a wheel's scroll to the nearest point, so a
// single notch (a fraction of a screen) falls back where it started, and one large delta can
// cross several stages. "etapas" reads gestures instead: a gesture starts after a pause, on a
// change of direction, or when the deltas jump up again after a trackpad's momentum has
// faded; each one moves one stage, and repeating it chains at most one stage ahead of the
// camera. The scroll itself stays native: the browser animates it and snaps it.
const GAP = 160;
let wheelTo: number | null = null;
let lastWheel = 0;
let lastDelta = 0;

addEventListener(
  'wheel',
  (e) => {
    if (settings.wheel !== 'etapas' || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    const now = performance.now();
    const dir = Math.sign(e.deltaY);
    const size = Math.abs(e.deltaY);
    const fresh =
      now - lastWheel > GAP ||
      dir !== Math.sign(lastDelta) ||
      (size > Math.abs(lastDelta) * 1.8 && Math.abs(lastDelta) < 40);
    lastWheel = now;
    lastDelta = e.deltaY;
    if (!fresh || !dir) return;
    const from = wheelTo ?? Math.round(target());
    const next = Math.min(STAGES.length - 1, Math.max(0, from + dir));
    if (next === from || Math.abs(next - target()) > 1.5) return;
    wheelTo = next;
    stops[next].scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  },
  { passive: false },
);
addEventListener('scrollend', () => {
  wheelTo = null;
});

// A keyboard or screen reader moving focus into another face brings the camera to it.
document.querySelectorAll<HTMLElement>('.face').forEach((face, i) => {
  face.addEventListener('focusin', () => {
    if (root.dataset.stage === String(i)) return;
    stops[i].scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  });
});

// The lab panel: switch curve and path live, to compare them on the same composition.
const lab = document.querySelector<HTMLElement>('.lab');
function syncLab() {
  lab?.querySelectorAll<HTMLButtonElement>('button[data-key]').forEach((b) => {
    b.setAttribute('aria-pressed', String(settings[b.dataset.key as keyof typeof settings] === b.value));
  });
  const url = new URL(location.href);
  url.searchParams.set('curva', settings.curve);
  url.searchParams.set('ruta', settings.path);
  url.searchParams.set('rueda', settings.wheel);
  history.replaceState(null, '', url);
}
lab?.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-key]');
  if (!b) return;
  (settings as Record<string, string>)[b.dataset.key!] = b.value;
  syncLab();
  wake();
});
syncLab();

// Frame meter, only while the camera moves: average rate and the slowest frame of the last move.
const out = document.querySelector<HTMLOutputElement>('.lab output');
const meter = {
  times: [] as number[],
  idle: 0,
  sample(now: number) {
    this.times.push(now);
    clearTimeout(this.idle);
    this.idle = window.setTimeout(() => this.report(), 200);
  },
  report() {
    const t = this.times;
    this.times = [];
    if (t.length < 5 || !out) return;
    let worst = 0;
    for (let k = 1; k < t.length; k++) worst = Math.max(worst, t[k] - t[k - 1]);
    const fps = ((t.length - 1) * 1000) / (t[t.length - 1] - t[0]);
    out.textContent = `${fps.toFixed(0)} fps · peor ${worst.toFixed(1)} ms`;
  },
};

render(shown);
