import { lerp, smootherstep, type Pose } from './camera';

// The journey: the cube's six outer faces, top first and the door underneath last, then its
// five inner faces, the four walls and the ceiling. Each face is a stage the camera rests at.
// Between neighbours the camera orbits around the cube's center, outside or in; between the
// door and the first inner wall it goes through the door.

/** The cube's side, in CSS pixels. Wider than most screens, so a face's neighbours stay out of frame at rest. */
export const SIDE = 1600;
/** The viewport's perspective. Equal to the resting distance, so a frontal face renders 1:1. */
export const PERSPECTIVE = 1400;

const R = SIDE / 2;
const rad = (deg: number) => (deg * Math.PI) / 180;

export interface Face {
  /** Placeholder label; the real content is decided later, with Renzo. */
  label: string;
  /** Its address: #cara-1 … #interior-5. */
  id: string;
  /**
   * How the camera looks at the face, as a turn and a tilt (positive looks down). Outside,
   * that's also where the face sits; inside, the face is on the opposite side of the cube.
   */
  yaw: number;
  pitch: number;
  /** An inner face: on a wall's inside, facing the center. */
  inside?: boolean;
  /** The bottom face opens into the inside. */
  door?: boolean;
  /** Adaptive framing: how the camera looks at this face, relative to straight on. */
  frame?: { yaw?: number; pitch?: number; dist?: number };
}

export const FACES: Face[] = [
  // Outside, one way: on top, down over an edge, around the four sides, underneath to the door.
  // Framing at an angle (`frame`) read as a mistake on placeholder text; it waits for content
  // that's better seen in perspective.
  { label: 'Cara exterior 1', id: 'cara-1', yaw: 0, pitch: 90 },
  { label: 'Cara exterior 2', id: 'cara-2', yaw: 0, pitch: 0 },
  { label: 'Cara exterior 3', id: 'cara-3', yaw: 90, pitch: 0 },
  { label: 'Cara exterior 4', id: 'cara-4', yaw: 180, pitch: 0 },
  { label: 'Cara exterior 5', id: 'cara-5', yaw: 270, pitch: 0 },
  { label: 'Puerta', id: 'cara-6', yaw: 270, pitch: -90, door: true },
  // Inside: up through the door, around the four walls, then the ceiling.
  { label: 'Cara interior 1', id: 'interior-1', yaw: 270, pitch: 0, inside: true },
  { label: 'Cara interior 2', id: 'interior-2', yaw: 360, pitch: 0, inside: true },
  { label: 'Cara interior 3', id: 'interior-3', yaw: 450, pitch: 0, inside: true },
  { label: 'Cara interior 4', id: 'interior-4', yaw: 540, pitch: 0, inside: true },
  // The ceiling reads upright from the door: it's the first thing seen on the way in.
  { label: 'Cara interior 5', id: 'interior-5', yaw: 630, pitch: -90, inside: true },
];

/** The door's stage; the first inner face is the next one. */
export const DOOR = FACES.findIndex((f) => f.door);

/** Places a face: turned and tilted to the camera's view of it, then pushed to its wall. */
export const faceTransform = (f: Face) =>
  `rotateY(${f.yaw}deg) rotateX(${f.pitch}deg) translateZ(${f.inside ? -R + 2 : R}px)`;

/** The unit direction for a turn and a tilt. */
function dir(yaw: number, pitch: number) {
  const c = Math.cos(rad(pitch));
  return { x: c * Math.sin(rad(yaw)), y: -Math.sin(rad(pitch)), z: c * Math.cos(rad(yaw)) };
}

/** The point the camera looks at for a turn and a tilt: on the outer surface, or the opposite inner wall. */
function focusFor(yaw: number, pitch: number, inside = false) {
  const d = dir(yaw, pitch);
  const r = inside ? -R : R;
  return { fx: r * d.x, fy: r * d.y, fz: r * d.z };
}

