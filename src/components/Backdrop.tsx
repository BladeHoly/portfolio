import { useEffect, useRef } from 'react';

// What every glass surface on the page refracts. It stays still on purpose: the motion comes
// from scrolling, as the glass slides over it. An animated backdrop would make every surface
// recompute its filter on every frame, even with nobody touching the page.

const MIST = '#DCE5E1';
const SAGE = '#5E7F7A';

// Fragments of the things Renzo works with: bytes from a game archive, IMAP commands from
// the mail migrator, the optics behind glass-midas.
const FRAGMENTS = [
  'qpck 51 50 43 4B 01 00 00 00 20 00 00 00',
  'A001 SELECT INBOX',
  'A002 FETCH 1:* (UID FLAGS INTERNALDATE)',
  'fn unpack(container: &Qpck) -> Result<Vec<Entry>>',
  'pres 70 72 65 73 00 00 00 10 blz4',
  'messages.insert { labelIds: [INBOX] }',
  'backdrop-filter: blur(1px) url(#glass)',
  'h(s) = (1 - (1 - s)^4)^(1/4)',
  'θ₂ = asin(sin θ₁ / 1.5)',
  'checkpoint.commit() // fsync + rename',
  'GET /api/ofertas?region=uy',
  'feDisplacementMap scale=40',
];

// Soft fields of bottle green and cobalt glass, placed in fractions of the viewport.
const LIGHTS = [
  { x: 0.12, y: 0.18, r: 0.55, color: 'rgba(47, 85, 201, 0.30)' },
  { x: 0.88, y: 0.3, r: 0.6, color: 'rgba(18, 48, 47, 0.28)' },
  { x: 0.55, y: 0.95, r: 0.7, color: 'rgba(94, 127, 122, 0.35)' },
  { x: 0.95, y: 0.92, r: 0.45, color: 'rgba(47, 85, 201, 0.22)' },
];

function paint(canvas: HTMLCanvasElement) {
  const width = innerWidth;
  const height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = MIST;
  ctx.fillRect(0, 0, width, height);

  const span = Math.max(width, height);
  for (const l of LIGHTS) {
    const g = ctx.createRadialGradient(l.x * width, l.y * height, 0, l.x * width, l.y * height, l.r * span);
    g.addColorStop(0, l.color);
    g.addColorStop(1, 'rgba(220, 229, 225, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  // Rows of fragments, offset per row so they read as a field rather than a list.
  ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = SAGE;
  ctx.globalAlpha = 0.32;
  for (let row = 0, y = 18; y < height + 22; row++, y += 22) {
    let x = -((row * 137) % 260);
    for (let i = row; x < width; i++) {
      const text = FRAGMENTS[i % FRAGMENTS.length]!;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width + 36;
    }
  }
  ctx.globalAlpha = 1;
}

export default function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paint(canvas.current!));
    };
    document.fonts.load('13px "JetBrains Mono"').then(draw);
    addEventListener('resize', draw);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', draw);
    };
  }, []);
  return <canvas ref={canvas} className="backdrop" aria-hidden="true" />;
}
