import { lerp, smootherstep, warp, type Pose } from './camera';

// The journey: the cube's six outer faces, top first and the door underneath last, then its
// five inner faces, the ceiling right above the door first and then the four walls. Each face is a stage the camera rests at.
// Between neighbours the camera orbits around the cube's center, outside or in; between the
// door and the first inner wall the door opens and the camera goes through it at warp.

/** The cube's side, in CSS pixels. Wider than big screens (2560 px), so a face at rest always fills the frame. */
export const SIDE = 2400;
/** The viewport's perspective. Equal to the resting distance, so a frontal face renders 1:1. */
export const PERSPECTIVE = 1400;

const R = SIDE / 2;
const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export interface Face {
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
  /** The bottom face is a door into the inside. */
  door?: boolean;
  /** Adaptive framing: how the camera looks at this face, relative to straight on. */
  frame?: { yaw?: number; pitch?: number; dist?: number };
}

export const FACES: Face[] = [
  // Outside, one way: on top, down over an edge, around the four sides, underneath to the door.
  // Framing at an angle (`frame`) read as a mistake on placeholder text; it waits for content
  // that's better seen in perspective.
  { id: 'cara-1', yaw: 0, pitch: 90 },
  { id: 'cara-2', yaw: 0, pitch: 0 },
  { id: 'cara-3', yaw: 90, pitch: 0 },
  { id: 'cara-4', yaw: 180, pitch: 0 },
  { id: 'cara-5', yaw: 270, pitch: 0 },
  { id: 'cara-6', yaw: 270, pitch: -90, door: true },
  // Inside: straight up from the door to the ceiling right in front of it, then down to the
  // walls and around them. The ceiling reads upright as seen from the door.
  { id: 'interior-1', yaw: 270, pitch: -90, inside: true },
  { id: 'interior-2', yaw: 270, pitch: 0, inside: true },
  { id: 'interior-3', yaw: 360, pitch: 0, inside: true },
  { id: 'interior-4', yaw: 450, pitch: 0, inside: true },
  { id: 'interior-5', yaw: 540, pitch: 0, inside: true },
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
 * Through the door, at `t` from 0 (under it) to 1 (facing the ceiling, right above it). First its
 * two leaves swing open towards the camera, which leans in, and the inside shows through; then
 * the camera climbs straight up through the opening like a rocket, at warp: it shoots off, and
 * near the ceiling brakes hard and settles, as if dropping into orbit. Backwards, the same path
 * takes it out and the leaves close behind it. `open` is how far the leaves have swung, 0 to 1.
 */
function doorPose(t: number): { pose: Pose; open: number } {
  const a = STAGES[DOOR];
  const b = STAGES[DOOR + 1];
  if (t <= 0) return { pose: a, open: 0 };
  if (t >= 1) return { pose: b, open: 1 };
  const lean = PERSPECTIVE * 0.85;
  if (t <= OPENING) {
    const k = smootherstep(t / OPENING);
    return { pose: { ...a, dist: lerp(a.dist, lean, k) }, open: k };
  }
  // The camera keeps looking up and travels along that line: from under the door to its resting
  // place below the ceiling. Only how far it is from what it looks at changes.
  const k = warp((t - OPENING) / (1 - OPENING));
  const d = dir(a.yaw, a.pitch);
  const from = { x: a.fx + d.x * lean, y: a.fy + d.y * lean, z: a.fz + d.z * lean };
  const to = { x: b.fx + d.x * b.dist, y: b.fy + d.y * b.dist, z: b.fz + d.z * b.dist };
  const cam = { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), z: lerp(from.z, to.z, k) };
  return {
    pose: { fx: cam.x - d.x * b.dist, fy: cam.y - d.y * b.dist, fz: cam.z - d.z * b.dist, yaw: a.yaw, pitch: a.pitch, dist: b.dist },
    open: 1,
  };
}

/** The part of the crossing the leaves take to open, before the camera goes through. */
const OPENING = 0.3;

/** How far the door's leaves have swung with the camera at `s` stages. */
export const openAt = (s: number) => (s <= DOOR ? 0 : s >= DOOR + 1 ? 1 : doorPose(s - DOOR).open);

/** Crossing the door takes its own time, whatever the input, so it never rushes. */
export const DOOR_MS = 2400;

/** The camera between stage `i` and the next. */
export const poseAt = (i: number, t: number) => (i === DOOR ? doorPose(t).pose : poseBetween(i, i + 1, t));

const OUTER = FACES.flatMap((f, k) => (f.inside ? [] : [k]));
const INNER = FACES.flatMap((f, k) => (f.inside ? [k] : []));

/** The faces in view at `t` through the door: with the door while it opens, without it after. */
const throughDoor = (t: number) => (t < OPENING ? [DOOR, ...INNER] : INNER);

/**
 * The faces the camera can see with the camera at `s` stages. GPUs don't all sort the planes of
 * a 3D scene the same way, and faces that should have been out of sight got drawn over the ones
 * in view, so only these are painted. Outside, at rest only the face in front, and between two
 * faces those two: an orbit turns the rest away. Through the door, the door and the whole
 * inside, which shows through it, until the leaves are open: then they're out of frame, and the
 * camera is about to pass through the door's plane, which, painted, blew up past what the GPU
 * holds and cost the door its tiles. Inside, every wall faces the camera, so all of them.
 */
export function seenAt(s: number): number[] {
  const i = Math.min(Math.floor(s), STAGES.length - 2);
  const f = s - i;
  if (i === DOOR && f > 0 && f < 1) return throughDoor(f);
  if (s > DOOR) return INNER;
  return f === 0 ? [i] : f === 1 ? [i + 1] : [i, i + 1];
}

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

/** Where a leg puts the camera at `t`, how open the door is, and which faces it can see. */
export function legPose(leg: Leg, t: number): { pose: Pose; open: number; seen: number[] } {
  if (isDoorLeg(leg.from, leg.to)) {
    const k = leg.to > leg.from ? t : 1 - t;
    return { ...doorPose(k), seen: throughDoor(k) };
  }
  // Long flights outside step far back, where the whole cube shows.
  const inside = leg.from > DOOR;
  return { pose: poseBetween(leg.from, leg.to, t), open: inside ? 1 : 0, seen: inside ? INNER : OUTER };
}
