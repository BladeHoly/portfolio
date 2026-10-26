import { lerp, smootherstep, type Pose } from './camera';

// The journey: the cube's six outer faces, top first and the door underneath last, then its
// five inner faces, the four walls and the ceiling. Each face is a stage the camera rests at.
// Between neighbours the camera orbits around the cube's center, outside or in; between the
// door and the first inner wall it falls through the door, a black hole.

/** The cube's side, in CSS pixels. Wider than most screens, so a face's neighbours stay out of frame at rest. */
export const SIDE = 1600;
/** The viewport's perspective. Equal to the resting distance, so a frontal face renders 1:1. */
export const PERSPECTIVE = 1400;

const R = SIDE / 2;
const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
  /** The bottom face: a black hole into the inside. */
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

/**
 * Through the door, a black hole in the bottom face, at `t` from 0 (under it) to 1 (facing the
 * first inner wall). The camera is pulled into the hole faster and faster, spinning, until it
 * fills the screen and all goes dark; out of the dark it slows down in front of the wall, still
 * turning the same way until it settles. Backwards, the same path takes it out. `dark` is how
 * much of the screen the dark covers, 0 to 1.
 */
function doorPose(t: number): { pose: Pose; dark: number } {
  const a = STAGES[DOOR];
  const b = STAGES[DOOR + 1];
  if (t <= 0) return { pose: a, dark: 0 };
  if (t >= 1) return { pose: b, dark: 0 };
  const fall = 0.55;
  const spin = 40;
  if (t < fall) {
    const u = t / fall;
    return {
      pose: { ...a, dist: a.dist * (1 - 0.94 * u ** 2.6), roll: spin * u ** 2 },
      dark: smootherstep(clamp01((u - 0.55) / 0.45)),
    };
  }
  const u = (t - fall) / (1 - fall);
  const out = 1 - (1 - u) ** 3;
  return {
    pose: { ...b, dist: lerp(PERSPECTIVE * 0.2, b.dist, out), roll: -spin * (1 - out) },
    dark: 1 - smootherstep(clamp01(u / 0.55)),
  };
}

/** How dark the screen is with the camera at `s` stages: only ever inside the door. */
export const darkAt = (s: number) => (s > DOOR && s < DOOR + 1 ? doorPose(s - DOOR).dark : 0);

/** Crossing the door takes its own time, whatever the input, so it never rushes. */
export const DOOR_MS = 2000;

/** The camera between stage `i` and the next. */
export const poseAt = (i: number, t: number) => (i === DOOR ? doorPose(t).pose : poseBetween(i, i + 1, t));

/** One leg of a direct flight: an orbit on one side of the door, or the door itself. */
export interface Leg {
  from: number;
  to: number;
  ms: number;
}

export const isDoorLeg = (a: number, b: number) => Math.min(a, b) === DOOR && Math.abs(a - b) === 1;

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
    legs.push({ from: a, to: b, ms: isDoorLeg(a, b) ? DOOR_MS : 520 + 340 * (span(FACES[a], FACES[b]) / 90) });
  }
  return legs;
}

/** Where a leg puts the camera at `t`, and how dark the screen is. */
export function legPose(leg: Leg, t: number): { pose: Pose; dark: number } {
  if (isDoorLeg(leg.from, leg.to)) return doorPose(leg.to > leg.from ? t : 1 - t);
  return { pose: poseBetween(leg.from, leg.to, t), dark: 0 };
}
