import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { isConfigured } from '../lib/supabase';
import { Avatar, Logo } from './ui';

function AccountMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const name = profile?.display_name || profile?.username || 'You';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="btn btn-outline" style={{ paddingLeft: 6 }} aria-expanded={open}
        aria-haspopup="menu" onClick={() => setOpen(!open)}>
        <Avatar url={profile?.avatar_url} name={name} size={32} />
        <span className="small">{profile?.username ? `@${profile.username}` : 'Account'}</span>
      </button>
      {open && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: 52, minWidth: 220, background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 8, boxShadow: '0 16px 40px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column' }}>
          {profile?.username && <Link role="menuitem" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} to={`/@${profile.username}`}>View my profile</Link>}
          <Link role="menuitem" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} to="/dashboard">My work</Link>
          <Link role="menuitem" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} to="/settings">Profile settings</Link>
          <button role="menuitem" type="button" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}
            onClick={async () => { await signOut(); navigate('/'); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { session } = useAuth();
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="header-left">
            <Logo />
            <nav aria-label="Main">
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/how-it-works">How it works</NavLink>
            </nav>
          </div>
          <div className="header-right">
            {session ? (
              <>
                <Link to="/new" className="btn btn-primary">Add work</Link>
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
                <Link to="/login?mode=signup" className="btn btn-primary">Claim your username</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {!isConfigured && (
        <div className="wrap" style={{ paddingTop: 16 }}>
          <div className="notice notice-warn">
            <b>Setup needed:</b> this build has no Supabase connection. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your hosting environment variables (or a local <code>.env</code> file), then redeploy.
          </div>
        </div>
      )}
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="col">
            <Logo />
            <span className="small muted">Portfolios for marketers, with the results behind the work.</span>
          </div>
          <div className="col"><span className="col-title">Puls</span><Link to="/explore">Explore work</Link><Link to="/how-it-works">How it works</Link><Link to="/login?mode=signup">Claim a username</Link></div>
          <div className="col"><span className="col-title">Your profile</span><Link to="/new">Add work</Link><Link to="/dashboard">My work</Link><Link to="/settings">Settings</Link></div>
          <div className="col"><span className="col-title">Coming next</span><span>Verified results</span><span>Jury scores</span><span>Daily awards</span></div>
        </div>
        <div className="wrap footer-base"><span>© {new Date().getFullYear()} Puls · Dubai</span><span>Results shown are reported by their owners.</span></div>
      </footer>
    </>
  );
}
