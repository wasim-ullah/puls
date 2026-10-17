import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { SITE_HOST, SITE_URL, supabase } from '../lib/supabase';
import { errorMessage, useUsernameStatus } from '../lib/util';
import { CheckIcon } from './ui';

const STATUS_TEXT: Record<string, string> = {
  checking: 'Checking…',
  available: 'is available',
  taken: 'is already taken',
  reserved: 'is reserved. Try another one.',
  invalid: 'Use 3–30 letters, numbers or underscores.',
  yours: 'is already yours',
};

/** Homepage box: pick a username → enter email → magic link. The username is claimed on sign-up. */
export default function ReserveUsername({ dark = false, autoFocus = false }: { dark?: boolean; autoFocus?: boolean }) {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'name' | 'email' | 'sent'>('name');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { name, status } = useUsernameStatus(raw, profile?.username);

  const muted = dark ? '#A3A39C' : 'var(--muted)';
  const good = dark ? '#7FD3A4' : 'var(--good)';
  const bad = dark ? '#FF9B8A' : 'var(--bad)';

  async function onName(e: FormEvent) {
    e.preventDefault();
    if (status !== 'available') return;
    if (session) {
      // Already signed in: go straight to settings with the name pre-filled.
      navigate(`/settings?username=${encodeURIComponent(name)}`);
      return;
    }
    setStep('email');
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      try { localStorage.setItem('laud:wanted-username', name); } catch { /* private mode */ }
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { data: { username: name }, emailRedirectTo: `${SITE_URL}/dashboard?welcome=1` },
      });
      if (err) throw err;
      setStep('sent');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (step === 'sent') {
    return (
      <div className={`reserve ${dark ? 'reserve-dark' : ''}`} style={{ padding: 24, flexDirection: 'column', gap: 6 }}>
        <b style={{ fontSize: 18 }}>Check your inbox</b>
        <span style={{ color: muted }}>
          We sent a sign-in link to <b style={{ color: dark ? '#fff' : 'var(--ink)' }}>{email}</b>. Open it on this device to claim <span className="mono">{SITE_HOST}/@{name}</span>.
        </span>
      </div>
    );
  }

  return (
    <div>
      {step === 'name' ? (
        <form className={`reserve ${dark ? 'reserve-dark' : ''}`} onSubmit={onName}>
          <label className="input-prefix">
            <span>{SITE_HOST}/@</span>
            <input value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="yourname" autoComplete="off"
              autoCapitalize="none" spellCheck={false} maxLength={31} aria-label="Choose a username" autoFocus={autoFocus} />
          </label>
          <button type="submit" className={`btn btn-lg ${dark ? 'btn-light' : 'btn-primary'}`} disabled={status !== 'available'}>
            Claim it
          </button>
        </form>
      ) : (
        <form className={`reserve ${dark ? 'reserve-dark' : ''}`} onSubmit={onEmail}>
          <label className="input-prefix">
            <span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              autoComplete="email" aria-label="Your email" autoFocus style={{ fontFamily: 'var(--sans)' }} />
          </label>
          <button type="submit" className={`btn btn-lg ${dark ? 'btn-light' : 'btn-primary'}`} disabled={busy}>
            {busy ? 'Sending…' : `Claim @${name}`}
          </button>
        </form>
      )}
      <div className="reserve-status" aria-live="polite">
        {error && <span style={{ color: bad }}>{error}</span>}
        {!error && step === 'email' && (
          <span style={{ color: muted }}>
            We'll email you a link to finish. No password needed.{' '}
            <button type="button" onClick={() => setStep('name')} style={{ background: 'none', border: 0, padding: 0, textDecoration: 'underline', color: 'inherit', cursor: 'pointer' }}>Change username</button>
          </span>
        )}
        {!error && step === 'name' && status && name && (
          <span style={{ color: status === 'available' || status === 'yours' ? good : status === 'checking' ? muted : bad, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            {status === 'available' && <CheckIcon />}
            {status === 'invalid' || status === 'checking' ? STATUS_TEXT[status] : <><span className="mono">@{name}</span> {STATUS_TEXT[status]}</>}
          </span>
        )}
        {!error && step === 'name' && !name && <span style={{ color: muted }}>Your public profile link, ready to share on LinkedIn and your CV.</span>}
      </div>
    </div>
  );
}
