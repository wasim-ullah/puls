import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/media';
import { clientLabel, initials } from '../lib/util';
import type { WorkCard as WorkCardData } from '../lib/types';

/** Laud mark: a four-point spark, the "star" of praise. */
export function LaudIcon({ size = 16, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5c.5 4.6 2.9 7 9.5 9.5-6.6 2.5-9 4.9-9.5 9.5-.5-4.6-2.9-7-9.5-9.5 6.6-2.5 9-4.9 9.5-9.5z" fill={color} />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Laud home">
      <span className="logo-mark"><LaudIcon /></span>
      Laud
    </Link>
  );
}

export function VerifiedTick({ size = 18 }: { size?: number }) {
  return (
    <svg className="verified-tick" width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Verified by Laud">
      <title>Verified by Laud</title>
      <path fill="#1D9BF0" d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.65.15-.44.23-.91.23-1.4 0-2.2-1.7-3.99-3.8-3.99-.47 0-.92.08-1.33.25C14.82 2.42 13.5 1.5 12 1.5s-2.82.92-3.42 2.21c-.41-.17-.86-.25-1.33-.25-2.1 0-3.8 1.79-3.8 3.99 0 .49.08.96.23 1.4C2.38 9.55 1.5 10.92 1.5 12.5c0 1.5.8 2.8 1.98 3.53-.03.2-.04.4-.04.6 0 2.21 1.7 4 3.8 4 .47 0 .92-.09 1.33-.25.6 1.29 1.92 2.21 3.43 2.21s2.83-.92 3.43-2.21c.41.16.86.25 1.33.25 2.1 0 3.8-1.79 3.8-4 0-.2-.01-.4-.04-.6 1.18-.73 1.98-2.03 1.98-3.53z"/>
      <path fill="#fff" d="M10.5 16.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4z"/>
    </svg>
  );
}

export function Avatar({ url, name, size = 44 }: { url?: string; name: string; size?: number }) {
  const src = url ? publicUrl('avatars', url) : '';
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.max(11, size / 3.2) }}>
      {src ? <img src={src} alt="" loading="lazy" /> : initials(name)}
    </span>
  );
}

export function Loader() {
  return <div className="loader" role="status" aria-label="Loading"><span className="spinner" /></div>;
}

export function WorkCard({ w, showOwner = true, tag }: { w: WorkCardData; showOwner?: boolean; tag?: string }) {
  const cover = publicUrl('work-media', w.cover_path);
  const sub = showOwner
    ? [w.display_name || (w.username ? `@${w.username}` : ''), clientLabel(w)].filter(Boolean).join(' · ')
    : [clientLabel(w), w.category_name, w.year].filter(Boolean).join(' · ');
  return (
    <Link to={`/@${w.username}/${w.slug}`} className="work-card">
      <div className="work-thumb">
        {cover ? <img src={cover} alt="" loading="lazy" /> : <div className="thumb-empty">{w.title}</div>}
        {(tag || w.category_name) && <span className="thumb-tag">{tag || w.category_name}</span>}
        {w.is_sample && <span className="thumb-tag sample-tag">Sample</span>}
      </div>
      <div className="work-meta">
        <div style={{ minWidth: 0 }}>
          <div className="work-title">{w.title}</div>
          <div className="work-sub">{showOwner && w.is_verified && <VerifiedTick size={13} />} {sub}</div>
        </div>
        {w.headline_value && (
          <div className="work-figure">
            <b>{w.headline_value}</b>
            <span>{w.headline_metric}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? <div className="toast" role="status">{msg}</div> : null;
  return { show: useCallback((m: string) => setMsg(m), []), node };
}

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 12.5l4 4 8-9" /></svg>
  );
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
  );
}
