import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Loader, WorkCard, useToast } from '../components/ui';
import { getProfileByUsername, getProfileWorks } from '../lib/api';
import { useAuth } from '../lib/auth';
import { SITE_HOST, SITE_URL } from '../lib/supabase';
import type { Profile as ProfileData, WorkCard as WorkCardData } from '../lib/types';
import { prettyHost, safeHref, useTitle } from '../lib/util';
import NotFound from './NotFound';

const KIND_LABEL = { person: 'Marketer', agency: 'Agency', team: 'In-house team' } as const;

export default function Profile() {
  const { handle = '' } = useParams();
  const username = handle.replace(/^@/, '').toLowerCase();
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null | undefined>(undefined);
  const [works, setWorks] = useState<WorkCardData[]>([]);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setProfile(undefined);
    getProfileByUsername(username).then(async (p) => {
      if (cancelled) return;
      setProfile(p);
      if (p) {
        const w = await getProfileWorks(p.id);
        if (!cancelled) setWorks(w);
      }
    });
    return () => { cancelled = true; };
  }, [username]);

  const isOwner = Boolean(session && profile && session.user.id === profile.id);
  const published = useMemo(() => works.filter((w) => w.status === 'published'), [works]);
  const drafts = works.length - published.length;
  const brands = useMemo(() => new Set(published.map((w) => w.brand.trim().toLowerCase()).filter(Boolean)).size, [published]);
  const markets = useMemo(() => new Set(published.flatMap((w) => w.markets.map((m) => m.toLowerCase()))).size, [published]);
  const top = published.find((w) => w.headline_value);

  useTitle(profile ? `${profile.display_name || '@' + profile.username}` : '');

  if (profile === undefined) return <Loader />;
  if (profile === null) return <NotFound what="profile" />;

  const name = profile.display_name || `@${profile.username}`;
  const link = `${SITE_URL}/@${profile.username}`;

  async function copy() {
    try { await navigator.clipboard.writeText(link); toast.show('Profile link copied'); }
    catch { toast.show(link); }
  }

  return (
    <>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="row gap-32 between" style={{ alignItems: 'flex-end' }}>
          <div className="row gap-24" style={{ alignItems: 'flex-end', flex: '1 1 600px' }}>
            <Avatar url={profile.avatar_url} name={name} size={120} />
            <div className="stack gap-8" style={{ flex: '1 1 340px', minWidth: 0 }}>
              <div className="row gap-8">
                {profile.available_for_work && <span className="pill pill-line"><span className="dot" style={{ background: 'var(--good)' }} />Available for work</span>}
                {profile.kind !== 'person' && <span className="pill pill-dark">{KIND_LABEL[profile.kind]}</span>}
              </div>
              <h1 className="display" style={{ fontSize: 'clamp(38px, 4.6vw, 64px)' }}>{name}</h1>
              {(profile.headline || profile.location) && (
                <p style={{ fontSize: 16, color: 'var(--ink-2)' }}>{[profile.headline, profile.location].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          </div>
          <div className="stack gap-8" style={{ alignItems: 'flex-start' }}>
            <div className="row gap-8" style={{ height: 44, padding: '0 6px 0 16px', borderRadius: 999, background: '#fff', border: '1px solid var(--line)' }}>
              <span className="mono small">{SITE_HOST}/<b style={{ fontWeight: 500 }}>@{profile.username}</b></span>
              <button type="button" className="btn btn-sm btn-light icon-btn" style={{ width: 32, height: 32 }} aria-label="Copy profile link" onClick={copy}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h9" /></svg>
              </button>
            </div>
            <div className="row gap-8">
              {isOwner ? (
                <>
                  <Link to="/new" className="btn btn-primary">Add work</Link>
                  <Link to="/settings" className="btn btn-outline">Edit profile</Link>
                </>
              ) : (
                <>
                  {safeHref(profile.linkedin) && <a className="btn btn-primary" href={safeHref(profile.linkedin)} target="_blank" rel="noopener noreferrer nofollow">Connect on LinkedIn</a>}
                  {safeHref(profile.website) && <a className="btn btn-outline" href={safeHref(profile.website)} target="_blank" rel="noopener noreferrer nofollow">Website</a>}
                </>
              )}
            </div>
          </div>
        </div>

        <dl style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--line)' }}>
          {[
            ['WORK', String(published.length)],
            ['BRANDS', String(brands)],
            ['MARKETS', String(markets)],
            ['TOP RESULT', top ? `${top.headline_value}` : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '18px 20px 18px 0' }}>
              <dt className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{k}</dt>
              <dd style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', color: k === 'TOP RESULT' && top ? 'var(--accent)' : undefined }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="split">
          <div className="split-main stack gap-24">
            {isOwner && drafts > 0 && (
              <div className="notice row gap-12 between">
                <span>You have <b>{drafts} draft{drafts > 1 ? 's' : ''}</b> only you can see.</span>
                <Link to="/dashboard" className="btn btn-sm btn-outline">Manage work</Link>
              </div>
            )}
            {published.length === 0 ? (
              <div className="empty">
                <b style={{ fontSize: 18 }}>{isOwner ? 'Your profile is ready for its first piece' : 'No work published yet'}</b>
                {isOwner ? <Link to="/new" className="btn btn-primary">Add work</Link> : <span className="muted">Check back soon.</span>}
              </div>
            ) : (
              <div className="grid-cards tight">{published.map((w) => <WorkCard key={w.id} w={w} showOwner={false} />)}</div>
            )}
          </div>

          <aside className="split-side">
            {profile.bio && (
              <div className="side-card"><h2>About</h2><p style={{ fontSize: 14, color: 'var(--ink-2)', whiteSpace: 'pre-line' }}>{profile.bio}</p></div>
            )}
            {profile.skills.length > 0 && (
              <div className="side-card">
                <h2>Strongest in</h2>
                <div className="row gap-8">{profile.skills.map((s) => <span key={s} className="pill pill-line" style={{ height: 32 }}>{s}</span>)}</div>
              </div>
            )}
            {(safeHref(profile.website) || safeHref(profile.linkedin)) && (
              <div className="side-card">
                <h2>Links</h2>
                <dl>
                  {safeHref(profile.linkedin) && <div className="kv"><dt>LinkedIn</dt><dd><a href={safeHref(profile.linkedin)} target="_blank" rel="noopener noreferrer nofollow">{prettyHost(profile.linkedin).replace(/^linkedin\.com/, '')}</a></dd></div>}
                  {safeHref(profile.website) && <div className="kv"><dt>Website</dt><dd><a href={safeHref(profile.website)} target="_blank" rel="noopener noreferrer nofollow">{prettyHost(profile.website)}</a></dd></div>}
                </dl>
              </div>
            )}
            <div className="side-card">
              <h2>Brands worked with</h2>
              {published.length === 0 ? <span className="small muted">None listed yet.</span> : (
                <dl>
                  {[...new Map(published.filter((w) => w.brand).map((w) => [w.brand.toLowerCase(), w])).values()].slice(0, 10).map((w) => (
                    <div key={w.id} className="kv"><dt style={{ color: 'var(--ink)' }}>{w.brand}</dt><dd className="small muted" style={{ fontWeight: 400 }}>{w.category_name || ''}</dd></div>
                  ))}
                </dl>
              )}
            </div>
          </aside>
        </div>
      </section>
      {toast.node}
    </>
  );
}
