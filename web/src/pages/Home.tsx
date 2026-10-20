import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReserveUsername from '../components/ReserveUsername';
import { Loader, WorkCard } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Category, WorkCard as WorkCardData } from '../lib/types';
import { useTitle } from '../lib/util';

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setLeaving(true);
      swap = setTimeout(() => { setI((n) => (n + 1) % words.length); setLeaving(false); }, 320);
    }, 2400);
    return () => { clearInterval(tick); clearTimeout(swap); };
  }, [words.length]);
  return <span className={`rotating-word${leaving ? ' is-leaving' : ''}`}>{words[i]}</span>;
}

function HeroPhoto() {
  return (
    <div className="hero-photo">
      <img src="/hero-photo.jpg" alt="A marketer smiling in a bright office" width={1600} height={1066} />
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
            <h1 className="display h-xl">
              <span className="sr-only">The marketing portfolio that gives you visibility, trust and work.</span>
              <span aria-hidden="true">The marketing portfolio <span className="grey">that gives you</span> <RotatingWord words={['visibility', 'trust', 'work']} />.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 560 }}>
              Show your campaigns and the results behind them on one link you own. Free for marketers.
            </p>
            <div style={{ maxWidth: 560 }}><ReserveUsername /></div>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}><HeroPhoto /></div>
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
