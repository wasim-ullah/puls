import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import ReserveUsername from '../components/ReserveUsername';
import { useAuth } from '../lib/auth';
import { GOOGLE_ENABLED, SITE_URL, supabase } from '../lib/supabase';
import { errorMessage, useTitle } from '../lib/util';

function safeNext(n: string | null): string {
  return n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard';
}

export default function Login() {
  const [params] = useSearchParams();
  const signup = params.get('mode') === 'signup';
  const next = safeNext(params.get('next'));
  useTitle(signup ? 'Claim your username' : 'Log in');
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setError(null); }, [email]);

  if (!loading && session) return <Navigate to={next} replace />;

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${SITE_URL}${next}` },
    });
    setBusy(false);
    if (err) setError(errorMessage(err)); else setSent(true);
  }

  async function google() {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}${next}` },
    });
    if (err) setError(errorMessage(err));
  }

  return (
    <section className="wrap" style={{ paddingTop: 72, paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }} className="stack gap-24">
        <div className="stack gap-12">
          <h1 className="display" style={{ fontSize: 'clamp(40px, 5vw, 60px)' }}>{signup ? 'Claim your username' : 'Welcome back'}</h1>
          <p className="muted" style={{ fontSize: 16 }}>
            {signup
              ? 'Pick the link you want to share, then confirm your email. No password needed.'
              : 'Enter your email and we’ll send you a link to log in. No password needed.'}
          </p>
        </div>

        {signup ? <ReserveUsername autoFocus /> : sent ? (
          <div className="panel" style={{ gap: 8 }}>
            <b style={{ fontSize: 18 }}>Check your inbox</b>
            <span className="muted">We sent a log-in link to <b style={{ color: 'var(--ink)' }}>{email}</b>. It expires in an hour.</span>
            <button type="button" className="btn btn-sm btn-outline" style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={() => setSent(false)}>Use a different email</button>
          </div>
        ) : (
          <form className="panel" onSubmit={sendLink}>
            <label className="field">Email
              <input className="input" type="email" required autoComplete="email" autoFocus value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </label>
            {error && <span className="small err" role="alert">{error}</span>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Email me a log-in link'}</button>
            {GOOGLE_ENABLED && (
              <>
                <div className="row gap-12 small muted" style={{ alignItems: 'center' }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />or<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
                <button type="button" className="btn btn-outline btn-lg" onClick={google}>Continue with Google</button>
              </>
            )}
          </form>
        )}

        <p className="small muted">
          {signup ? <>Already have an account? <Link to="/login" style={{ textDecoration: 'underline' }}>Log in</Link></>
                  : <>New to Laud? <Link to="/login?mode=signup" style={{ textDecoration: 'underline' }}>Claim a username</Link></>}
        </p>
      </div>
    </section>
  );
}
