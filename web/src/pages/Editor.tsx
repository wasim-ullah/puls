import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Link, useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader, useToast } from '../components/ui';
import { getWorkById } from '../lib/api';
import { useAuth } from '../lib/auth';
import { publicUrl, removeFiles, uploadImage } from '../lib/media';
import { SITE_HOST, supabase } from '../lib/supabase';
import type { Category, Work, WorkAsset, WorkCredit, WorkResult, WorkStatus } from '../lib/types';
import { errorMessage, slugify, splitList, useTitle, videoEmbed } from '../lib/util';
import NotFound from './NotFound';

const MAX_GALLERY = 12;
const thisYear = new Date().getFullYear();

interface Form {
  title: string; slug: string; brand: string; agency: string; my_role: string;
  category_id: string; markets: string; year: string; summary: string;
  challenge: string; approach: string; outcome: string;
  cover_path: string; video_url: string; link_url: string;
}

const EMPTY: Form = {
  title: '', slug: '', brand: '', agency: '', my_role: '', category_id: '', markets: '', year: '',
  summary: '', challenge: '', approach: '', outcome: '', cover_path: '', video_url: '', link_url: '',
};

function fromWork(w: Work): Form {
  return {
    title: w.title, slug: w.slug, brand: w.brand, agency: w.agency, my_role: w.my_role,
    category_id: w.category_id ? String(w.category_id) : '', markets: w.markets.join(', '),
    year: w.year ? String(w.year) : '', summary: w.summary, challenge: w.challenge, approach: w.approach,
    outcome: w.outcome, cover_path: w.cover_path, video_url: w.video_url, link_url: w.link_url,
  };
}

