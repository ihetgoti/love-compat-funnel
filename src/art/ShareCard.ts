/**
 * Runtime share-card generator. Draws a vertical (story-sized) PNG entirely on a
 * Canvas at request time — no image assets, no server. Returns a data URL.
 */

export interface ShareCardOptions {
  youName: string;
  partnerName: string;
  score: number;
  label: string;
  tagline?: string;
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 32, s / 32);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-2, 2, -16, -2, -16, -12);
  ctx.bezierCurveTo(-16, -22, -4, -22, 0, -12);
  ctx.bezierCurveTo(4, -22, 16, -22, 16, -12);
  ctx.bezierCurveTo(16, -2, 2, 2, 0, 10);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(255,93,143,0.7)';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.restore();
}

function drawSparkles(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let i = 0; i < 60; i++) {
    const r = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(i * 78.233) * 12543.123) % 1;
    const x = Math.abs(r) * w;
    const y = Math.abs(r2) * h;
    const size = 1 + (Math.abs(r) * 3);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,210,125,0.8)' : 'rgba(255,244,251,0.7)';
    ctx.fill();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
  return cursorY;
}

export function generateShareCard(opts: ShareCardOptions): string {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#2a1550');
  bg.addColorStop(0.55, '#160d28');
  bg.addColorStop(1, '#0e0820');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H * 0.4, 760);
  glow.addColorStop(0, 'rgba(255,93,143,0.42)');
  glow.addColorStop(1, 'rgba(255,93,143,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawSparkles(ctx, W, H);

  ctx.textAlign = 'center';

  // Eyebrow
  ctx.fillStyle = '#ffd27d';
  ctx.font = '600 46px Georgia, serif';
  ctx.fillText('✦  LOVE COMPATIBILITY  ✦', W / 2, 330);

  // Names
  ctx.fillStyle = '#fff4fb';
  ctx.font = '700 84px Georgia, serif';
  const you = (opts.youName || 'You').slice(0, 14);
  const them = (opts.partnerName || 'Them').slice(0, 14);
  ctx.fillText(you, W / 2, 470);
  drawHeart(ctx, W / 2, 545, 64, '#ff5d8f');
  ctx.fillText(them, W / 2, 690);

  // Score
  const grad = ctx.createLinearGradient(W / 2 - 360, 0, W / 2 + 360, 0);
  grad.addColorStop(0, '#ff5d8f');
  grad.addColorStop(0.5, '#ffd27d');
  grad.addColorStop(1, '#c9a7ff');
  ctx.fillStyle = grad;
  ctx.font = '800 400px Georgia, serif';
  ctx.shadowColor = 'rgba(255,93,143,0.6)';
  ctx.shadowBlur = 50;
  ctx.fillText(`${Math.round(opts.score)}%`, W / 2, 1180);
  ctx.shadowBlur = 0;

  // Label pill
  ctx.fillStyle = '#fff4fb';
  ctx.font = '700 62px Georgia, serif';
  ctx.fillText(opts.label, W / 2, 1320);

  // Tagline
  if (opts.tagline) {
    ctx.fillStyle = 'rgba(255,244,251,0.85)';
    ctx.font = '400 44px system-ui, sans-serif';
    wrapText(ctx, opts.tagline, W / 2, 1440, 820, 60);
  }

  // Footer CTA + brand — every shared card is a little softncute ad
  ctx.fillStyle = '#ffb3c8';
  ctx.font = '600 46px system-ui, sans-serif';
  ctx.fillText('💞 Check your own match', W / 2, 1740);
  ctx.fillStyle = '#ffd27d';
  ctx.font = '700 52px Georgia, serif';
  ctx.fillText('softncute.com', W / 2, 1820);

  return canvas.toDataURL('image/png');
}
