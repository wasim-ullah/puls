import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/media';
import { initials } from '../lib/util';
import type { WorkCard as WorkCardData } from '../lib/types';

export function PulseIcon({ size = 16, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 13h5l2.5-6 4 11 2.5-5H22" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Puls home">
      <span className="logo-mark"><PulseIcon /></span>
      Puls
    </Link>
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
    ? [w.display_name || (w.username ? `@${w.username}` : ''), w.brand].filter(Boolean).join(' · ')
    : [w.brand, w.category_name, w.year].filter(Boolean).join(' · ');
  return (
    <Link to={`/@${w.username}/${w.slug}`} className="work-card">
      <div className="work-thumb">
        {cover ? <img src={cover} alt="" loading="lazy" /> : <div className="thumb-empty">{w.title}</div>}
        {(tag || w.category_name) && <span className="thumb-tag">{tag || w.category_name}</span>}
      </div>
      <div className="work-meta">
        <div style={{ minWidth: 0 }}>
          <div className="work-title">{w.title}</div>
          <div className="work-sub">{sub}</div>
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
