import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { UsernameStatus } from './types';

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '') || 'work';
}

export function normaliseUsername(s: string): string {
  return s.trim().replace(/^@/, '').toLowerCase();
}

export function usernameProblem(s: string): string | null {
  if (!s) return null;
  if (s.length < 3) return 'At least 3 characters';
  if (s.length > 30) return '30 characters at most';
  if (!/^[a-z0-9_]+$/.test(s)) return 'Letters, numbers and underscores only';
  return null;
}

export function splitList(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export function initials(name: string, fallback = '?'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Laud` : 'Laud — The marketing portfolio that gives you visibility';
  }, [title]);
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Live availability check for a username as the person types. */
export function useUsernameStatus(raw: string, currentUsername?: string | null) {
  const name = normaliseUsername(raw);
  const debounced = useDebounced(name);
  const [status, setStatus] = useState<UsernameStatus | 'checking' | 'yours' | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!debounced) { setStatus(null); return; }
    if (currentUsername && debounced === currentUsername) { setStatus('yours'); return; }
    if (usernameProblem(debounced)) { setStatus('invalid'); return; }
    setStatus('checking');
    supabase.rpc('username_status', { p_name: debounced }).then(({ data, error }) => {
      if (cancelled) return;
      setStatus(error ? null : (data as UsernameStatus));
    });
    return () => { cancelled = true; };
  }, [debounced, currentUsername]);

  return { name, status: name !== debounced && name ? 'checking' as const : status };
}

/** Turns a YouTube or Vimeo link into a safe embed URL; anything else returns null. */
export function videoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
      return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = u.pathname.match(/(\d{5,12})/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function prettyHost(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function safeHref(url: string): string | undefined {
  return /^https?:\/\//i.test(url) ? url : undefined;
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'Something went wrong. Please try again.';
}

/** The client as visitors see it: the brand, or the owner's description when the client is confidential. */
export function clientLabel(w: { brand: string; client_hidden?: boolean; client_descriptor?: string }): string {
  return w.client_hidden ? (w.client_descriptor || 'Confidential client') : w.brand;
}
