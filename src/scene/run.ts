import '@glass-midas/components/surface';
import '@glass-midas/components/button';
import { easeInOutCubic, worldTransform } from './camera';
import { PERSPECTIVE, STAGES, flightTime, poseAt, poseBetween } from './stages';

// Scroll drives the camera. The page keeps the browser's scroll, with one snap point per stage
// (`scroll-snap-stop: always`): keys, the scrollbar and assistive tech move it natively, and the
// camera reads its position and puts itself on the path between the two stages around it.
// Two inputs get read as gestures instead, because native snapping handles them badly:
// - the wheel: one notch falls back to where it started, one large delta crosses stages;
// - touch: a swipe has to cover half the screen, or be fast, to move a stage.

const root = document.documentElement;
const world = document.querySelector<HTMLElement>('.world')!;
const stops = [...document.querySelectorAll<HTMLElement>('.stop')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const last = STAGES.length - 1;
const clamp = (n: number) => Math.min(last, Math.max(0, n));
const step = () => stops[0].offsetHeight;

/** Extra travel, in stages, from a finger dragging or a released swipe settling. */
let drag = 0;

/** Where the camera should be, in stages: 1.5 is halfway between the second and third. */
const target = () => clamp(scrollY / step() + drag);

/** A direct flight to a far stage, which the scroll catches up with when it lands. */
let flight: { from: number; to: number; start: number; ms: number } | null = null;

function render(s: number) {
  const i = Math.min(Math.floor(s), STAGES.length - 2);
  const f = s - i;
  // Reduced motion: no travel at all; the camera cuts to the nearest stage.
  world.style.transform = worldTransform(poseAt(i, reduce.matches ? Math.round(f) : f), PERSPECTIVE);
  setCurrent(Math.round(s));
}

let frame = 0;
function tick(now: number) {
  frame = 0;
  meter?.sample(now);
  if (flight) {
    const k = Math.min(1, (now - flight.start) / flight.ms);
    world.style.transform = worldTransform(poseBetween(flight.from, flight.to, easeInOutCubic(k)), PERSPECTIVE);
    if (k < 1) return wake();
    const to = flight.to;
    flight = null;
    scrollTo({ top: to * step(), behavior: 'instant' });
  }
  render(target());
}
function wake() {
  if (!frame) frame = requestAnimationFrame(tick);
}
addEventListener('scroll', wake, { passive: true });
addEventListener('resize', wake);
reduce.addEventListener('change', wake);

/** Moves the scroll to a stage; the browser animates it and the camera follows. */
function go(stage: number) {
  stops[stage].scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
}

/** Any stage, from anywhere: a neighbour by the scroll, a far one by a direct flight. */
function jump(to: number) {
  const from = Math.round(target());
  if (to === from || flight) return;
  if (Math.abs(to - from) === 1 || reduce.matches) return go(to);
  flight = { from, to, start: performance.now(), ms: flightTime(from, to) };
  setCurrent(to);
  wake();
}

// Where you are: the rail's chip for the current face carries `aria-current`, and the address
// names the face (#cara-3), so it can be shared and opens on that face.
const marks = [...document.querySelectorAll<HTMLElement>('.map [data-stage]')];
let current = -1;
function setCurrent(stage: number) {
  if (stage === current || (flight && stage !== flight.to)) return;
  current = stage;
  root.dataset.stage = String(stage);
  for (const m of marks) {
    if (Number(m.dataset.stage) === stage) m.setAttribute('aria-current', 'step');
    else m.removeAttribute('aria-current');
  }
  history.replaceState(null, '', `#${stops[stage].id}`);
}

// Links to a face (#cara-n), in the faces and on the rail, fly there instead of scrolling past
// every face in between.
document.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#cara-"]');
  const i = link ? stops.findIndex((s) => `#${s.id}` === link.hash) : -1;
  if (i < 0) return;
  e.preventDefault();
  jump(i);
});

// The wheel, one stage per gesture. A gesture starts after a pause, on a change of direction,
// or when the deltas jump up again once a trackpad's momentum has faded. Each one moves one
// stage; repeating it chains at most one stage ahead of the camera.
const GAP = 160;
let wheelTo: number | null = null;
let lastWheel = 0;
let lastDelta = 0;

addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (flight) return;
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
    const next = clamp(from + dir);
    if (next === from || Math.abs(next - target()) > 1.5) return;
    wheelTo = next;
    go(next);
  },
  { passive: false },
);
addEventListener('scrollend', () => {
  wheelTo = null;
});

// Touch: the camera follows the finger, and letting go moves a stage after a short drag or a
// quick flick, otherwise it eases back. Only vertical drags are taken; taps, links, text
// selection and the system's sideways back gesture are left alone.
const SHORT = 0.12; // of a screen
const FLICK = 0.35; // px per ms
let touch: {
  x: number;
  y: number;
  vertical: boolean | null;
  from: number;
  base: number;
  trail: [number, number][];
} | null = null;
let settle = 0;

addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length !== 1 || flight) return (touch = null);
    cancelAnimationFrame(settle);
    const t = e.touches[0];
    const from = Math.round(target());
    // Fold any unfinished settle into the scroll, so the drag starts from where the camera is.
    drag = target() - from;
    scrollTo({ top: from * step(), behavior: 'instant' });
    touch = { x: t.clientX, y: t.clientY, vertical: null, from, base: drag, trail: [[e.timeStamp, t.clientY]] };
  },
  { passive: true },
);

addEventListener(
  'touchmove',
  (e) => {
    if (!touch || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    if (touch.vertical === null) {
      if (Math.hypot(dx, dy) < 8) return;
      touch.vertical = Math.abs(dy) > Math.abs(dx);
    }
    if (!touch.vertical) return;
    e.preventDefault();
    touch.trail.push([e.timeStamp, t.clientY]);
    if (touch.trail.length > 6) touch.trail.shift();
    // A full screen of drag is one stage; never more than one either way.
    const d = Math.max(-1, Math.min(1, touch.base - dy / step()));
    drag = clamp(touch.from + d) - touch.from;
    wake();
  },
  { passive: false },
);

addEventListener('touchend', () => {
  if (!touch?.vertical) return (touch = null);
  const { from, trail } = touch;
  touch = null;
  const [t0, y0] = trail[0];
  const [t1, y1] = trail[trail.length - 1];
  const speed = t1 > t0 ? (y0 - y1) / (t1 - t0) : 0; // positive: flicking up, towards the next stage
  const dir = Math.abs(drag) > SHORT ? Math.sign(drag) : Math.abs(speed) > FLICK ? Math.sign(speed) : 0;
  const to = clamp(from + dir);
  ease(drag, to - from, from, to);
});
addEventListener('touchcancel', () => {
  if (touch?.vertical) ease(drag, 0, touch.from, touch.from);
  touch = null;
});

/** Settles the drag on a stage, then hands the result to the scroll, at a snap point. */
function ease(start: number, end: number, from: number, to: number) {
  const ms = reduce.matches ? 0 : 160 + 380 * Math.abs(end - start);
  const t0 = performance.now();
  const run = (now: number) => {
    const k = ms ? Math.min(1, (now - t0) / ms) : 1;
    drag = start + (end - start) * (1 - (1 - k) ** 3);
    if (k < 1) {
      wake();
      settle = requestAnimationFrame(run);
      return;
    }
    drag = 0;
    scrollTo({ top: to * step(), behavior: 'instant' });
    if (to === from) wake();
  };
  settle = requestAnimationFrame(run);
}

// A keyboard or screen reader moving focus into another face brings the camera to it.
document.querySelectorAll<HTMLElement>('.face').forEach((face, i) => {
  face.addEventListener('focusin', () => {
    if (root.dataset.stage !== String(i)) jump(i);
  });
});

// ?debug: frame rate while the camera moves, and the slowest frame of the last move.
const out = new URLSearchParams(location.search).has('debug')
  ? document.querySelector<HTMLOutputElement>('.debug')
  : null;
if (out) out.hidden = false;
const meter = out && {
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
    if (t.length < 5) return;
    let worst = 0;
    for (let k = 1; k < t.length; k++) worst = Math.max(worst, t[k] - t[k - 1]);
    const fps = ((t.length - 1) * 1000) / (t[t.length - 1] - t[0]);
    out.textContent = `${fps.toFixed(0)} fps · peor ${worst.toFixed(1)} ms`;
  },
};

// Opened on a face's address: start there.
const opened = stops.findIndex((s) => `#${s.id}` === location.hash);
if (opened > 0) scrollTo({ top: opened * step(), behavior: 'instant' });

render(target());
