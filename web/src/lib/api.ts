import { supabase } from './supabase';
import type { Profile, Work, WorkAsset, WorkCard, WorkCredit, WorkResult } from './types';

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('username', username.toLowerCase()).maybeSingle();
  return (data as Profile | null) ?? null;
}

/** Works shown on a profile. RLS returns drafts too when the viewer is the owner. */
export async function getProfileWorks(ownerId: string): Promise<WorkCard[]> {
  const { data } = await supabase.from('work_cards').select('*').eq('owner_id', ownerId)
    .in('status', ['published', 'draft'])
    .order('sort', { ascending: true }).order('published_at', { ascending: false, nullsFirst: false });
  return (data as WorkCard[] | null) ?? [];
}

export interface FullWork {
  work: Work;
  assets: WorkAsset[];
  results: WorkResult[];
  credits: WorkCredit[];
}

export async function getWorkChildren(workId: string) {
  const [a, r, c] = await Promise.all([
    supabase.from('work_assets').select('*').eq('work_id', workId).order('sort'),
    supabase.from('work_results').select('*').eq('work_id', workId).order('sort'),
    supabase.from('work_credits').select('*').eq('work_id', workId).order('sort'),
  ]);
  return {
    assets: (a.data as WorkAsset[] | null) ?? [],
    results: (r.data as WorkResult[] | null) ?? [],
    credits: (c.data as WorkCredit[] | null) ?? [],
  };
}

export async function getWorkBySlug(ownerId: string, slug: string): Promise<FullWork | null> {
  const { data } = await supabase.from('works').select('*').eq('owner_id', ownerId).eq('slug', slug).maybeSingle();
  if (!data) return null;
  const work = data as Work;
  return { work, ...(await getWorkChildren(work.id)) };
}

export async function getWorkById(id: string): Promise<FullWork | null> {
  const { data } = await supabase.from('works').select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  const work = data as Work;
  return { work, ...(await getWorkChildren(work.id)) };
}
