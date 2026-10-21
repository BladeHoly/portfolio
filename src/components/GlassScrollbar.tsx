import { useGlass } from '@glass-midas/react';
import { useEffect, useRef, type PointerEvent } from 'react';
import { scrollToTarget } from '../lib/scroll';

const MIN_THUMB = 56;

/**
 * A glass scroll thumb in place of the native scrollbar, which the stylesheet hides. It only
 * mirrors and drives the page's own scroll, so the keyboard, wheel and touch work as always.
 * It should go almost unnoticed: no rim (a rim marks what deserves attention), faint while the
 * page rests, clear while it scrolls or under the pointer.
 */
export default function GlassScrollbar() {
  const thumb = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);

  useGlass(thumb, {
    radius: 999,
    bezel: 4,
    thickness: 8,
    blur: '2px',
    specular: 0,
    specularSaturation: 1,
  });

  useEffect(() => {
    const el = thumb.current!;
    let frame = 0;
    let rest: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      sync();
      el.classList.add('is-active');
      clearTimeout(rest);
      rest = setTimeout(() => el.classList.remove('is-active'), 900);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const page = document.documentElement.scrollHeight;
        const view = innerHeight;
        const scrollable = page > view + 1;
        el.hidden = !scrollable;
        if (!scrollable) return;
        const height = Math.max(MIN_THUMB, (view / page) * (view - 16));
        const top = 8 + (scrollY / (page - view)) * (view - 16 - height);
        el.style.height = `${height}px`;
        el.style.transform = `translateY(${top}px)`;
      });
    };
    sync();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', sync);
    const observer = new ResizeObserver(sync);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(rest);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', sync);
      observer.disconnect();
    };
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: scrollY };
    e.currentTarget.classList.add('is-dragging');
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const page = document.documentElement.scrollHeight;
    const track = innerHeight - 16 - e.currentTarget.offsetHeight;
    const ratio = (page - innerHeight) / Math.max(track, 1);
    scrollToTarget(d.startScroll + (e.clientY - d.startY) * ratio, true);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    e.currentTarget.classList.remove('is-dragging');
  };

  return (
    <div
      ref={thumb}
      className="scroll-thumb"
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
