export type ProfileKind = 'person' | 'agency' | 'team';
export type WorkStatus = 'draft' | 'published' | 'hidden';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  linkedin: string;
  avatar_url: string;
  kind: ProfileKind;
  skills: string[];
  available_for_work: boolean;
  role: 'member' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  sort: number;
}

export interface Work {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  brand: string;
  agency: string;
  my_role: string;
  category_id: number | null;
  markets: string[];
  year: number | null;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  cover_path: string;
  video_url: string;
  link_url: string;
  status: WorkStatus;
  sort: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkAsset { id?: string; work_id?: string; path: string; caption: string; sort: number }
export interface WorkResult { id?: string; work_id?: string; value: string; metric: string; note: string; sort: number }
export interface WorkCredit { id?: string; work_id?: string; role: string; name: string; sort: number }

export interface WorkCard {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  brand: string;
  agency: string;
  markets: string[];
  year: number | null;
  summary: string;
  cover_path: string;
  status: WorkStatus;
  sort: number;
  published_at: string | null;
  updated_at: string;
  category_slug: string | null;
  category_name: string | null;
  username: string | null;
  display_name: string;
  avatar_url: string;
  headline_value: string | null;
  headline_metric: string | null;
}

export type UsernameStatus = 'available' | 'taken' | 'reserved' | 'invalid';
