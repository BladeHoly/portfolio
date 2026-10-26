// The camera moves; the content stays put. The world is one CSS 3D scene, and the camera is the
// inverse transform applied to it: everything inside keeps its own place, and only the world's
// transform changes from frame to frame.

/** Where the camera looks from. Angles in degrees, lengths in CSS pixels. */
export interface Pose {
  /** The point at the center of the screen. */
  fx: number;
  fy: number;
  fz: number;
  /** Turn around the vertical axis: 0 looks at the face whose normal is +z. */
  yaw: number;
  /** Tilt: positive looks down. */
  pitch: number;
  /** Distance from the camera to the focus point. */
  dist: number;
}

/**
 * The world's transform for a pose. A plane facing the camera at the focus point, with `dist`
 * equal to the viewport's perspective, renders at 1:1, so text at rest is as sharp as flat text.
 */
export function worldTransform(p: Pose, perspective: number): string {
  return (
    `translateZ(${round(perspective - p.dist)}px) rotateX(${round(p.pitch)}deg) ` +
    `rotateY(${round(-p.yaw)}deg) translate3d(${round(-p.fx)}px, ${round(-p.fy)}px, ${round(-p.fz)}px)`
  );
}

/** Three decimals: enough for sub-pixel motion, and an exact transform once the camera rests. */
const round = (n: number) => Math.round(n * 1000) / 1000;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Starts and ends at rest, with a long even middle. */
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
