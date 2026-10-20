import { useEffect, useMemo, useState } from 'react';
import { Loader } from '../components/ui';
import { initials, useTitle } from '../lib/util';

interface Job {
  id: string; title: string; company: string; logo: string; location: string; type: string;
  salary: string; posted: string | null; excerpt: string; url: string; source: string; sourceUrl: string;
}
interface Feed { updated: string; sources: { name: string; url: string; ok: boolean }[]; jobs: Job[] }

function ago(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return '';
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function Logo({ job }: { job: Job }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="job-logo">
      {job.logo && !broken ? <img src={job.logo} alt="" loading="lazy" onError={() => setBroken(true)} /> : initials(job.company)}
    </span>
  );
}

export default function Jobs() {
  useTitle('Remote marketing jobs');
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Feed) => setFeed(d))
      .catch(() => setFailed(true));
  }, []);

  const types = useMemo(() => [...new Set((feed?.jobs ?? []).map((j) => j.type.toLowerCase()).filter(Boolean))].sort(), [feed]);
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (feed?.jobs ?? []).filter((j) =>
      (!type || j.type.toLowerCase() === type) &&
      (!term || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(term)));
  }, [feed, q, type]);

  return (
    <section className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <div className="stack gap-24">
        <div className="section-head" style={{ marginBottom: 0, alignItems: 'flex-end' }}>
          <div className="stack gap-12" style={{ flex: '1 1 520px' }}>
            <span className="eyebrow">Jobs</span>
            <h1 className="display" style={{ fontSize: 'clamp(38px, 4.6vw, 64px)' }}>Remote marketing jobs</h1>
            <p className="muted" style={{ fontSize: 16, maxWidth: 560 }}>
              Fresh remote roles in marketing, updated through the day. Apply on the original job board.
            </p>
          </div>
          <p className="small muted" style={{ flex: '0 1 320px' }}>
            Jobs from <a href="https://remotive.com" target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>Remotive</a> and{' '}
            <a href="https://himalayas.app" target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>Himalayas</a>.
            Laud doesn't screen these listings, so check each one before you apply.
          </p>
        </div>

        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          <input className="input" style={{ flex: '1 1 280px', maxWidth: 420, borderRadius: 999 }} type="search" placeholder="Search title, company or location"
            value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
          <select className="select" style={{ flex: '0 1 220px', borderRadius: 999 }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Job type">
            <option value="">All job types</option>
            {types.map((t) => <option key={t} value={t}>{t.replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </select>
        </div>

        {failed ? (
          <div className="notice">Jobs couldn't be loaded right now. Please try again in a few minutes.</div>
        ) : !feed ? <Loader /> : shown.length === 0 ? (
          <p className="muted">No jobs match that search.</p>
        ) : (
          <div className="job-list">
            {shown.map((j) => (
              <article key={j.id} className="job-row">
                <Logo job={j} />
                <div className="stack gap-4" style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <h2 className="job-title">{j.title}</h2>
                  <div className="small muted">{[j.company, j.location, j.type].filter(Boolean).join(' · ')}</div>
                  {j.salary && <div className="small" style={{ fontWeight: 600 }}>{j.salary}</div>}
                  {j.excerpt && <p className="small muted job-excerpt">{j.excerpt}</p>}
                </div>
                <div className="stack gap-8 job-side">
                  <a className="btn btn-primary btn-sm" href={j.url} target="_blank" rel="noopener nofollow">Apply on {j.source} ↗</a>
                  <span className="small muted">{ago(j.posted)}{ago(j.posted) ? ' · ' : ''}via <a href={j.sourceUrl} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>{j.source}</a></span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
