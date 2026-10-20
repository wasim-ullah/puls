import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader } from '../components/ui';
import { loadJobs, postedAgo, type Job } from '../lib/jobs';
import { useTitle } from '../lib/util';
import { JobLogo } from './Jobs';

export default function JobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  useTitle(job ? `${job.title} at ${job.company}` : 'Job');

  useEffect(() => {
    loadJobs().then((f) => setJob(f.jobs.find((j) => j.id === id) ?? null)).catch(() => setFailed(true));
  }, [id]);

  if (failed) {
    return <section className="wrap" style={{ padding: '64px 0 96px' }}><div className="notice">This job couldn't be loaded right now. Please try again in a few minutes.</div></section>;
  }
  if (job === undefined) return <Loader />;
  if (job === null) {
    return (
      <section className="wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div className="stack gap-16" style={{ maxWidth: 560 }}>
          <h1 className="display" style={{ fontSize: 40 }}>This job is no longer listed</h1>
          <p className="muted">It may have been filled or taken down by the employer.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>See current jobs</Link>
        </div>
      </section>
    );
  }

  const facts: [string, string][] = ([
    ['Location', job.location],
    ['Job type', job.type ? job.type.replace(/\b\w/g, (c) => c.toUpperCase()) : ''],
    ['Salary', job.salary],
    ['Posted', postedAgo(job.posted)],
  ] as [string, string][]).filter(([, v]) => v);

  return (
    <article className="wrap" style={{ paddingTop: 40, paddingBottom: 96 }}>
      <div className="job-page">
        <Link to="/jobs" className="eyebrow">← All jobs</Link>

        <header className="row gap-16" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <JobLogo job={job} size={64} />
          <div style={{ minWidth: 0 }}>
            <h1 className="display" style={{ fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.05 }}>{job.title}</h1>
            <div className="muted" style={{ marginTop: 6, fontSize: 16 }}>{job.company}</div>
          </div>
        </header>

        <dl className="job-facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>

        {job.description
          ? <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }} />
          : <p className="muted">{job.excerpt || 'The employer did not add a description.'}</p>}

        <footer className="job-apply">
          <a className="btn btn-primary btn-lg" href={job.url} target="_blank" rel="noopener nofollow">Apply on {job.source} ↗</a>
          <p className="small muted">
            You'll apply on {job.source}, where this job was first posted. Listed on Laud via{' '}
            <a href={job.sourceUrl} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>{job.source}</a>.
            Laud doesn't screen listings, so check the employer before you share personal details.
          </p>
        </footer>
      </div>
    </article>
  );
}
