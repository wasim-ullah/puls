import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Loader, WorkCard, useToast } from '../components/ui';
import { getProfileByUsername, getProfileWorks, getWorkBySlug, type FullWork } from '../lib/api';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/media';
import { SITE_URL, supabase } from '../lib/supabase';
import type { Category, Profile, WorkCard as WorkCardData } from '../lib/types';
import { prettyHost, safeHref, useTitle, videoEmbed } from '../lib/util';
import NotFound from './NotFound';

export default function WorkPage() {
  const { handle = '', slug = '' } = useParams();
  const username = handle.replace(/^@/, '').toLowerCase();
  const { session } = useAuth();
  const [owner, setOwner] = useState<Profile | null | undefined>(undefined);
  const [data, setData] = useState<FullWork | null | undefined>(undefined);
  const [category, setCategory] = useState<Category | null>(null);
  const [more, setMore] = useState<WorkCardData[]>([]);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    (async () => {
      const p = await getProfileByUsername(username);
      if (cancelled) return;
      setOwner(p);
      if (!p) { setData(null); return; }
      const w = await getWorkBySlug(p.id, slug);
      if (cancelled) return;
      setData(w);
      if (w?.work.category_id) {
        const { data: c } = await supabase.from('categories').select('*').eq('id', w.work.category_id).maybeSingle();
        if (!cancelled) setCategory((c as Category | null) ?? null);
      }
      const others = await getProfileWorks(p.id);
      if (!cancelled) setMore(others.filter((o) => o.status === 'published' && o.slug !== slug).slice(0, 3));
    })();
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [username, slug]);

  useTitle(data?.work.title || '');

  if (data === undefined || owner === undefined) return <Loader />;
  if (!data || !owner) return <NotFound what="work" />;

  const { work, assets, results, credits } = data;
  const isOwner = session?.user.id === work.owner_id;
  const ownerName = owner.display_name || `@${owner.username}`;
  const cover = publicUrl('work-media', work.cover_path);
  const embed = work.video_url ? videoEmbed(work.video_url) : null;
  const story = [
    ['Challenge', work.challenge],
    ['Approach', work.approach],
    ['Outcome', work.outcome],
  ].filter(([, v]) => v.trim());
  const details: [string, string][] = ([
    ['Brand', work.brand],
    ['Agency / team', work.agency],
    ['My role', work.my_role],
    ['Category', category?.name || ''],
    ['Markets', work.markets.join(', ')],
    ['Year', work.year ? String(work.year) : ''],
  ] as [string, string][]).filter(([, v]) => v);

  async function share() {
    const url = `${SITE_URL}/@${owner!.username}/${work.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: work.title, url });
      else { await navigator.clipboard.writeText(url); toast.show('Link copied'); }
    } catch { /* cancelled */ }
  }

  return (
    <>
      {work.status !== 'published' && (
        <div className="wrap" style={{ paddingTop: 16 }}>
          <div className={`notice ${work.status === 'hidden' ? 'notice-err' : 'notice-warn'} row gap-12 between`}>
            <span>{work.status === 'hidden'
              ? 'A moderator has hidden this work. Only you can see it.'
              : 'This is a draft. Only you can see it until you publish.'}</span>
            {isOwner && <Link to={`/edit/${work.id}`} className="btn btn-sm btn-outline">Edit</Link>}
          </div>
        </div>
      )}

      <section className="wrap" style={{ paddingTop: 40, paddingBottom: 32 }}>
        <nav aria-label="Breadcrumb" className="eyebrow" style={{ marginBottom: 20 }}>
          <Link to={`/@${owner.username}`}>@{owner.username}</Link> / {work.title}
        </nav>
        {owner.is_sample && (
          <div className="notice" style={{ marginBottom: 24 }}>
            <b>Sample work.</b> This is a fictional example that shows what a Laud work page looks like. The person, brand and results are made up.
          </div>
        )}
        <div className="row gap-32 between" style={{ alignItems: 'flex-end' }}>
          <div className="stack gap-16" style={{ flex: '1 1 640px' }}>
            {category && <span className="pill pill-line" style={{ alignSelf: 'flex-start' }}>{category.name}</span>}
            <h1 className="display" style={{ fontSize: 'clamp(42px, 6vw, 88px)', lineHeight: 0.98 }}>{work.title}</h1>
            {work.summary && <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 680 }}>{work.summary}</p>}
            <Link to={`/@${owner.username}`} className="row gap-12" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              <Avatar url={owner.avatar_url} name={ownerName} size={40} />
              <span><span style={{ display: 'block', fontWeight: 600 }}>{ownerName}</span><span className="small muted">{owner.headline || `@${owner.username}`}</span></span>
            </Link>
          </div>
          <div className="row gap-8">
            {isOwner && <Link to={`/edit/${work.id}`} className="btn btn-primary">Edit work</Link>}
            <button type="button" className="btn btn-outline" onClick={share}>Share</button>
            {safeHref(work.link_url) && (
              <a className="btn btn-outline" href={safeHref(work.link_url)} target="_blank" rel="noopener noreferrer nofollow">Visit live work</a>
            )}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        {cover && <div className="media-stage"><img src={cover} alt={`${work.title} cover`} /></div>}
        {embed && <div className="video" style={{ marginTop: 12 }}><iframe src={embed} title={`${work.title} video`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>}
        {assets.length > 0 && (
          <div className="gallery">
            {assets.map((a) => (
              <figure key={a.id ?? a.path}>
                <img src={publicUrl('work-media', a.path)} alt={a.caption || ''} loading="lazy" />
                {a.caption && <figcaption>{a.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>

      {results.length > 0 && (
        <section className="wrap" style={{ paddingTop: 48, paddingBottom: 8 }}>
          <div className="row gap-12 between" style={{ marginBottom: 20, alignItems: 'baseline' }}>
            <h2 className="h-md">Results</h2>
            <span className="small muted">Reported by {ownerName}</span>
          </div>
          <div className="results-grid">
            {results.map((r) => (
              <div key={r.id ?? r.metric} className="result-card">
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{r.metric}</span>
                <b>{r.value}</b>
                {r.note && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{r.note}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="split">
          <article className="split-main">
            {story.length === 0 ? <p className="muted">No write-up yet.</p> : story.map(([k, v], i) => (
              <div key={k} className="story-row">
                <span className="eyebrow">{String(i + 1).padStart(2, '0')} · {k}</span>
                <div><p>{v}</p></div>
              </div>
            ))}
          </article>
          <aside className="split-side">
            {details.length > 0 && (
              <div className="side-card"><h2>Details</h2><dl>{details.map(([k, v]) => <div key={k} className="kv"><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
            )}
            {credits.length > 0 && (
              <div className="side-card"><h2>Credits</h2><dl>{credits.map((c) => <div key={c.id ?? c.role + c.name} className="kv"><dt>{c.role}</dt><dd>{c.name}</dd></div>)}</dl></div>
            )}
            {safeHref(work.link_url) && (
              <div className="side-card"><h2>Live work</h2><a className="small" href={safeHref(work.link_url)} target="_blank" rel="noopener noreferrer nofollow" style={{ textDecoration: 'underline' }}>{prettyHost(work.link_url)}</a></div>
            )}
          </aside>
        </div>
      </section>

      {more.length > 0 && (
        <section className="wrap" style={{ paddingBottom: 96 }}>
          <div className="row between" style={{ marginBottom: 24, alignItems: 'baseline' }}>
            <h2 className="h-md">More from {ownerName}</h2>
            <Link to={`/@${owner.username}`} className="small" style={{ fontWeight: 600 }}>View profile →</Link>
          </div>
          <div className="grid-cards">{more.map((w) => <WorkCard key={w.id} w={w} showOwner={false} />)}</div>
        </section>
      )}
      {toast.node}
    </>
  );
}
