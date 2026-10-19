// Draws a consistent Laud-style cover from a work's own details, entirely in the browser.
// No AI service, no cost: the same inputs always give the same image.

export type CoverStyle = 'stat' | 'headline' | 'bars' | 'curve';

export interface CoverInput {
  title: string;
  brand: string;
  category: string;
  value: string;   // headline result, e.g. "+64%"
  metric: string;  // e.g. "Online revenue"
  style: CoverStyle;
  color: string;   // background
}

export const COVER_STYLES: { id: CoverStyle; label: string }[] = [
  { id: 'stat', label: 'Big number' },
  { id: 'headline', label: 'Headline' },
  { id: 'bars', label: 'Bars' },
  { id: 'curve', label: 'Growth line' },
];

export const COVER_COLORS = ['#111111', '#FF4F00', '#1F7A4D', '#2B4C7E', '#F4F4F1', '#7A3E2B', '#5B3FA0', '#2E7FA8'];

export const W = 1600;
export const H = 1200;
const PAD = 80;
const SANS = '"Schibsted Grotesk", "Inter", system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, monospace';

function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 < 0.55;
}

function lines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !cur) cur = next;
    else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  if (out.length > maxLines) {
    const kept = out.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return out;
}

/** Largest font size (down to min) at which the text fits in maxLines. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, start: number, min: number, maxWidth: number, maxLines: number) {
  let size = start;
  for (; size > min; size -= 4) {
    ctx.font = `${weight} ${size}px ${SANS}`;
    const words = text.split(/\s+/);
    if (words.every((w) => ctx.measureText(w).width <= maxWidth) && lines(ctx, text, maxWidth, 99).length <= maxLines) break;
  }
  ctx.font = `${weight} ${size}px ${SANS}`;
  return size;
}

function spaced(ctx: CanvasRenderingContext2D, size: number) {
  // Tight tracking for display type, as on the site.
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = `${-size * 0.04}px`; } catch { /* older browsers */ }
}

export async function loadCoverFonts() {
  if (!('fonts' in document)) return;
  await Promise.all([
    document.fonts.load(`800 120px "Schibsted Grotesk"`),
    document.fonts.load(`600 60px "Schibsted Grotesk"`),
    document.fonts.load(`400 22px "DM Mono"`),
  ]).catch(() => undefined);
}

export function drawCover(canvas: HTMLCanvasElement, input: CoverInput) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const bg = input.color;
  const fg = isDark(bg) ? '#F4F4F1' : '#111111';
  const accent = bg.toUpperCase() === '#FF4F00' ? '#111111' : '#FF4F00';
  const title = input.title.trim() || 'Untitled work';
  const value = input.value.trim();
  const metric = input.metric.trim();
  const style: CoverStyle = !value && input.style !== 'headline' ? 'headline' : input.style;

  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // Category (top) and brand (bottom) in mono caps
  ctx.fillStyle = fg; ctx.globalAlpha = 0.72;
  ctx.font = `400 24px ${MONO}`;
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = '1px'; } catch { /* noop */ }
  ctx.fillText((input.category || 'Laud').toUpperCase(), PAD, PAD + 22);
  ctx.fillText((input.brand || '').toUpperCase().slice(0, 48), PAD, H - PAD);
  ctx.textAlign = 'right'; ctx.fillText('LAUD.PRO', W - PAD, H - PAD); ctx.textAlign = 'left';
  ctx.globalAlpha = 1;

  if (style === 'stat') {
    const size = fit(ctx, value, 800, 420, 160, W - PAD * 2, 1);
    spaced(ctx, size); ctx.fillStyle = fg;
    const top = 200 + size * 0.78;
    ctx.fillText(value, PAD - 8, top);
    ctx.font = `600 64px ${SANS}`; spaced(ctx, 64);
    lines(ctx, metric, W - PAD * 2, 2).forEach((l, i) => ctx.fillText(l, PAD, top + 110 + i * 70));
    ctx.fillStyle = accent; ctx.fillRect(PAD, top + 30, 120, 10);
  }

  if (style === 'headline') {
    const size = fit(ctx, title, 800, 150, 72, W - PAD * 2, 4);
    spaced(ctx, size); ctx.fillStyle = fg;
    lines(ctx, title, W - PAD * 2, 4).forEach((l, i) => ctx.fillText(l, PAD, 220 + size + i * size * 0.98));
    if (value) {
      ctx.font = `800 150px ${SANS}`; spaced(ctx, 150); ctx.fillStyle = accent;
      ctx.fillText(value, PAD, H - 200);
      const vw = ctx.measureText(value).width;
      ctx.font = `600 44px ${SANS}`; spaced(ctx, 44); ctx.fillStyle = fg;
      ctx.fillText(lines(ctx, metric, W - PAD * 2 - vw - 40, 1)[0] ?? '', PAD + vw + 32, H - 210);
    }
  }

  if (style === 'bars') {
    const size = fit(ctx, value, 800, 200, 100, 760, 1);
    spaced(ctx, size); ctx.fillStyle = fg;
    ctx.fillText(value, PAD, 200 + size * 0.8);
    ctx.font = `600 56px ${SANS}`; spaced(ctx, 56); ctx.globalAlpha = 0.7;
    lines(ctx, metric, 700, 3).forEach((l, i) => ctx.fillText(l, PAD, 200 + size * 0.8 + 90 + i * 62));
    ctx.globalAlpha = 1;
    const hs = [220, 300, 260, 340, 410, 520, 640];
    hs.forEach((h, i) => {
      const x = W - PAD - (hs.length - i) * 112 + 26;
      ctx.fillStyle = i === hs.length - 1 ? accent : fg;
      ctx.globalAlpha = i === hs.length - 1 ? 1 : 0.2;
      ctx.beginPath(); ctx.roundRect(x, H - 170 - h, 86, h, [12, 12, 0, 0]); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  if (style === 'curve') {
    ctx.strokeStyle = fg; ctx.globalAlpha = 0.22; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(PAD, 1000); ctx.bezierCurveTo(500, 990, 900, 960, W - PAD, 900); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = accent; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(PAD, 980); ctx.bezierCurveTo(500, 950, 800, 820, 1000, 680); ctx.bezierCurveTo(1200, 540, 1350, 400, W - PAD, 360); ctx.stroke();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(W - PAD, 360, 22, 0, Math.PI * 2); ctx.fill();
    const size = fit(ctx, value, 800, 170, 100, 900, 1);
    spaced(ctx, size); ctx.fillStyle = fg;
    ctx.fillText(value, PAD, 180 + size * 0.8);
    ctx.font = `600 54px ${SANS}`; spaced(ctx, 54);
    lines(ctx, metric, 820, 2).forEach((l, i) => ctx.fillText(l, PAD, 180 + size * 0.8 + 80 + i * 60));
  }
}

export function coverToFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Could not create the cover image.')); return; }
      const type = blob.type || 'image/png';
      resolve(new File([blob], `cover.${type === 'image/webp' ? 'webp' : 'png'}`, { type }));
    }, 'image/webp', 0.9);
  });
}
