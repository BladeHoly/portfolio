import type Lenis from 'lenis';

// One smooth-scroll instance for the whole page, created by <Motion>. It's null when the user
// prefers reduced motion: then everything falls back to the browser's own scrolling.
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Room left above a target, so the fixed navbar doesn't cover it on narrow screens. */
const OFFSET = -96;

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : OFFSET, immediate });
    return;
  }
  const top =
    typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + OFFSET;
  scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
}
