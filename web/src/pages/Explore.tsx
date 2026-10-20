import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader, WorkCard } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Category, WorkCard as WorkCardData } from '../lib/types';
import { useDebounced, useTitle } from '../lib/util';

const PAGE = 24;

export default function Explore() {
  useTitle('Explore work');
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const [q, setQ] = useState(params.get('q') || '');
  const query = useDebounced(q.trim(), 350);
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<WorkCardData[] | null>(null);
  const [more, setMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort').then(({ data }) => setCats((data as Category[] | null) ?? []));
  }, []);

  function build(from: number) {
    let req = supabase.from('work_cards').select('*').eq('status', 'published')
      .order('published_at', { ascending: false }).range(from, from + PAGE - 1);
    if (category) req = req.eq('category_slug', category);
    if (query) {
      // Strip characters that have meaning in PostgREST filter syntax.
      const safe = query.replace(/[%,()*\\]/g, ' ').slice(0, 60);
      req = req.or(`title.ilike.%${safe}%,brand.ilike.%${safe}%,client_descriptor.ilike.%${safe}%,agency.ilike.%${safe}%`);
    }
    return req;
  }

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    build(0).then(({ data }) => {
      if (cancelled) return;
      const rows = (data as WorkCardData[] | null) ?? [];
      setItems(rows);
      setMore(rows.length === PAGE);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query]);

  async function loadMore() {
    if (!items) return;
    setLoadingMore(true);
    const { data } = await build(items.length);
    const rows = (data as WorkCardData[] | null) ?? [];
    setItems([...items, ...rows]);
    setMore(rows.length === PAGE);
    setLoadingMore(false);
  }

  function pick(slug: string) {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug); else next.delete('category');
    setParams(next, { replace: true });
  }

  return (
    <>
      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div className="section-head" style={{ marginBottom: 28 }}>
          <h1 className="display h-xl">Explore</h1>
          <p className="muted" style={{ flex: '0 1 420px', fontSize: 16 }}>Campaigns, launches and growth work from marketers on Laud, newest first.</p>
        </div>
        <div className="row gap-12 between" style={{ padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-8" role="group" aria-label="Category">
            <button type="button" className="chip" aria-pressed={!category} onClick={() => pick('')}>All</button>
            {cats.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={category === c.slug} onClick={() => pick(c.slug)}>{c.name}</button>
            ))}
          </div>
          <label style={{ flex: '0 1 280px', minWidth: 200 }}>
            <span className="visually-hidden">Search work</span>
            <input className="input" style={{ minHeight: 40, borderRadius: 999 }} type="search" placeholder="Search title, brand or agency"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
      </section>
      <section className="wrap" style={{ paddingBottom: 96 }}>
        {items === null ? <Loader /> : items.length === 0 ? (
          <div className="empty"><b style={{ fontSize: 18 }}>No work here yet</b><span className="muted">Try another category, or clear the search.</span></div>
        ) : (
          <>
            <div className="grid-cards">{items.map((w) => <WorkCard key={w.id} w={w} />)}</div>
            {more && (
              <div className="row" style={{ justifyContent: 'center', marginTop: 48 }}>
                <button type="button" className="btn btn-outline-ink btn-lg" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
