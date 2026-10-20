import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReserveUsername from '../components/ReserveUsername';
import { Loader, WorkCard } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Category, WorkCard as WorkCardData } from '../lib/types';
import { useTitle } from '../lib/util';

function ProfilePreview() {
  // Illustration of what a profile looks like. Not live data.
  const tiles = [
    { bg: '#C7B596', fg: '#231A10', tag: 'PAID SOCIAL', line: 'Batch 07 drops in 20 minutes.' },
    { bg: '#F7FBFC', fg: '#0F2A36', tag: 'LANDING PAGE', line: 'The hotter it gets, the less you pay.' },
    { bg: '#E2683A', fg: '#FFFFFF', tag: 'EMAIL & CRM', line: 'Your rate is better this week.' },
  ];
  return (
    <div className="hero-preview" aria-hidden="true">
      <span className="url">laud.pro/@marcus</span>
      <div className="row gap-12" style={{ alignItems: 'center' }}>
        <span className="avatar" style={{ width: 52, height: 52, background: '#3A3935' }}><img src="/preview-avatar.jpg" alt="" width={52} height={52} /></span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em' }}>Marcus Bello</div>
          <div style={{ fontSize: 13, color: '#A3A39C' }}>Performance marketer · Riyadh</div>
        </div>
      </div>
      <div className="row gap-24" style={{ borderTop: '1px solid #2E2D2A', paddingTop: 14 }}>
        {[['WORK', '9'], ['BRANDS', '6'], ['TOP RESULT', '−52% CPL']].map(([k, v]) => (
          <div key={k}><div className="mono" style={{ fontSize: 10, color: '#9A9A93' }}>{k}</div><div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em' }}>{v}</div></div>
        ))}
      </div>
      <div className="preview-tiles">
        {tiles.map((t) => (
          <div key={t.tag} style={{ background: t.bg, color: t.fg }}><small>{t.tag}</small>{t.line}</div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  useTitle('');
  const [works, setWorks] = useState<WorkCardData[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('work_cards').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(9)
      .then(({ data }) => setWorks((data as WorkCardData[] | null) ?? []));
    supabase.from('categories').select('*').order('sort').then(({ data }) => setCats((data as Category[] | null) ?? []));
  }, []);

  return (
    <>
      <section className="wrap" style={{ paddingTop: 64, paddingBottom: 72 }}>
        <div className="split" style={{ gap: 56, alignItems: 'stretch' }}>
          <div className="split-main stack gap-24" style={{ justifyContent: 'center' }}>
            <span className="pill pill-line" style={{ alignSelf: 'flex-start' }}><span className="dot" />Early access · usernames open</span>
            <h1 className="display h-xl">Your marketing work, and <span className="grey">what it actually</span> achieved.</h1>
            <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 560 }}>
              A portfolio built for marketers. Show campaigns with the numbers behind them, all on one link you own.
            </p>
            <div style={{ maxWidth: 560 }}><ReserveUsername /></div>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}><ProfilePreview /></div>
        </div>
      </section>

      <section className="band-white">
        <div className="wrap section">
          <div className="section-head">
            <h2 className="h-lg" style={{ flex: '1 1 520px' }}>Three steps to a portfolio that speaks in numbers.</h2>
            <p className="muted" style={{ flex: '0 1 380px', fontSize: 16 }}>No templates to fight with. Add your work, and your profile lays itself out.</p>
          </div>
          <div className="steps">
            {[
              ['01', 'Claim your username', 'Get a short link like laud.pro/@yourname to use on LinkedIn, your CV and your email signature.'],
              ['02', 'Add your work', 'Upload the creative, write the brief, insight and idea, and add the results that moved.'],
              ['03', 'Share one link', 'Recruiters and clients see your best work and your numbers in one place.'],
            ].map(([n, h, p]) => (
              <div key={n}>
                <span className="mono small muted">{n}</span>
                <h3 className="h-sm">{h}</h3>
                <p className="muted small" style={{ fontSize: 14 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="confidential-band">
          <div className="stack gap-16" style={{ flex: '1 1 460px' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Confidential clients</span>
            <h2 className="h-lg">Show the results. Keep the client's name private.</h2>
            <p className="muted" style={{ fontSize: 16, maxWidth: 520 }}>
              Your best numbers often belong to clients under NDA. Mark a piece of work as confidential, describe the client in your own words, and Laud never publishes the name.
            </p>
          </div>
          <div className="confidential-card" aria-hidden="true">
            <span className="mono small" style={{ opacity: 0.7 }}>CLIENT</span>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>A GCC telecom brand</div>
            <span className="small" style={{ opacity: 0.7 }}>Name kept confidential</span>
            <div className="row gap-24" style={{ marginTop: 18 }}>
              <div><div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--accent)' }}>−38%</div><span className="small" style={{ opacity: 0.7 }}>Cost per sale</span></div>
              <div><div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.05em' }}>2.4x</div><span className="small" style={{ opacity: 0.7 }}>Return on ad spend</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head" style={{ alignItems: 'flex-end' }}>
          <div>
            <h2 className="h-md">Latest work</h2>
            <p className="muted small" style={{ marginTop: 4 }}>Fresh from marketers on Laud</p>
          </div>
          <Link to="/explore" className="btn btn-outline-ink">Explore all work</Link>
        </div>
        {works === null ? <Loader /> : works.length === 0 ? (
          <div className="empty">
            <b style={{ fontSize: 20 }}>Be the first to publish</b>
            <span className="muted">The gallery fills up as marketers add their work.</span>
            <Link to="/new" className="btn btn-primary">Add your first piece</Link>
          </div>
        ) : (
          <div className="grid-cards">{works.map((w) => <WorkCard key={w.id} w={w} />)}</div>
        )}
        {cats.length > 0 && (
          <div className="row gap-8" style={{ marginTop: 56 }}>
            <span className="eyebrow" style={{ marginRight: 8 }}>Browse by</span>
            {cats.map((c) => <Link key={c.id} to={`/explore?category=${c.slug}`} className="chip">{c.name}</Link>)}
          </div>
        )}
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="cta-dark">
          <div className="stack gap-16" style={{ flex: '1 1 460px' }}>
            <h2 className="h-lg">Usernames are first come, first served.</h2>
            <p style={{ color: '#B5B5AE', fontSize: 16, maxWidth: 520 }}>
              Claim yours now. Verified results, jury scores and daily awards are coming next, and early profiles will be first in line.
            </p>
          </div>
          <div style={{ flex: '1 1 420px' }}><ReserveUsername dark /></div>
        </div>
      </section>
    </>
  );
}
