import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../components/ui';
import { loadJobs, postedAgo, type Job, type JobFeed } from '../lib/jobs';
import { initials, useTitle } from '../lib/util';

export function JobLogo({ job, size = 52 }: { job: Job; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="job-logo" style={{ width: size, height: size }}>
      {job.logo && !broken ? <img src={job.logo} alt="" loading="lazy" onError={() => setBroken(true)} /> : initials(job.company)}
    </span>
  );
}

export default function Jobs() {
  useTitle('Remote marketing jobs');
  const [feed, setFeed] = useState<JobFeed | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  useEffect(() => { loadJobs().then(setFeed).catch(() => setFailed(true)); }, []);

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
              Fresh remote roles in marketing, updated through the day. Open a job to read the full description.
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
              <Link key={j.id} to={`/jobs/${j.id}`} className="job-row">
                <JobLogo job={j} />
                <div className="stack gap-4" style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <h2 className="job-title">{j.title}</h2>
                  <div className="small muted">{[j.company, j.location, j.type].filter(Boolean).join(' · ')}</div>
                  {j.salary && <div className="small" style={{ fontWeight: 600 }}>{j.salary}</div>}
                  {j.excerpt && <p className="small muted job-excerpt">{j.excerpt}</p>}
                </div>
                <div className="stack gap-4 job-side">
                  <span className="small muted">{[postedAgo(j.posted), `via ${j.source}`].filter(Boolean).join(' · ')}</span>
                  <span className="job-more">View job →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
