// GET /api/jobs: remote marketing jobs from Remotive and Himalayas, normalised into one list.
// Runs as a Vercel serverless function. The CDN caches the response for 6 hours, so each
// source is called about four times a day, as both sources ask.
//
// Source terms we follow:
// - Remotive: link back to the Remotive job URL and name Remotive as the source.
// - Himalayas: name Himalayas with a visible link, send every Apply to the applicationLink
//   from the API, cache, and drop expired jobs.
// - Neither: jobs are shown openly, never behind a sign-up, and are not passed on to other boards.

import { createHash } from 'node:crypto';

const REMOTIVE = 'https://remotive.com/api/remote-jobs?category=marketing&limit=60';
const HIMALAYAS = 'https://himalayas.app/jobs/api/search?q=marketing&sort=recent';

const strip = (html = '') =>
  String(html).replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const ALLOWED = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);
const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * Turns a third-party job description into safe, simple HTML.
 * Only a short list of formatting tags survives, every attribute is dropped, links become
 * plain text, and anything else that looks like markup is escaped, so nothing can run.
 */
export function cleanHtml(html = '') {
  const kept = [];
  let s = String(html)
    .replace(/\u0000/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|template|noscript|form)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g, (tag, name) => {
      const n = name.toLowerCase();
      if (!ALLOWED.has(n)) return n === 'div' || n === 'section' ? ' ' : '';
      const close = tag.startsWith('</');
      const out = HEADINGS.has(n) ? (close ? '</h3>' : '<h3>') : n === 'br' ? '<br>' : `<${close ? '/' : ''}${n === 'b' ? 'strong' : n === 'i' ? 'em' : n}>`;
      kept.push(out);
      return `\u0000${kept.length - 1}\u0000`;
    });
  s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)]);
  s = s.replace(/(<p>\s*(&nbsp;|\s)*<\/p>\s*)+/g, '').trim();
  return s.length > 40000 ? s.slice(0, 40000) : s;
}

const shortId = (s) => createHash('sha1').update(String(s)).digest('hex').slice(0, 12);
const httpsOnly = (u) => (typeof u === 'string' && /^https:\/\//i.test(u) ? u : '');

async function getJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'Laud jobs (laud.pro)' } });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}

export function fromRemotive(data) {
  return (data?.jobs ?? []).map((j) => ({
    id: `r${String(j.id).replace(/\D/g, '') || shortId(j.url)}`,
    title: strip(j.title),
    company: strip(j.company_name),
    logo: httpsOnly(j.company_logo),
    location: strip(j.candidate_required_location) || 'Anywhere',
    type: strip(j.job_type).replace(/_/g, ' '),
    salary: strip(j.salary),
    posted: j.publication_date || null,
    excerpt: clip(strip(j.description), 220),
    description: cleanHtml(j.description),
    url: httpsOnly(j.url),
    source: 'Remotive',
    sourceUrl: 'https://remotive.com',
  })).filter((j) => j.title && j.url);
}

export function fromHimalayas(data, now = Date.now()) {
  const list = Array.isArray(data) ? data : (data?.jobs ?? []);
  return list
    .filter((j) => !j.expiryDate || new Date(typeof j.expiryDate === 'number' ? j.expiryDate * 1000 : j.expiryDate).getTime() > now)
    .map((j) => {
      const loc = Array.isArray(j.locationRestrictions) && j.locationRestrictions.length ? j.locationRestrictions.join(', ') : 'Worldwide';
      const pay = j.minSalary && j.maxSalary ? `${j.currency || ''} ${Number(j.minSalary).toLocaleString('en')}–${Number(j.maxSalary).toLocaleString('en')}${j.salaryPeriod ? ` / ${j.salaryPeriod}` : ''}`.trim() : '';
      return {
        id: `h${shortId(j.guid || j.applicationLink)}`,
        title: strip(j.title),
        company: strip(j.companyName),
        logo: httpsOnly(j.companyLogo),
        location: loc,
        type: strip(j.employmentType),
        salary: pay,
        posted: j.pubDate ? new Date(typeof j.pubDate === 'number' ? j.pubDate * 1000 : j.pubDate).toISOString() : null,
        excerpt: clip(strip(j.excerpt || j.description), 220),
        description: cleanHtml(j.description || j.excerpt),
        url: httpsOnly(j.applicationLink),
        source: 'Himalayas',
        sourceUrl: httpsOnly(j.guid) || 'https://himalayas.app',
      };
    })
    .filter((j) => j.title && j.url);
}

export function merge(lists) {
  const seen = new Set();
  return lists.flat()
    .filter((j) => {
      const key = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    })
    .sort((a, b) => (Date.parse(b.posted || 0) || 0) - (Date.parse(a.posted || 0) || 0))
    .slice(0, 120);
}

export default async function handler(req, res) {
  const results = await Promise.allSettled([getJson(REMOTIVE), getJson(HIMALAYAS)]);
  const lists = [
    results[0].status === 'fulfilled' ? fromRemotive(results[0].value) : [],
    results[1].status === 'fulfilled' ? fromHimalayas(results[1].value) : [],
  ];
  const jobs = merge(lists);
  const failed = results.filter((r) => r.status === 'rejected').length;
  // Cache good responses for 6 hours at the edge; retry sooner if a source failed.
  const maxAge = failed === 0 ? 21600 : 900;
  res.setHeader('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=86400`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(jobs.length ? 200 : 502).send(JSON.stringify({
    updated: new Date().toISOString(),
    sources: [
      { name: 'Remotive', url: 'https://remotive.com', ok: results[0].status === 'fulfilled' },
      { name: 'Himalayas', url: 'https://himalayas.app', ok: results[1].status === 'fulfilled' },
    ],
    jobs,
  }));
}