/** The angle between two faces' views, in degrees. */
function span(a: Face, b: Face) {
  const p = dir(a.yaw, a.pitch);
  const q = dir(b.yaw, b.pitch);
  const dot = p.x * q.x + p.y * q.y + p.z * q.z;
  return (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
}

function rest(f: Face): Pose {
  return {
    ...focusFor(f.yaw, f.pitch, f.inside),
    yaw: f.yaw + (f.frame?.yaw ?? 0),
    pitch: f.pitch + (f.frame?.pitch ?? 0),
    dist: PERSPECTIVE * (f.frame?.dist ?? 1),
  };
}

export const STAGES: Pose[] = FACES.map(rest);

/** The turn from one angle to another, the short way round: -180 to 180. */
const shortest = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

/**
 * The camera between two stages on the same side of the door, at `t` from 0 to 1: an orbit
 * around the cube's center, the short way round. Outside, it steps back halfway, more for
 * longer turns, so the corner (or the whole cube) comes into view; inside it leans in a
 * little instead, since stepping back would put it through the opposite wall.
 */
export function poseBetween(i: number, j: number, t: number): Pose {
  const a = STAGES[i];
  const b = STAGES[j];
  if (i === j || t <= 0) return a;
  if (t >= 1) return b;
  const fa = FACES[i];
  const fb = FACES[j];
  const inside = Boolean(fa.inside);
  const focus = focusFor(fa.yaw + shortest(fa.yaw, fb.yaw) * t, lerp(fa.pitch, fb.pitch, t), inside);
  const bend = Math.sin(Math.PI * t) * (span(fa, fb) / 90);
  return {
    ...focus,
    yaw: a.yaw + shortest(a.yaw, b.yaw) * t,
    pitch: lerp(a.pitch, b.pitch, t),
    dist: lerp(a.dist, b.dist, t) + (inside ? -0.1 : 0.3) * SIDE * bend,
  };
}

/** How far the door leaves have swung, 0 to 1, with the camera at `s` stages. */
export const doorOpen = (s: number) => smootherstep(Math.min(1, Math.max(0, (s - DOOR) / 0.35)));

/**
 * Through the door, at `t` from 0 (under the door) to 1 (facing the first inner wall). The
 * leaves swing open while the camera leans in; then it rises through the opening on a curve,
 * turning from looking up to looking at the wall. Backwards, the same path takes it out and
 * the leaves close behind it.
 */
function doorPose(t: number): Pose {
  const a = STAGES[DOOR];
  const b = STAGES[DOOR + 1];
  const lean = PERSPECTIVE * 0.85;
  const opening = 0.35;
  if (t <= 0) return a;
  if (t >= 1) return b;
  if (t <= opening) return { ...a, dist: lerp(a.dist, lean, smootherstep(t / opening)) };
  const k = smootherstep((t - opening) / (1 - opening));
  // Where the camera is, rather than what it looks at: under the door, then inside.
  const da = dir(a.yaw, a.pitch);
  const db = dir(b.yaw, b.pitch);
  const c0 = { x: a.fx + da.x * lean, y: a.fy + da.y * lean, z: a.fz + da.z * lean };
  const c1 = { x: b.fx + db.x * b.dist, y: b.fy + db.y * b.dist, z: b.fz + db.z * b.dist };
  // Straight up through the middle of the opening first, then over to the inner wall.
  const via = { x: 0, y: R * 0.2, z: 0 };
  const q = (p0: number, p1: number, p2: number) => (1 - k) ** 2 * p0 + 2 * (1 - k) * k * p1 + k * k * p2;
  const yaw = a.yaw + shortest(a.yaw, b.yaw) * k;
  const pitch = lerp(a.pitch, b.pitch, k);
  const d = dir(yaw, pitch);
  const dist = lerp(lean, b.dist, k);
  return {
    fx: q(c0.x, via.x, c1.x) - d.x * dist,
    fy: q(c0.y, via.y, c1.y) - d.y * dist,
    fz: q(c0.z, via.z, c1.z) - d.z * dist,
    yaw,
    pitch,
    dist,
  };
}

/** The camera between stage `i` and the next. */
export const poseAt = (i: number, t: number) => (i === DOOR ? doorPose(t) : poseBetween(i, i + 1, t));

/** One leg of a direct flight: an orbit on one side of the door, or the door itself. */
export interface Leg {
  from: number;
  to: number;
  ms: number;
}

const isDoorLeg = (a: number, b: number) => Math.min(a, b) === DOOR && Math.abs(a - b) === 1;

/**
 * A direct flight between any two stages. On one side of the door it's a single orbit that
 * steps back further the longer the turn; across the door it goes to the door, through it and
 * on, so leaving or entering always reads as passing the door, never through a wall.
 */
export function route(from: number, to: number): Leg[] {
  const inside = (i: number) => i > DOOR;
  const stops =
    inside(from) === inside(to)
      ? [from, to]
      : inside(to)
        ? [from, DOOR, DOOR + 1, to]
        : [from, DOOR + 1, DOOR, to];
  const legs: Leg[] = [];
  for (let k = 1; k < stops.length; k++) {
    const [a, b] = [stops[k - 1], stops[k]];
    if (a === b) continue;
    legs.push({ from: a, to: b, ms: isDoorLeg(a, b) ? 1100 : 520 + 340 * (span(FACES[a], FACES[b]) / 90) });
  }
  return legs;
}

/** Where a leg puts the camera at `t`, and how open the door is. */
export function legPose(leg: Leg, t: number): { pose: Pose; open: number } {
  if (isDoorLeg(leg.from, leg.to)) {
    const s = leg.from + (leg.to - leg.from) * t;
    return { pose: doorPose(s - DOOR), open: doorOpen(s) };
  }
  return { pose: poseBetween(leg.from, leg.to, t), open: leg.from > DOOR ? 1 : 0 };
}
