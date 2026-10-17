import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { CheckIcon, Loader, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { publicUrl, removeFiles } from '../lib/media';
import { SITE_HOST, SITE_URL, supabase } from '../lib/supabase';
import type { WorkCard } from '../lib/types';
import { errorMessage, useTitle } from '../lib/util';

const STATUS_PILL = { draft: ['Draft', 'pill-draft'], published: ['Published', 'pill-live'], hidden: ['Hidden by moderator', 'pill-hidden'] } as const;

export default function Dashboard() {
  useTitle('My work');
  const { profile, session } = useAuth();
  const [params] = useSearchParams();
  const [works, setWorks] = useState<WorkCard[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from('work_cards').select('*').eq('owner_id', session.user.id)
      .order('sort').order('updated_at', { ascending: false });
    setWorks((data as WorkCard[] | null) ?? []);
  }, [session]);

  useEffect(() => { void load(); }, [load]);

  if (!profile || works === null) return <Loader />;
  if (!profile.username) return <Navigate to="/settings" replace />;

  const published = works.filter((w) => w.status === 'published').length;
  const checklist: [string, boolean, string][] = [
    ['Claim your username', true, '/settings'],
    ['Add a photo', Boolean(profile.avatar_url), '/settings'],
    ['Write a headline and bio', Boolean(profile.headline && profile.bio), '/settings'],
    ['Publish your first piece of work', published > 0, '/new'],
    ['Publish three pieces', published >= 3, '/new'],
  ];
  const done = checklist.filter(([, d]) => d).length;
  const link = `${SITE_URL}/@${profile.username}`;

  async function setStatus(w: WorkCard, status: 'draft' | 'published') {
    setBusyId(w.id);
    const { error } = await supabase.from('works').update({ status }).eq('id', w.id);
    setBusyId(null);
    if (error) { toast.show(errorMessage(error)); return; }
    toast.show(status === 'published' ? 'Published' : 'Moved to drafts');
    void load();
  }

  async function remove(w: WorkCard) {
    if (!window.confirm(`Delete “${w.title || 'Untitled'}”? This can't be undone.`)) return;
    setBusyId(w.id);
    const { data: assets } = await supabase.from('work_assets').select('path').eq('work_id', w.id);
    const { error } = await supabase.from('works').delete().eq('id', w.id);
    if (!error) await removeFiles('work-media', [w.cover_path, ...((assets as { path: string }[] | null) ?? []).map((a) => a.path)]);
    setBusyId(null);
    if (error) { toast.show(errorMessage(error)); return; }
    toast.show('Deleted');
    void load();
  }

  async function move(index: number, dir: -1 | 1) {
    if (!works) return;
    const next = [...works];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setWorks(next);
    await Promise.all(next.map((w, i) => (w.sort !== i ? supabase.from('works').update({ sort: i }).eq('id', w.id) : null)));
    void load();
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); toast.show('Profile link copied'); } catch { toast.show(link); }
  }

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 120 }}>
      {params.get('welcome') && (
        <div className="notice row gap-12 between" style={{ marginBottom: 24, background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>
          <span>Welcome to Puls. <b>{SITE_HOST}/@{profile.username}</b> is yours.</span>
          <Link to="/new" className="btn btn-sm btn-light">Add your first piece</Link>
        </div>
      )}
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div className="stack gap-8">
          <h1 className="display" style={{ fontSize: 'clamp(38px, 4.6vw, 60px)' }}>My work</h1>
          <div className="row gap-8">
            <span className="mono small">{SITE_HOST}/@{profile.username}</span>
            <button type="button" className="btn btn-sm btn-outline" onClick={copy}>Copy link</button>
            <Link to={`/@${profile.username}`} className="btn btn-sm btn-outline">View profile</Link>
          </div>
        </div>
        <Link to="/new" className="btn btn-primary btn-lg">Add work</Link>
      </div>

      <div className="split">
        <div className="split-main">
          {works.length === 0 ? (
            <div className="empty">
              <b style={{ fontSize: 20 }}>Nothing here yet</b>
              <span className="muted">Add a campaign, launch or piece of growth work you're proud of.</span>
              <Link to="/new" className="btn btn-primary">Add your first piece</Link>
            </div>
          ) : (
            <div>
              <div className="row between small muted" style={{ paddingBottom: 8 }}>
                <span>{works.length} piece{works.length > 1 ? 's' : ''} · {published} published</span>
                <span>Order shown on your profile</span>
              </div>
              {works.map((w, i) => {
                const [label, cls] = STATUS_PILL[w.status];
                const cover = publicUrl('work-media', w.cover_path);
                return (
                  <div key={w.id} className="work-row">
                    <div className="mini">{cover && <img src={cover} alt="" loading="lazy" />}</div>
                    <div style={{ minWidth: 0 }} className="stack gap-4">
                      <div className="row gap-8">
                        <Link to={`/edit/${w.id}`} className="work-title" style={{ fontSize: 17 }}>{w.title || 'Untitled'}</Link>
                        <span className={`pill ${cls}`}>{label}</span>
                      </div>
                      <span className="work-sub">{[w.brand, w.category_name, w.year].filter(Boolean).join(' · ') || 'No details yet'}</span>
                    </div>
                    <div className="row gap-8 actions">
                      <button type="button" className="btn btn-sm btn-outline icon-btn" style={{ width: 36 }} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                      <button type="button" className="btn btn-sm btn-outline icon-btn" style={{ width: 36 }} aria-label="Move down" disabled={i === works.length - 1} onClick={() => move(i, 1)}>↓</button>
                      <Link to={`/edit/${w.id}`} className="btn btn-sm btn-outline">Edit</Link>
                      {w.status === 'published' && <Link to={`/@${profile.username}/${w.slug}`} className="btn btn-sm btn-outline">View</Link>}
                      {w.status === 'draft' && <button type="button" className="btn btn-sm btn-primary" disabled={busyId === w.id} onClick={() => setStatus(w, 'published')}>Publish</button>}
                      {w.status === 'published' && <button type="button" className="btn btn-sm btn-outline" disabled={busyId === w.id} onClick={() => setStatus(w, 'draft')}>Unpublish</button>}
                      <button type="button" className="btn btn-sm btn-danger" disabled={busyId === w.id} onClick={() => remove(w)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <aside className="split-side">
          <div className="side-card">
            <div className="row between"><h2>Profile checklist</h2><span className="mono small muted">{done}/{checklist.length}</span></div>
            <ul className="checklist" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {checklist.map(([label, ok, to]) => (
                <li key={label}>
                  <span className={`check ${ok ? 'done' : ''}`}>{ok && <CheckIcon size={12} />}</span>
                  {ok ? <span className="muted">{label}</span> : <Link to={to} style={{ fontWeight: 500 }}>{label}</Link>}
                </li>
              ))}
            </ul>
          </div>
          <div className="side-card">
            <h2>Coming in the next release</h2>
            <p className="small muted">Verified results, jury scores and daily awards. Work you publish now can be entered when they launch.</p>
          </div>
        </aside>
      </div>
      {toast.node}
    </section>
  );
}
