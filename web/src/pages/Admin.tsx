import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Loader, VerifiedTick, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/media';
import { supabase } from '../lib/supabase';
import type { Profile, WorkCard } from '../lib/types';
import { errorMessage, useTitle } from '../lib/util';
import NotFound from './NotFound';

type Tab = 'profiles' | 'work';

export default function Admin() {
  useTitle('Admin');
  const { profile, loading } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('profiles');
  const [q, setQ] = useState('');
  const [people, setPeople] = useState<Profile[] | null>(null);
  const [work, setWork] = useState<WorkCard[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    const term = q.trim().replace(/[%,()]/g, '');
    if (tab === 'profiles') {
      let req = supabase.from('profiles').select('*').not('username', 'is', null).order('created_at', { ascending: false }).limit(100);
      if (term) req = req.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`);
      void req.then(({ data, error: e }) => { if (e) setError(e.message); setPeople((data as Profile[] | null) ?? []); });
    } else {
      let req = supabase.from('work_cards').select('*').in('status', ['published', 'hidden']).order('updated_at', { ascending: false }).limit(100);
      if (term) req = req.or(`title.ilike.%${term}%,brand.ilike.%${term}%,username.ilike.%${term}%`);
      void req.then(({ data, error: e }) => { if (e) setError(e.message); setWork((data as WorkCard[] | null) ?? []); });
    }
  }, [isAdmin, tab, q]);

  if (loading) return <Loader />;
  if (!isAdmin) return <NotFound />;

  async function setVerified(p: Profile, value: boolean) {
    setBusy(p.id); setError(null);
    const { error: e } = await supabase.rpc('admin_set_verified', { p_profile: p.id, p_value: value });
    setBusy(null);
    if (e) { setError(errorMessage(e)); return; }
    setPeople((list) => list?.map((x) => (x.id === p.id ? { ...x, is_verified: value } : x)) ?? null);
    toast.show(value ? `@${p.username} is verified` : `Removed verification from @${p.username}`);
  }

  async function setHidden(w: WorkCard, hide: boolean) {
    setBusy(w.id); setError(null);
    const { error: e } = await supabase.from('works').update({ status: hide ? 'hidden' : 'published' }).eq('id', w.id);
    setBusy(null);
    if (e) { setError(errorMessage(e)); return; }
    setWork((list) => list?.map((x) => (x.id === w.id ? { ...x, status: hide ? 'hidden' : 'published' } : x)) ?? null);
    toast.show(hide ? 'Work hidden' : 'Work restored');
  }

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div className="stack gap-24">
        <div className="stack gap-8">
          <span className="eyebrow">Admin</span>
          <h1 className="display" style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}>Moderation</h1>
          <p className="muted">Verify people you have checked, and hide work that breaks the rules. Sample profiles can't be verified.</p>
        </div>

        <div className="row gap-8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className={`btn btn-sm ${tab === 'profiles' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('profiles')}>Profiles</button>
          <button type="button" className={`btn btn-sm ${tab === 'work' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('work')}>Work</button>
          <input className="input" style={{ maxWidth: 320, marginLeft: 'auto' }} placeholder={tab === 'profiles' ? 'Search name or username' : 'Search title, brand or username'}
            value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        </div>

        {error && <div className="notice notice-err" role="alert">{error}</div>}

        {tab === 'profiles' && (people === null ? <Loader /> : (
          <div className="stack" style={{ gap: 0, borderTop: '1px solid var(--line)' }}>
            {people.length === 0 && <p className="muted" style={{ padding: 16 }}>No profiles found.</p>}
            {people.map((p) => (
              <div key={p.id} className="row gap-16" style={{ padding: '14px 0', borderBottom: '1px solid var(--line)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar url={p.avatar_url} name={p.display_name || p.username || '?'} size={40} />
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <Link to={`/@${p.username}`} style={{ fontWeight: 600 }}>{p.display_name || `@${p.username}`}</Link>
                  {p.is_verified && <> <VerifiedTick size={15} /></>}
                  <div className="small muted">@{p.username}{p.headline ? ` · ${p.headline}` : ''}</div>
                </div>
                <div className="row gap-8" style={{ alignItems: 'center' }}>
                  {p.is_sample && <span className="pill pill-draft">Sample</span>}
                  {p.role === 'admin' && <span className="pill pill-line">Admin</span>}
                  {p.is_sample ? null : p.is_verified ? (
                    <button type="button" className="btn btn-sm btn-ghost" disabled={busy === p.id} onClick={() => void setVerified(p, false)}>Remove tick</button>
                  ) : (
                    <button type="button" className="btn btn-sm btn-outline" disabled={busy === p.id} onClick={() => void setVerified(p, true)}>Verify</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {tab === 'work' && (work === null ? <Loader /> : (
          <div className="stack" style={{ gap: 0, borderTop: '1px solid var(--line)' }}>
            {work.length === 0 && <p className="muted" style={{ padding: 16 }}>No work found.</p>}
            {work.map((w) => (
              <div key={w.id} className="row gap-16" style={{ padding: '14px 0', borderBottom: '1px solid var(--line)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="mini" style={{ width: 96, aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden', background: '#E6E6E1', flex: 'none' }}>
                  {w.cover_path && <img src={publicUrl('work-media', w.cover_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <Link to={`/@${w.username}/${w.slug}`} style={{ fontWeight: 600 }}>{w.title}</Link>
                  <div className="small muted">@{w.username}{w.brand ? ` · ${w.brand}` : ''}</div>
                </div>
                <div className="row gap-8" style={{ alignItems: 'center' }}>
                  <span className={`pill ${w.status === 'hidden' ? 'pill-hidden' : 'pill-live'}`}>{w.status === 'hidden' ? 'Hidden' : 'Live'}</span>
                  {w.status === 'hidden' ? (
                    <button type="button" className="btn btn-sm btn-outline" disabled={busy === w.id} onClick={() => void setHidden(w, false)}>Restore</button>
                  ) : (
                    <button type="button" className="btn btn-sm btn-ghost" disabled={busy === w.id} onClick={() => void setHidden(w, true)}>Hide</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {toast.node}
    </section>
  );
}