function Count({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return <span className="hint" style={{ marginLeft: 'auto', color: n > max ? 'var(--bad)' : undefined }}>{n}/{max}</span>;
}

function Dropzone({ label, hint, multiple, disabled, onFiles }: {
  label: string; hint: string; multiple?: boolean; disabled?: boolean; onFiles: (files: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDrag(false);
    if (!disabled) onFiles(Array.from(e.dataTransfer.files));
  };
  return (
    <label className={`dropzone ${drag ? 'drag' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)} onDrop={onDrop}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
      <b>{label}</b>
      <span className="small muted">{hint}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} disabled={disabled}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
    </label>
  );
}

export default function Editor() {
  const { id } = useParams();
  const isNew = !id;
  useTitle(isNew ? 'Add work' : 'Edit work');
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<WorkStatus>('draft');
  const [assets, setAssets] = useState<WorkAsset[]>([]);
  const [results, setResults] = useState<WorkResult[]>([]);
  const [credits, setCredits] = useState<WorkCredit[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(isNew ? 'ready' : 'loading');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirtyState] = useState(false);
  const dirtyRef = useRef(false);
  const setDirty = (v: boolean) => { dirtyRef.current = v; setDirtyState(v); };
  const removed = useRef<string[]>([]);
  const original = useRef<{ cover: string; assets: string[] }>({ cover: '', assets: [] });

  // A brand-new draft moves from /new to /edit/:id after its first save.
  useEffect(() => {
    if ((location.state as { saved?: boolean } | null)?.saved) toast.show('Draft saved');
  }, [location.state, toast.show]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort').then(({ data }) => setCats((data as Category[] | null) ?? []));
  }, []);

  useEffect(() => {
    if (isNew || !session) return;
    getWorkById(id!).then((full) => {
      if (!full || full.work.owner_id !== session.user.id) { setState('missing'); return; }
      setForm(fromWork(full.work));
      setStatus(full.work.status);
      setAssets(full.assets);
      setResults(full.results);
      setCredits(full.credits);
      original.current = { cover: full.work.cover_path, assets: full.assets.map((a) => a.path) };
      setState('ready');
    });
  }, [id, isNew, session]);

  // Warn before leaving with unsaved changes.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('You have unsaved changes. Leave without saving?')) blocker.proceed(); else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);

  if (state === 'missing') return <NotFound what="work" />;
  if (state === 'loading' || !session || !profile) return <Loader />;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setDirty(true);
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  };

  async function addCover(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading('cover'); setError(null);
    try {
      const path = await uploadImage(file, 'work-media', session!.user.id);
      if (form.cover_path && form.cover_path !== original.current.cover) removed.current.push(form.cover_path);
      set('cover_path', path);
    } catch (e) { setError(errorMessage(e)); } finally { setUploading(null); }
  }

  async function addGallery(files: File[]) {
    const room = MAX_GALLERY - assets.length;
    if (room <= 0) { setError(`Up to ${MAX_GALLERY} gallery images.`); return; }
    setUploading('gallery'); setError(null);
    try {
      const added: WorkAsset[] = [];
      for (const f of files.slice(0, room)) {
        const path = await uploadImage(f, 'work-media', session!.user.id);
        added.push({ path, caption: '', sort: 0 });
      }
      setAssets((a) => [...a, ...added]);
      setDirty(true);
      if (files.length > room) setError(`Only the first ${room} were added (limit ${MAX_GALLERY}).`);
    } catch (e) { setError(errorMessage(e)); } finally { setUploading(null); }
  }

  function moveAsset(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= assets.length) return;
    const next = [...assets];
    [next[i], next[j]] = [next[j], next[i]];
    setAssets(next); setDirty(true);
  }

  function removeAsset(i: number) {
    const a = assets[i];
    if (!original.current.assets.includes(a.path)) removed.current.push(a.path);
    setAssets(assets.filter((_, k) => k !== i)); setDirty(true);
  }

  async function save(nextStatus: WorkStatus, e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    if (title.length < 2) { setError('Give your work a title.'); return; }
    if (nextStatus === 'published' && !form.cover_path) { setError('Add a cover image before publishing.'); return; }
    if (form.video_url && !videoEmbed(form.video_url)) { setError('Video links must be YouTube or Vimeo.'); return; }
    const year = form.year ? Number(form.year) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1990 || year > thisYear + 1)) { setError(`Year should be between 1990 and ${thisYear + 1}.`); return; }
    const link = form.link_url.trim() && !/^https?:\/\//i.test(form.link_url.trim()) ? `https://${form.link_url.trim()}` : form.link_url.trim();

    const payload = {
      title: title.slice(0, 120), slug, brand: form.brand.trim().slice(0, 80), agency: form.agency.trim().slice(0, 80),
      my_role: form.my_role.trim().slice(0, 80), category_id: form.category_id ? Number(form.category_id) : null,
      markets: splitList(form.markets).slice(0, 10).map((m) => m.slice(0, 40)), year,
      summary: form.summary.trim().slice(0, 280), challenge: form.challenge.trim(), approach: form.approach.trim(),
      outcome: form.outcome.trim(), cover_path: form.cover_path, video_url: form.video_url.trim(), link_url: link,
      status: status === 'hidden' ? 'hidden' as const : nextStatus,
    };

    setSaving(true);
    try {
      let workId = id;
      if (isNew) {
        // Find a free slug for this owner.
        const { data: taken } = await supabase.from('works').select('slug').eq('owner_id', session!.user.id).like('slug', `${slug}%`);
        const used = new Set(((taken as { slug: string }[] | null) ?? []).map((t) => t.slug));
        let free = slug; let n = 2;
        while (used.has(free)) free = `${slug}-${n++}`;
        const { data, error: err } = await supabase.from('works')
          .insert({ ...payload, slug: free, owner_id: session!.user.id, sort: -Math.floor(Date.now() / 1000) })
          .select('id').single();
        if (err) throw err;
        workId = (data as { id: string }).id;
      } else {
        const { error: err } = await supabase.from('works').update(payload).eq('id', workId!);
        if (err) throw err;
      }

      // Replace child rows with what's on screen.
      const wid = workId!;
      await supabase.from('work_assets').delete().eq('work_id', wid).throwOnError();
      await supabase.from('work_results').delete().eq('work_id', wid).throwOnError();
      await supabase.from('work_credits').delete().eq('work_id', wid).throwOnError();
      const a = assets.map((x, i) => ({ work_id: wid, path: x.path, caption: x.caption.trim().slice(0, 200), sort: i }));
      const r = results.filter((x) => x.value.trim() && x.metric.trim())
        .map((x, i) => ({ work_id: wid, value: x.value.trim().slice(0, 24), metric: x.metric.trim().slice(0, 80), note: x.note.trim().slice(0, 120), sort: i }));
      const c = credits.filter((x) => x.role.trim() && x.name.trim())
        .map((x, i) => ({ work_id: wid, role: x.role.trim().slice(0, 60), name: x.name.trim().slice(0, 80), sort: i }));
      if (a.length) await supabase.from('work_assets').insert(a).throwOnError();
      if (r.length) await supabase.from('work_results').insert(r).throwOnError();
      if (c.length) await supabase.from('work_credits').insert(c).throwOnError();

      // Clean up files that were replaced or removed.
      const stillUsed = new Set([form.cover_path, ...assets.map((x) => x.path)]);
      const gone = [
        ...removed.current,
        ...(original.current.cover && !stillUsed.has(original.current.cover) ? [original.current.cover] : []),
        ...original.current.assets.filter((p) => !stillUsed.has(p)),
      ].filter((p) => !stillUsed.has(p));
      if (gone.length) await removeFiles('work-media', [...new Set(gone)]);
      removed.current = [];
      original.current = { cover: form.cover_path, assets: assets.map((x) => x.path) };

      setDirty(false);
      setStatus(payload.status);
      if (nextStatus === 'published' && payload.status === 'published') {
        const { data: w } = await supabase.from('works').select('slug').eq('id', wid).single();
        navigate(`/@${profile!.username}/${(w as { slug: string }).slug}`);
        return;
      }
      if (isNew) navigate(`/edit/${wid}`, { replace: true, state: { saved: true } });
      else toast.show('Draft saved');
    } catch (err) {
      const e2 = err as { code?: string };
      setError(e2.code === '23505' ? 'You already have work at that address. Change the link.' : errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const coverUrl = publicUrl('work-media', form.cover_path);
  const needsUsername = !profile.username;

  return (
    <form onSubmit={(e) => save('draft', e)}>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="section-head" style={{ marginBottom: 0 }}>
          <div className="stack gap-8">
            <Link to="/dashboard" className="eyebrow">← My work</Link>
            <h1 className="display" style={{ fontSize: 'clamp(38px, 4.6vw, 64px)' }}>{isNew ? 'Add work' : form.title || 'Edit work'}</h1>
          </div>
          <p className="muted" style={{ flex: '0 1 420px' }}>
            Show the work as it ran and the story behind it. Only the title and a cover image are required to publish.
          </p>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 48 }}>
        <div className="split" style={{ gap: 32 }}>
          <div className="split-main stack gap-20" style={{ gap: 20 }}>
            {needsUsername && (
              <div className="notice notice-warn row gap-12 between">
                <span>Choose your username before publishing. You can still save drafts.</span>
                <Link to="/settings" className="btn btn-sm btn-outline">Choose username</Link>
              </div>
            )}

            <fieldset className="panel" style={{ margin: 0 }}>
              <legend className="eyebrow" style={{ padding: '0 8px', marginLeft: -8 }}>01 · The work</legend>
              <div className="grid-2">
                <label className="field full">Title
                  <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} required placeholder="e.g. Souq Night Drop" />
                </label>
                <label className="field full">Link <span className="hint">The address of this piece on your profile</span>
                  <span className="input-prefix">
                    <span>{SITE_HOST}/@{profile.username || 'you'}/</span>
                    <input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }} maxLength={80} placeholder="souq-night-drop" />
                  </span>
                </label>
                <label className="field">Brand / client<input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} maxLength={80} placeholder="Dune Coffee Co." /></label>
                <label className="field">Agency or team<input className="input" value={form.agency} onChange={(e) => set('agency', e.target.value)} maxLength={80} placeholder="Northlane Studio, or In-house" /></label>
                <label className="field">Your role<input className="input" value={form.my_role} onChange={(e) => set('my_role', e.target.value)} maxLength={80} placeholder="Performance lead" /></label>
                <label className="field">Category
                  <select className="select" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                    <option value="">Choose a category</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="field">Markets <span className="hint">Comma separated</span><input className="input" value={form.markets} onChange={(e) => set('markets', e.target.value)} placeholder="UAE, KSA" /></label>
                <label className="field">Year<input className="input" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder={String(thisYear)} /></label>
                <label className="field full"><span className="row">Summary <span className="hint" style={{ marginLeft: 6 }}>Shown on cards and at the top of the page</span><Count value={form.summary} max={280} /></span>
                  <textarea className="textarea" rows={2} value={form.summary} onChange={(e) => set('summary', e.target.value)} maxLength={280} placeholder="A coffee that only existed after dark, sold through thirty Instagram drops." />
                </label>
              </div>
            </fieldset>

            <fieldset className="panel" style={{ margin: 0 }}>
              <legend className="eyebrow" style={{ padding: '0 8px', marginLeft: -8 }}>02 · Visuals</legend>
              <div className="stack gap-8">
                <span className="field" style={{ gap: 2 }}>Cover image <span className="hint">Used on cards and as the main image. 4:3 works best.</span></span>
                {form.cover_path ? (
                  <div className="row gap-16" style={{ alignItems: 'flex-end' }}>
                    <div className="cover-preview" style={{ flex: '1 1 300px' }}><img src={coverUrl} alt="Cover preview" /></div>
                    <div className="stack gap-8">
                      <label className="btn btn-outline" style={{ position: 'relative', overflow: 'hidden' }}>
                        {uploading === 'cover' ? 'Uploading…' : 'Replace cover'}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(uploading)}
                          onChange={(e) => { void addCover(Array.from(e.target.files ?? [])); e.target.value = ''; }}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      </label>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (form.cover_path !== original.current.cover) removed.current.push(form.cover_path); set('cover_path', ''); }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <Dropzone label={uploading === 'cover' ? 'Uploading…' : 'Drop your cover image'} hint="JPG, PNG, WebP or GIF · large photos are resized automatically" disabled={Boolean(uploading)} onFiles={addCover} />
                )}
              </div>

              <div className="stack gap-8">
                <span className="field" style={{ gap: 2 }}>Gallery <span className="hint">Up to {MAX_GALLERY} more images: ads, stories, landing pages, packaging.</span></span>
                {assets.length > 0 && (
                  <div className="thumb-list">
                    {assets.map((a, i) => (
                      <div key={a.path} className="thumb-item">
                        <img src={publicUrl('work-media', a.path)} alt="" />
                        <div className="controls">
                          <input className="input" value={a.caption} maxLength={200} placeholder="Caption (optional)" aria-label={`Caption for image ${i + 1}`}
                            onChange={(e) => { const next = [...assets]; next[i] = { ...a, caption: e.target.value }; setAssets(next); setDirty(true); }} />
                          <div className="row gap-4 between">
                            <div className="row gap-4">
                              <button type="button" className="btn btn-sm btn-outline icon-btn" style={{ width: 36 }} aria-label="Move left" disabled={i === 0} onClick={() => moveAsset(i, -1)}>←</button>
                              <button type="button" className="btn btn-sm btn-outline icon-btn" style={{ width: 36 }} aria-label="Move right" disabled={i === assets.length - 1} onClick={() => moveAsset(i, 1)}>→</button>
                            </div>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => removeAsset(i)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {assets.length < MAX_GALLERY && (
                  <Dropzone label={uploading === 'gallery' ? 'Uploading…' : 'Drop gallery images'} hint="Select several at once" multiple disabled={Boolean(uploading)} onFiles={addGallery} />
                )}
              </div>

              <div className="grid-2">
                <label className="field">Video <span className="hint">YouTube or Vimeo link</span>
                  <input className="input" type="url" value={form.video_url} onChange={(e) => set('video_url', e.target.value)} placeholder="https://youtu.be/…" />
                </label>
                <label className="field">Live link <span className="hint">Landing page, article or post</span>
                  <input className="input" value={form.link_url} onChange={(e) => set('link_url', e.target.value)} placeholder="https://…" />
                </label>
              </div>
            </fieldset>

            <fieldset className="panel" style={{ margin: 0 }}>
              <legend className="eyebrow" style={{ padding: '0 8px', marginLeft: -8 }}>03 · The story</legend>
              {([
                ['challenge', 'Challenge', 'What was the brief, and what made it hard?', 2000],
                ['approach', 'Approach', 'The insight, the idea, and how you executed it.', 3000],
                ['outcome', 'Outcome', 'What happened, and what you learned.', 2000],
              ] as const).map(([key, label, ph, max]) => (
                <label key={key} className="field"><span className="row">{label}<Count value={form[key]} max={max} /></span>
                  <textarea className="textarea" rows={4} value={form[key]} onChange={(e) => set(key, e.target.value)} maxLength={max} placeholder={ph} />
                </label>
              ))}
            </fieldset>

            <fieldset className="panel" style={{ margin: 0 }}>
              <legend className="eyebrow" style={{ padding: '0 8px', marginLeft: -8 }}>04 · Results</legend>
              <div className="panel-head">
                <h2 className="h-sm">What moved?</h2>
                <span className="small muted">Shown as “reported by you”. Verified results arrive in the next release.</span>
              </div>
              {results.map((r, i) => (
                <div key={i} className="repeat-row">
                  <label className="field">Figure<input className="input" value={r.value} maxLength={24} placeholder="+184%"
                    onChange={(e) => { const n = [...results]; n[i] = { ...r, value: e.target.value }; setResults(n); setDirty(true); }} /></label>
                  <label className="field">Metric<input className="input" value={r.metric} maxLength={80} placeholder="Online revenue"
                    onChange={(e) => { const n = [...results]; n[i] = { ...r, metric: e.target.value }; setResults(n); setDirty(true); }} /></label>
                  <label className="field">Compared with<input className="input" value={r.note} maxLength={120} placeholder="Same month last year"
                    onChange={(e) => { const n = [...results]; n[i] = { ...r, note: e.target.value }; setResults(n); setDirty(true); }} /></label>
                  <button type="button" className="btn btn-outline icon-btn" aria-label={`Remove result ${i + 1}`} onClick={() => { setResults(results.filter((_, k) => k !== i)); setDirty(true); }}>×</button>
                </div>
              ))}
              {results.length < 6 && (
                <button type="button" className="btn btn-sm btn-outline" style={{ alignSelf: 'flex-start', borderStyle: 'dashed' }}
                  onClick={() => { setResults([...results, { value: '', metric: '', note: '', sort: results.length }]); setDirty(true); }}>+ Add a result</button>
              )}
            </fieldset>

            <fieldset className="panel" style={{ margin: 0 }}>
              <legend className="eyebrow" style={{ padding: '0 8px', marginLeft: -8 }}>05 · Credits</legend>
              {credits.map((c, i) => (
                <div key={i} className="repeat-row">
                  <label className="field">Role<input className="input" value={c.role} maxLength={60} placeholder="Creative Director"
                    onChange={(e) => { const n = [...credits]; n[i] = { ...c, role: e.target.value }; setCredits(n); setDirty(true); }} /></label>
                  <label className="field">Name<input className="input" value={c.name} maxLength={80} placeholder="Rana Saleh"
                    onChange={(e) => { const n = [...credits]; n[i] = { ...c, name: e.target.value }; setCredits(n); setDirty(true); }} /></label>
                  <button type="button" className="btn btn-outline icon-btn" aria-label={`Remove credit ${i + 1}`} onClick={() => { setCredits(credits.filter((_, k) => k !== i)); setDirty(true); }}>×</button>
                </div>
              ))}
              {credits.length < 20 && (
                <button type="button" className="btn btn-sm btn-outline" style={{ alignSelf: 'flex-start', borderStyle: 'dashed' }}
                  onClick={() => { setCredits([...credits, { role: '', name: '', sort: credits.length }]); setDirty(true); }}>+ Add a credit</button>
              )}
            </fieldset>
          </div>

          <aside className="split-side" style={{ position: 'sticky', top: 88 }}>
            <div className="side-card">
              <h2>Status</h2>
              <span className={`pill ${status === 'published' ? 'pill-live' : status === 'hidden' ? 'pill-hidden' : 'pill-draft'}`} style={{ alignSelf: 'flex-start' }}>
                {status === 'published' ? 'Published' : status === 'hidden' ? 'Hidden by moderator' : 'Draft'}
              </span>
              <p className="small muted">{status === 'published' ? 'Saving updates the live page straight away.' : 'Drafts are only visible to you.'}</p>
            </div>
            <div className="side-card">
              <h2>Tips</h2>
              <ul className="small muted" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Lead with the work as people saw it: the ad, the page, the email.</li>
                <li>Put your strongest number first. It shows on your profile cards.</li>
                <li>Say what you did, not just what the team did.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <div className="sticky-bar">
        <div className="wrap">
          <span className="small" aria-live="polite">
            {error ? <span className="err">{error}</span> : uploading ? 'Uploading image…' : dirty ? 'Unsaved changes' : <span className="muted">All changes saved</span>}
          </span>
          <div className="row gap-8">
            {status === 'published' ? (
              <>
                <button type="button" className="btn btn-outline" disabled={saving || Boolean(uploading)} onClick={() => save('draft')}>Unpublish</button>
                <button type="button" className="btn btn-primary" disabled={saving || Boolean(uploading)} onClick={() => save('published')}>{saving ? 'Saving…' : 'Save changes'}</button>
              </>
            ) : (
              <>
                <button type="submit" className="btn btn-outline" disabled={saving || Boolean(uploading)}>{saving ? 'Saving…' : 'Save draft'}</button>
                <button type="button" className="btn btn-primary" disabled={saving || Boolean(uploading) || needsUsername || status === 'hidden'} onClick={() => save('published')}>Publish</button>
              </>
            )}
          </div>
        </div>
      </div>
      {toast.node}
    </form>
  );
}
