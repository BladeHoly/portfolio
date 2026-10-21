import { createWebGLGlass, type WebGLGlassHandle } from '@glass-midas/webgl';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

const INK = '#12302F';
const MIST = '#DCE5E1';
const SAGE = '#5E7F7A';

// The texture behind the name is made of the things Renzo works with: bytes from a game
// archive, IMAP commands from the mail migrator, and the code that ties them together.
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

function paint(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = MIST;
  ctx.fillRect(0, 0, width, height);

  // Fine texture: rows of fragments, offset per row so they read as a field, not a list.
  ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = SAGE;
  ctx.globalAlpha = 0.3;
  const lineHeight = 22;
  for (let row = 0, y = 18; y < height + lineHeight; row++, y += lineHeight) {
    let x = -((row * 137) % 260);
    for (let i = row; x < width; i++) {
      const text = FRAGMENTS[i % FRAGMENTS.length]!;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width + 36;
    }
  }
  ctx.globalAlpha = 1;

  // Fade the texture out toward the edges so the name and the lens lead.
  const fade = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, width * 0.7);
  fade.addColorStop(0, 'rgba(220, 229, 225, 0)');
  fade.addColorStop(1, 'rgba(220, 229, 225, 0.85)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);

  // The name, as wide as the stage allows.
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  let size = 100;
  ctx.font = `900 ${size}px "Archivo", sans-serif`;
  ctx.fontStretch = 'expanded';
  size = Math.min((size * width * 0.9) / ctx.measureText('Renzo').width, height * 0.62);
  ctx.font = `900 ${size}px "Archivo", sans-serif`;
  const metrics = ctx.measureText('Renzo');
  ctx.fillText('Renzo', (width - metrics.width) / 2, height * 0.5 + metrics.actualBoundingBoxAscent / 2);
}

export default function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const glass = useRef<WebGLGlassHandle | null>(null);
  const [pos, setPos] = useState({ x: 0.58, y: 0.5 }); // lens center, as a fraction of the stage
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const el = stage.current!;
    let cancelled = false;
    const draw = () => {
      const { width, height } = el.getBoundingClientRect();
      paint(canvas.current!, width, height);
    };
    const observer = new ResizeObserver(draw);
    // The canvas needs the fonts loaded before it can draw the name.
    Promise.all([
      document.fonts.load('900 100px Archivo'),
      document.fonts.load('13px "JetBrains Mono"'),
    ]).then(() => {
      if (cancelled) return;
      draw();
      observer.observe(el);
      glass.current = createWebGLGlass(lens.current!, {
        // live: the canvas is repainted on resize. Switch to live: false + update({}) once
        // glass-midas#8 (update() re-reads still backdrops) is in.
        backdrop: {
          source: canvas.current!,
          rect: () => canvas.current!.getBoundingClientRect(),
          live: true,
        },
        radius: 999,
        thickness: 150,
        bezel: 70,
        curvature: 2,
        magnify: 0.12,
        blur: 0,
        specular: 0.45,
        specularSaturation: 3,
        chroma: 0.012,
        tint: [0.18, 0.33, 0.79, 0.06],
      });
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      glass.current?.destroy();
    };
  }, []);

  const moveTo = (clientX: number, clientY: number) => {
    const r = stage.current!.getBoundingClientRect();
    setPos({
      x: Math.min(Math.max((clientX - r.left) / r.width, 0), 1),
      y: Math.min(Math.max((clientY - r.top) / r.height, 0), 1),
    });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2) };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) moveTo(e.clientX - drag.current.dx, e.clientY - drag.current.dy);
  };
  // Arrow keys move the lens too, so it isn't a mouse-only toy.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setPos((p) => ({ x: Math.min(Math.max(p.x + m[0], 0), 1), y: Math.min(Math.max(p.y + m[1], 0), 1) }));
  };

  return (
    <div className="hero-stage" ref={stage}>
      <canvas ref={canvas} className="hero-canvas" aria-hidden="true" />
      <div
        ref={lens}
        className="hero-lens"
        role="slider"
        tabIndex={0}
        aria-label="Lente de vidrio: arrastrala o movela con las flechas"
        aria-valuetext={`${Math.round(pos.x * 100)}% horizontal, ${Math.round(pos.y * 100)}% vertical`}
        style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
