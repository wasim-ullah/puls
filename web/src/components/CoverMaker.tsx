import { useEffect, useRef, useState } from 'react';
import { COVER_COLORS, COVER_STYLES, coverToFile, drawCover, loadCoverFonts, type CoverStyle } from '../lib/coverGen';

interface Props {
  title: string;
  brand: string;
  category: string;
  value: string;
  metric: string;
  busy: boolean;
  onUse: (file: File) => void;
  onCancel: () => void;
}

/** Makes a cover from the work's own title and headline result, in the Laud style. */
export default function CoverMaker({ title, brand, category, value, metric, busy, onUse, onCancel }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [style, setStyle] = useState<CoverStyle>(value ? 'stat' : 'headline');
  const [color, setColor] = useState(COVER_COLORS[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => { void loadCoverFonts().then(() => setReady(true)); }, []);
  useEffect(() => {
    if (ready && canvas.current) drawCover(canvas.current, { title, brand, category, value, metric, style, color });
  }, [ready, title, brand, category, value, metric, style, color]);

  return (
    <div className="panel" style={{ gap: 16 }}>
      <div className="cover-preview" style={{ maxWidth: '100%' }}>
        <canvas ref={canvas} style={{ width: '100%', height: '100%', display: 'block' }} aria-label="Generated cover preview" />
      </div>
      {!value && (
        <span className="small muted">Add a headline result under Results (for example "+64%" and "Online revenue") to unlock the number styles.</span>
      )}
      <div className="stack gap-8">
        <span className="small" style={{ fontWeight: 600 }}>Style</span>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {COVER_STYLES.map((s) => (
            <button key={s.id} type="button" disabled={!value && s.id !== 'headline'}
              className={`btn btn-sm ${style === s.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStyle(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="stack gap-8">
        <span className="small" style={{ fontWeight: 600 }}>Colour</span>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {COVER_COLORS.map((c) => (
            <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={color === c} onClick={() => setColor(c)}
              style={{ width: 34, height: 34, borderRadius: 999, background: c, border: color === c ? '3px solid var(--accent)' : '1px solid var(--line-2)', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
      <div className="row gap-8">
        <button type="button" className="btn btn-primary" disabled={busy || !ready}
          onClick={async () => { if (canvas.current) onUse(await coverToFile(canvas.current)); }}>
          {busy ? 'Saving…' : 'Use this cover'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
