import { easeInOutCubic, lerp, type Pose } from './camera';

// The prototype's space: three outer faces of the cube, side by side around a vertical axis.
// Each stage is a resting pose in front of one face; the paths say how the camera travels
// between two neighbouring stages.

/** The cube's side, in CSS pixels. Wider than most screens, so a face's neighbours stay out of frame at rest. */
export const SIDE = 1600;
/** The viewport's perspective. Equal to the resting distance, so faces at rest render 1:1. */
export const PERSPECTIVE = 1400;

const R = SIDE / 2;
const rad = (deg: number) => (deg * Math.PI) / 180;

export interface Face {
  /** Placeholder label; the real content is decided later, with Renzo. */
  label: string;
  yaw: number;
}

export const FACES: Face[] = [
  { label: 'Cara exterior 1', yaw: 0 },
  { label: 'Cara exterior 2', yaw: 90 },
  { label: 'Cara exterior 3', yaw: 180 },
];

/** Places a face on the cube: turned to its yaw, then pushed out to the surface. */
export const faceTransform = (face: Face) => `rotateY(${face.yaw}deg) translateZ(${R}px)`;

/** The point on the cube's side wall at a given yaw, at height `y`. */
const onWall = (yaw: number, y = 0) => ({ fx: R * Math.sin(rad(yaw)), fy: y, fz: R * Math.cos(rad(yaw)) });

export const STAGES: Pose[] = FACES.map((f) => ({ ...onWall(f.yaw), yaw: f.yaw, pitch: 0, dist: PERSPECTIVE }));

export type Path = 'orbita' | 'deslizar';

/** The camera between stage `i` and `i + 1`, at `t` from 0 to 1. */
export function poseAt(i: number, t: number, path: Path): Pose {
  const a = STAGES[i];
  const b = STAGES[i + 1];
  if (!b || t <= 0) return a;
  if (t >= 1) return b;
  // 0 at both ends, 1 halfway: how far the move bends away from the straight line.
  const arc = Math.sin(Math.PI * t);

  if (path === 'orbita') {
    // Around the cube at a steady height, stepping back a little to show the corner.
    const yaw = lerp(a.yaw, b.yaw, t);
    return { ...onWall(yaw), yaw, pitch: 0, dist: PERSPECTIVE + 0.3 * SIDE * arc };
  }

  // Glide: the camera rises and pulls back on a curve, cutting across the corner, and the turn
  // follows the move instead of leading it.
  return {
    fx: lerp(a.fx, b.fx, t),
    fy: lerp(a.fy, b.fy, t) - 0.1 * SIDE * arc,
    fz: lerp(a.fz, b.fz, t),
    yaw: lerp(a.yaw, b.yaw, easeInOutCubic(t)),
    pitch: 9 * arc,
    dist: PERSPECTIVE + 0.75 * SIDE * arc,
  };
}
