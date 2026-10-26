import { lerp, type Pose } from './camera';

// The outer journey: the cube's six faces, each a stage the camera rests at. The camera
// orbits from one to the next around the cube's center (chosen in phase 1 over a glide), so
// it climbs and dives over the edges too; longer turns step back further, which is how the
// shape of the cube shows itself in passing.

/** The cube's side, in CSS pixels. Wider than most screens, so a face's neighbours stay out of frame at rest. */
export const SIDE = 1600;
/** The viewport's perspective. Equal to the resting distance, so a frontal face renders 1:1. */
export const PERSPECTIVE = 1400;

const R = SIDE / 2;
const rad = (deg: number) => (deg * Math.PI) / 180;

export interface Face {
  /** Placeholder label; the real content is decided later, with Renzo. */
  label: string;
  /** Where the face sits: its outward normal, as a turn and a tilt. */
  yaw: number;
  pitch: number;
  /** The sixth face opens into the inside (phase 4). */
  door?: boolean;
  /** Adaptive framing: how the camera looks at this face, relative to straight on. */
  frame?: { yaw?: number; pitch?: number; dist?: number };
}

export const FACES: Face[] = [
  { label: 'Cara exterior 1', yaw: 0, pitch: 0 },
  { label: 'Cara exterior 2', yaw: 90, pitch: 0 },
  // Framing at an angle (`frame`) read as a mistake on placeholder text; it waits for content
  // that's better seen in perspective.
  { label: 'Cara exterior 3', yaw: 180, pitch: 0 },
  { label: 'Cara exterior 4', yaw: 270, pitch: 0 },
  // Underneath, upright as seen coming down from face 4.
  { label: 'Cara exterior 5', yaw: 270, pitch: -90 },
  // On top, upright as seen coming over the corner between faces 4 and 1.
  { label: 'Puerta', yaw: 360, pitch: 90, door: true },
];

/** Places a face on the cube: turned and tilted to its normal, then pushed out to the surface. */
export const faceTransform = (f: Face) =>
  `rotateY(${f.yaw}deg) rotateX(${f.pitch}deg) translateZ(${R}px)`;

/** The point on the cube's surface (as a sphere) in the direction of a turn and a tilt. */
function onSurface(yaw: number, pitch: number) {
  const c = Math.cos(rad(pitch));
  return { fx: R * c * Math.sin(rad(yaw)), fy: -R * Math.sin(rad(pitch)), fz: R * c * Math.cos(rad(yaw)) };
}

/** The angle between two faces' normals, in degrees. */
function span(a: Face, b: Face) {
  const p = onSurface(a.yaw, a.pitch);
  const q = onSurface(b.yaw, b.pitch);
  const dot = (p.fx * q.fx + p.fy * q.fy + p.fz * q.fz) / (R * R);
  return (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
}

function rest(f: Face): Pose {
  return {
    ...onSurface(f.yaw, f.pitch),
    yaw: f.yaw + (f.frame?.yaw ?? 0),
    pitch: f.pitch + (f.frame?.pitch ?? 0),
    dist: PERSPECTIVE * (f.frame?.dist ?? 1),
  };
}

export const STAGES: Pose[] = FACES.map(rest);

/** The camera between stage `i` and `i + 1`, at `t` from 0 to 1: an orbit around the cube. */
export function poseAt(i: number, t: number): Pose {
  const a = STAGES[i];
  const b = STAGES[i + 1];
  if (!b || t <= 0) return a;
  if (t >= 1) return b;
  const fa = FACES[i];
  const fb = FACES[i + 1];
  // The look-at point travels over the surface; the camera's own angles carry each face's framing.
  const focus = onSurface(lerp(fa.yaw, fb.yaw, t), lerp(fa.pitch, fb.pitch, t));
  // Step back halfway, more for longer turns, so the corner (or the whole cube) comes into view.
  const back = 0.3 * SIDE * Math.sin(Math.PI * t) * (span(fa, fb) / 90);
  return {
    ...focus,
    yaw: lerp(a.yaw, b.yaw, t),
    pitch: lerp(a.pitch, b.pitch, t),
    dist: lerp(a.dist, b.dist, t) + back,
  };
}
