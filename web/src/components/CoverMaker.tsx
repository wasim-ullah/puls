import { useEffect, useRef, useState } from 'react';
import { COVER_COLORS, COVER_STYLES, drawCover, loadCoverFonts, type CoverStyle } from '../lib/coverGen';

interface Props {
  title: string;
  brand: string;
  category: string;
  value: string;
  metric: string;
  style: CoverStyle;
  color: string;
  onChange: (next: { style: CoverStyle; color: string }) => void;
}

/** Live preview of the cover Laud makes from the work's title and headline result. */
export default function CoverMaker({ title, brand, category, value, metric, style, color, onChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { void loadCoverFonts().then(() => setReady(true)); }, []);
  useEffect(() => {
    if (ready && canvas.current) drawCover(canvas.current, { title, brand, category, value, metric, style, color });
  }, [ready, title, brand, category, value, metric, style, color]);

  return (
    <div className="stack gap-16">
      <div className="cover-preview" style={{ maxWidth: 560 }}>
        <canvas ref={canvas} style={{ width: '100%', height: '100%', display: 'block' }} aria-label="Cover preview" />
      </div>
      {!value && (
        <span className="small muted">Add a headline result under Results (for example "+64%" and "Online revenue") to put your number on the cover.</span>
      )}
      <div className="stack gap-8">
        <span className="small" style={{ fontWeight: 600 }}>Style</span>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {COVER_STYLES.map((s) => (
            <button key={s.id} type="button" disabled={!value && s.id !== 'headline'}
              className={`btn btn-sm ${style === s.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onChange({ style: s.id, color })}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="stack gap-8">
        <span className="small" style={{ fontWeight: 600 }}>Colour</span>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {COVER_COLORS.map((c) => (
            <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={color === c} onClick={() => onChange({ style, color: c })}
              style={{ width: 34, height: 34, borderRadius: 999, background: c, border: color === c ? '3px solid var(--accent)' : '1px solid var(--line-2)', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
