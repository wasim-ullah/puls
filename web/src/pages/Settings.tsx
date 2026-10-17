import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, CheckIcon, Loader, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { removeFiles, uploadImage } from '../lib/media';
import { SITE_HOST, supabase } from '../lib/supabase';
import type { ProfileKind } from '../lib/types';
import { errorMessage, splitList, useTitle, useUsernameStatus } from '../lib/util';

const STATUS: Record<string, [string, string]> = {
  checking: ['Checking…', 'muted'],
  available: ['Available', 'ok'],
  yours: ['This is your current username', 'ok'],
  taken: ['Already taken', 'err'],
  reserved: ['Reserved. Try another one.', 'err'],
  invalid: ['Use 3–30 lowercase letters, numbers or underscores', 'err'],
};

function normaliseUrl(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default function Settings() {
  useTitle('Profile settings');
  const { profile, session, refreshProfile } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState('');
  const [kind, setKind] = useState<ProfileKind>('person');
  const [available, setAvailable] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile || loaded) return;
    let wanted = params.get('username') || '';
    if (!wanted && !profile.username) { try { wanted = localStorage.getItem('laud:wanted-username') || ''; } catch { /* ignore */ } }
    setUsername(profile.username || wanted);
    setDisplayName(profile.display_name);
    setHeadline(profile.headline);
    setLocation(profile.location);
    setBio(profile.bio);
    setWebsite(profile.website);
    setLinkedin(profile.linkedin);
    setSkills(profile.skills.join(', '));
    setKind(profile.kind);
    setAvailable(profile.available_for_work);
    setAvatar(profile.avatar_url);
    setLoaded(true);
  }, [profile, loaded, params]);

  const { name, status } = useUsernameStatus(username, profile?.username);

  if (!profile || !session) return <Loader />;
  const firstTime = !profile.username;
  const canSave = Boolean(name) && (status === 'available' || status === 'yours');

  async function onAvatar(file: File | undefined) {
    if (!file || !session) return;
    setUploading(true); setError(null);
    try {
      const path = await uploadImage(file, 'avatars', session.user.id, 600);
      const old = avatar;
      setAvatar(path);
      await supabase.from('profiles').update({ avatar_url: path }).eq('id', session.user.id).throwOnError();
      if (old) await removeFiles('avatars', [old]);
      await refreshProfile();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!canSave) { setError('Choose an available username first.'); return; }
    setBusy(true); setError(null);
    const skillList = splitList(skills).slice(0, 12).map((s) => s.slice(0, 40));
    const { error: err } = await supabase.from('profiles').update({
      username: name,
      display_name: displayName.trim().slice(0, 80),
      headline: headline.trim().slice(0, 160),
      location: location.trim().slice(0, 80),
      bio: bio.trim().slice(0, 1200),
      website: normaliseUrl(website).slice(0, 200),
      linkedin: normaliseUrl(linkedin).slice(0, 200),
      skills: skillList,
      kind,
      available_for_work: available,
    }).eq('id', profile!.id);
    setBusy(false);
    if (err) {
      setError(err.code === '23505' ? 'Someone just took that username. Try another one.' : errorMessage(err));
      return;
    }
    try { localStorage.removeItem('laud:wanted-username'); } catch { /* ignore */ }
    await refreshProfile();
    if (firstTime) navigate('/dashboard?welcome=1');
    else toast.show('Profile saved');
  }

  const [statusText, statusClass] = status ? STATUS[status] : ['', ''];

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 120 }}>
      <form onSubmit={onSave} style={{ maxWidth: 820 }} className="stack gap-24">
        <div className="stack gap-12">
          <h1 className="display" style={{ fontSize: 'clamp(38px, 4.6vw, 60px)' }}>{firstTime ? 'Set up your profile' : 'Profile settings'}</h1>
          {firstTime && <p className="muted" style={{ fontSize: 16 }}>Pick your username first. You can fill in the rest now or later.</p>}
          {!firstTime && <Link to={`/@${profile.username}`} className="small" style={{ fontWeight: 600 }}>View your public profile →</Link>}
        </div>

        <div className="panel">
          <div className="panel-head"><h2 className="h-sm">Username</h2><span className="eyebrow">Your public link</span></div>
          <label className="field">
            <span className="visually-hidden">Username</span>
            <span className="input-prefix">
              <span>{SITE_HOST}/@</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" autoCapitalize="none"
                spellCheck={false} maxLength={31} required aria-describedby="username-status" />
            </span>
          </label>
          <span id="username-status" className={`status-line ${statusClass}`} aria-live="polite">
            {(status === 'available' || status === 'yours') && <CheckIcon />}{statusText}
          </span>
          {!firstTime && profile.username && name !== profile.username && status === 'available' && (
            <div className="notice notice-warn small">Changing your username breaks links you've already shared to laud.pro/@{profile.username}.</div>
          )}
        </div>

        <div className="panel">
          <h2 className="h-sm">About you</h2>
          <div className="row gap-16">
            <Avatar url={avatar} name={displayName || name || '?'} size={88} />
            <div className="stack gap-8">
              <label className="btn btn-outline" style={{ position: 'relative', overflow: 'hidden' }}>
                {uploading ? 'Uploading…' : avatar ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading}
                  onChange={(e) => onAvatar(e.target.files?.[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </label>
              <span className="small muted">Square works best. JPG, PNG or WebP.</span>
            </div>
          </div>
          <div className="grid-2">
            <label className="field">Name<input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} placeholder="Aisha Rahman" /></label>
            <label className="field">This profile is for
              <select className="select" value={kind} onChange={(e) => setKind(e.target.value as ProfileKind)}>
                <option value="person">Me, as an individual</option>
                <option value="agency">An agency or studio</option>
                <option value="team">An in-house team</option>
              </select>
            </label>
            <label className="field full">Headline <span className="hint">One line under your name</span>
              <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={160} placeholder="Performance marketer for fintech and B2B SaaS" />
            </label>
            <label className="field">Location<input className="input" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="Dubai, UAE" /></label>
            <label className="field">Strongest in <span className="hint">Comma separated, up to 12</span>
              <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Google Ads, Meta Ads, CRO" />
            </label>
            <label className="field full">Bio
              <textarea className="textarea" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1200}
                placeholder="What you do, who you've done it for, and what you're looking for next." />
            </label>
            <label className="field">LinkedIn<input className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" /></label>
            <label className="field">Website<input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourname.com" /></label>
          </div>
          <label className="switch">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            Show “Available for work” on my profile
          </label>
        </div>

        {error && <div className="notice notice-err" role="alert">{error}</div>}
        <div className="row gap-12">
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy || !canSave}>{busy ? 'Saving…' : firstTime ? 'Save and continue' : 'Save changes'}</button>
          {!firstTime && <Link to="/dashboard" className="btn btn-outline btn-lg">Back to my work</Link>}
        </div>
      </form>
      {toast.node}
    </section>
  );
}
