export interface Job {
  id: string; title: string; company: string; logo: string; location: string; type: string;
  salary: string; posted: string | null; excerpt: string; description: string;
  url: string; source: string; sourceUrl: string;
}
export interface JobFeed { updated: string; sources: { name: string; url: string; ok: boolean }[]; jobs: Job[] }

let pending: Promise<JobFeed> | null = null;

/** Loads the jobs feed once per visit; the list and each job page share it. */
export function loadJobs(): Promise<JobFeed> {
  if (!pending) {
    pending = fetch('/api/jobs')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .catch((e) => { pending = null; throw e; });
  }
  return pending;
}

export function postedAgo(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return '';
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}
