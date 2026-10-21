import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { setLenis } from '../lib/scroll';

/**
 * Smooth scrolling (Lenis) and the page's motion (GSAP): one intro moment for the hero, a
 * slow parallax on the name, and glass that settles into place as it scrolls in. Under
 * prefers-reduced-motion none of it runs and the page scrolls natively.
 */
export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -96 } });
      setLenis(lenis);
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Intro: the name rises letter by letter out of its own baseline, then the rest follows.
      // Animations run on the glass elements themselves, never on an ancestor: an ancestor with
      // opacity below 1 would cut the glass off from what's behind it.
      const split = SplitText.create('.hero h1', { type: 'chars', mask: 'chars' });
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from(split.chars, { yPercent: 110, duration: 1.1, stagger: 0.07 })
        .from('.intro', { y: 24, opacity: 0, duration: 0.9, clearProps: 'all' }, '-=0.7')
        .from(
          '.actions .button',
          { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, clearProps: 'all' },
          '-=0.6',
        )
        .from('.navbar', { x: -28, opacity: 0, duration: 0.9, clearProps: 'all' }, 0.25);

      // The name drifts up slower than the page as you leave the hero.
      gsap.to('.hero h1', {
        yPercent: -22,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // Glass settles in as it enters: up and into focus, a little apart from its neighbors.
      const reveal = gsap.utils.toArray<HTMLElement>('main h2, main .panel, .contact .button');
      gsap.set(reveal, { y: 36, opacity: 0 });
      ScrollTrigger.batch(reveal, {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.09,
            clearProps: 'transform,opacity',
          }),
      });

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
        split.revert();
      };
    });
    return () => mm.revert();
  }, []);

  return null;
}
