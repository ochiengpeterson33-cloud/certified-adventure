import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

// ============================================================================
// Server Micro-Cache Proxy Detection (Cloud Run Express /api/public/*)
// Falls back cleanly to direct Supabase queries in `vite dev` or static builds
// ============================================================================
let serverProxyCheckPromise: Promise<boolean> | null = null;

async function isServerProxyAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!serverProxyCheckPromise) {
    serverProxyCheckPromise = (async () => {
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 1500);
        const res = await fetch('/api/health', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        window.clearTimeout(timer);
        if (!res.ok) return false;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return false;
        const data = await res.json();
        return Boolean(data?.ok && data?.proxyConfigured);
      } catch {
        return false;
      }
    })();
  }
  return serverProxyCheckPromise;
}

async function fetchFromCmsProxy<T>(resource: string): Promise<T | null> {
  const useProxy = await isServerProxyAvailable();
  if (!useProxy) return null;
  try {
    const res = await fetch(`/api/public/cms/${encodeURIComponent(resource)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const json = await res.json();
    return (json?.data ?? null) as T;
  } catch {
    return null;
  }
}

export async function invalidateServerCache(targets: ('polls' | 'tallies' | 'cms')[]): Promise<void> {
  const useProxy = await isServerProxyAvailable();
  if (!useProxy) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;
    await fetch('/api/public/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targets }),
    });
  } catch {
    // Non-fatal
  }
}

// Track tab visibility so background polling pauses completely when tab is hidden
function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState<boolean>(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}

// ============================================================================
// Public CMS Hooks (Static/Admin-Managed — Zero Realtime Subscriptions)
// ============================================================================
const CMS_STALE_TIME = 1000 * 60 * 15; // 15 minutes
const CMS_GC_TIME = 1000 * 60 * 30; // 30 minutes

export function useHeroVideos() {
  return useQuery({
    queryKey: ['homepage-hero-videos'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('homepage-hero-videos');
      const row = proxied ? proxied[0] : null;
      if (row?.description) {
        try {
          const parsed = JSON.parse(row.description);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .select('description')
        .eq('slug', 'homepage-hero-videos')
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.description) {
        try {
          const parsed = JSON.parse(data.description);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('hero_slides');
      if (proxied) return proxied;
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('packages');
      if (proxied) return proxied;
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useRoadTrips() {
  return useQuery({
    queryKey: ['road_trips'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('road_trips');
      if (proxied) return proxied;
      const { data, error } = await supabase
        .from('road_trips')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('destinations');
      if (proxied) return proxied;
      const { data, error } = await supabase.from('destinations').select('*').order('name');
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('gallery');
      if (proxied) return proxied;
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('testimonials');
      if (proxied) return proxied;
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('faqs');
      if (proxied) return proxied;
      const { data, error } = await supabase.from('faqs').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useWebsiteSettings() {
  return useQuery({
    queryKey: ['website_settings'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('website_settings');
      if (proxied && proxied.length > 0) return proxied[0];
      const { data, error } = await supabase.from('website_settings').select('*').limit(1).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('events');
      if (proxied) return proxied;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useMerch() {
  return useQuery({
    queryKey: ['merch'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('merch');
      if (proxied) return proxied;
      const { data, error } = await supabase.from('merch').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useWhyChooseUs() {
  return useQuery({
    queryKey: ['categories-why'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('homepage-why-choose-us');
      const row = proxied ? proxied[0] : null;
      if (row?.description) {
        try {
          return JSON.parse(row.description);
        } catch {
          return null;
        }
      }
      const { data, error } = await supabase
        .from('categories')
        .select('description')
        .eq('slug', 'homepage-why-choose-us')
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.description) {
        try {
          return JSON.parse(data.description);
        } catch {
          return null;
        }
      }
      return null;
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useHomepageExperiences() {
  return useQuery({
    queryKey: ['homepage-experiences'],
    queryFn: async () => {
      const proxied = await fetchFromCmsProxy<any[]>('homepage-experiences');
      const row = proxied ? proxied[0] : null;
      if (row?.description) {
        try {
          return JSON.parse(row.description);
        } catch {
          return {};
        }
      }
      const { data, error } = await supabase
        .from('categories')
        .select('description')
        .eq('slug', 'homepage-experiences')
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.description) {
        try {
          return JSON.parse(data.description);
        } catch {
          return {};
        }
      }
      return {};
    },
    staleTime: CMS_STALE_TIME,
    gcTime: CMS_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// Community Polls & Lightweight Tally System (Free-Tier Scalable)
// ============================================================================
export type PollStatusMode = 'auto' | 'live' | 'open' | 'closed';
export type ResolvedPollStatus = 'LIVE' | 'OPEN' | 'CLOSED';

export interface CulturePollOption {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
}

export interface CulturePoll {
  id: string;
  question: string;
  category?: string;
  subtitle?: string;
  status?: PollStatusMode;
  closes_at?: string;
  is_active: boolean;
  options: CulturePollOption[];
}

export interface CultureTallyRow {
  poll_id: string;
  option_id: string;
  vote_count: number;
}

export type TallyMap = Record<string, Record<string, number>>;

export function resolvePollStatus(poll: CulturePoll, nowMs: number = Date.now()): ResolvedPollStatus {
  if (poll.is_active === false || poll.status === 'closed') {
    return 'CLOSED';
  }
  if (poll.closes_at) {
    const closesMs = Date.parse(poll.closes_at);
    if (!Number.isNaN(closesMs) && nowMs >= closesMs) {
      return 'CLOSED';
    }
  }
  if (poll.status === 'live') return 'LIVE';
  if (poll.status === 'open') return 'OPEN';

  if (poll.closes_at) {
    const closesMs = Date.parse(poll.closes_at);
    if (!Number.isNaN(closesMs) && closesMs - nowMs <= 48 * 60 * 60 * 1000) {
      return 'LIVE';
    }
  }
  return 'OPEN';
}

const VOTER_TOKEN_KEY = 'ca_culture_voter_token_v1';
const MY_VOTES_KEY = 'ca_culture_poll_my_votes_v1';
const POLL_BROADCAST_CHANNEL = 'ca-culture-polls-live';
export const LOCAL_POLL_SYNC_EVENT = 'ca-culture-polls-local-sync';

function buildTallyMap(rows: CultureTallyRow[]): TallyMap {
  const map: TallyMap = {};
  for (const r of rows) {
    if (!r.poll_id || !r.option_id) continue;
    if (!map[r.poll_id]) map[r.poll_id] = {};
    map[r.poll_id][r.option_id] = Number(r.vote_count || 0);
  }
  return map;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getOrCreateVoterToken(): string {
  if (typeof window === 'undefined') return 'server-session-token';
  let token = window.localStorage.getItem(VOTER_TOKEN_KEY) || readCookie(VOTER_TOKEN_KEY);
  if (!token || token.trim().length < 8) {
    token =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `voter_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
  window.localStorage.setItem(VOTER_TOKEN_KEY, token);
  writeCookie(VOTER_TOKEN_KEY, token);
  return token;
}

export function getSavedUserPollVotes(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(MY_VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConfirmedUserVotes(votes: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MY_VOTES_KEY, JSON.stringify(votes));
  } catch {
    // Ignore storage quota errors
  }
}

// Local same-browser multi-tab sync only (0 Supabase Realtime connections consumed)
export function broadcastPollsEvent(
  event: 'vote_cast' | 'votes_reset' | 'polls_updated',
  payload?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LOCAL_POLL_SYNC_EVENT, { detail: { event, ...payload } }));
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(POLL_BROADCAST_CHANNEL);
      bc.postMessage({ event, ...payload });
      bc.close();
    }
  } catch {
    // Ignore if BroadcastChannel is blocked
  }
}

export function useCulturePolls() {
  const queryClient = useQueryClient();
  const isVisible = useDocumentVisible();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(POLL_BROADCAST_CHANNEL);
      bc.onmessage = (ev) => {
        if (ev?.data?.event === 'polls_updated') {
          queryClient.invalidateQueries({ queryKey: ['homepage-culture-polls'] });
          queryClient.invalidateQueries({ queryKey: ['culture-poll-tallies'] });
        }
      };
    } catch {
      // Ignore
    }
    return () => {
      try {
        bc?.close();
      } catch {
        // Ignore
      }
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['homepage-culture-polls'],
    queryFn: async () => {
      if (await isServerProxyAvailable()) {
        try {
          const res = await fetch('/api/public/polls', { headers: { Accept: 'application/json' } });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const json = await res.json();
            if (Array.isArray(json?.polls)) {
              return json.polls as CulturePoll[];
            }
          }
        } catch {
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .select('description')
        .eq('slug', 'homepage-culture-polls')
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.description) {
        try {
          const parsed = JSON.parse(data.description);
          return Array.isArray(parsed) ? (parsed as CulturePoll[]) : [];
        } catch {
          return [];
        }
      }
      return [];
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchInterval: isVisible ? 60_000 : false,
    refetchOnWindowFocus: false,
  });
}

// Fetch caller's confirmed remote votes once per session/user (not on every tally tick)
export function useMyRemotePollVotes(voterToken: string, userId: string | null) {
  return useQuery({
    queryKey: ['culture-my-votes', voterToken, userId || 'anon'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_culture_poll_state', {
        p_voter_token: voterToken,
      });
      if (error || !data) {
        return { myVotes: null as Record<string, string> | null, rpcAvailable: false };
      }
      const myVotes = (data?.my_votes && typeof data.my_votes === 'object' ? data.my_votes : {}) as Record<string, string>;
      // Sync authoritative confirmed DB votes to localStorage cache
      saveConfirmedUserVotes(myVotes);
      return { myVotes, rpcAvailable: true };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useCulturePollVotes(options?: { hasActivePolls?: boolean }) {
  const queryClient = useQueryClient();
  const isVisible = useDocumentVisible();
  const hasActivePolls = options?.hasActivePolls ?? true;

  // Jittered periodic interval prevents synchronized thundering-herd spikes
  const [jitterMs] = useState(() => Math.floor(Math.random() * 4000));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(POLL_BROADCAST_CHANNEL);
        bc.onmessage = (ev) => {
          if (ev?.data?.event === 'vote_cast' || ev?.data?.event === 'votes_reset') {
            queryClient.invalidateQueries({ queryKey: ['culture-poll-tallies'] });
            window.dispatchEvent(new CustomEvent(LOCAL_POLL_SYNC_EVENT, { detail: ev.data }));
          }
        };
      }
    } catch {
      // Ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === MY_VOTES_KEY) {
        window.dispatchEvent(new CustomEvent(LOCAL_POLL_SYNC_EVENT));
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      try {
        bc?.close();
      } catch {
        // Ignore
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['culture-poll-tallies'],
    queryFn: async () => {
      // Prefer Express 3s micro-cache when active to protect Supabase Free tier
      if (await isServerProxyAvailable()) {
        try {
          const res = await fetch('/api/public/tallies', { headers: { Accept: 'application/json' } });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const json = await res.json();
            const rows = (Array.isArray(json?.tallies) ? json.tallies : []) as CultureTallyRow[];
            return {
              tallies: buildTallyMap(rows),
              tableAvailable: true,
            };
          }
        } catch {
          // Fall back to direct lightweight Supabase tally read
        }
      }

      const { data, error } = await supabase
        .from('culture_poll_tallies')
        .select('poll_id, option_id, vote_count');

      if (error) {
        return { tallies: {} as TallyMap, tableAvailable: false };
      }

      return {
        tallies: buildTallyMap((data || []) as CultureTallyRow[]),
        tableAvailable: true,
      };
    },
    staleTime: 2500,
    gcTime: 1000 * 60 * 10,
    // Refresh only when tab is visible and at least one poll is active
    refetchInterval: isVisible && hasActivePolls ? 10_000 + jitterMs : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export interface CastVoteResult {
  ok: boolean;
  alreadyVoted?: boolean;
  expired?: boolean;
  invalidOption?: boolean;
  rateLimited?: boolean;
  votedOptionId?: string;
  tallies?: CultureTallyRow[];
  persistedRemote: boolean;
  error?: string;
}

export async function castCulturePollVote(
  poll: CulturePoll,
  optionId: string
): Promise<CastVoteResult> {
  if (resolvePollStatus(poll) === 'CLOSED') {
    return {
      ok: false,
      expired: true,
      persistedRemote: false,
      error: 'This poll has closed and is no longer accepting votes.',
    };
  }

  const voterToken = getOrCreateVoterToken();

  try {
    let result: any = null;

    // Use rate-limited Express endpoint when proxy is configured (never cached)
    if (await isServerProxyAvailable()) {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const res = await fetch('/api/public/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionId,
          voterToken,
        }),
      });

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const json = await res.json();
        if (res.status === 429) {
          return {
            ok: false,
            rateLimited: true,
            persistedRemote: false,
            error: json?.error || 'Too many requests right now. Please wait a few seconds and retry.',
          };
        }
        if (res.ok) {
          result = json;
        } else if (res.status >= 400 && res.status < 500) {
          return {
            ok: false,
            persistedRemote: false,
            error: json?.error || 'Unable to submit vote. Please check and retry.',
          };
        }
      }
    }

    // Direct atomic Postgres RPC fallback (when Vite dev or proxy unavailable)
    if (!result) {
      const { data, error } = await supabase.rpc('cast_culture_vote', {
        p_poll_id: poll.id,
        p_option_id: optionId,
        p_voter_token: voterToken,
      });

      if (error) {
        return {
          ok: false,
          persistedRemote: false,
          error:
            error.code === '42883'
              ? 'Voting system setup is pending in the database. Please notify an administrator.'
              : 'Could not save your vote due to a connection issue. Please tap again to retry.',
        };
      }
      result = data;
    }

    if (result?.ok) {
      const confirmedId = result.voted_option_id || optionId;
      const prevVotes = getSavedUserPollVotes();
      saveConfirmedUserVotes({ ...prevVotes, [poll.id]: confirmedId });
      broadcastPollsEvent('vote_cast', { pollId: poll.id, optionId: confirmedId });

      return {
        ok: true,
        votedOptionId: confirmedId,
        tallies: Array.isArray(result.tallies) ? result.tallies : undefined,
        persistedRemote: true,
      };
    }

    if (result?.already_voted) {
      const confirmedId = result.voted_option_id || optionId;
      const prevVotes = getSavedUserPollVotes();
      saveConfirmedUserVotes({ ...prevVotes, [poll.id]: confirmedId });
      return {
        ok: false,
        alreadyVoted: true,
        votedOptionId: confirmedId,
        tallies: Array.isArray(result.tallies) ? result.tallies : undefined,
        persistedRemote: true,
        error: 'Your previous vote for this poll is already recorded.',
      };
    }

    if (result?.expired) {
      return {
        ok: false,
        expired: true,
        persistedRemote: false,
        error: result?.error || 'This poll has closed and is no longer accepting votes.',
      };
    }

    if (result?.invalid_option || result?.invalid_poll) {
      return {
        ok: false,
        invalidOption: true,
        persistedRemote: false,
        error: result?.error || 'This voting option is no longer valid.',
      };
    }

    return {
      ok: false,
      persistedRemote: false,
      error: result?.error || 'Unable to save your vote right now. Please tap again to retry.',
    };
  } catch {
    return {
      ok: false,
      persistedRemote: false,
      error: 'Network error while saving your vote. Your vote was NOT counted—please retry.',
    };
  }
}

export function mergePollTallyRows(
  prev: { tallies: TallyMap; tableAvailable: boolean } | undefined,
  pollId: string,
  rows: CultureTallyRow[]
): { tallies: TallyMap; tableAvailable: boolean } {
  const nextTallies: TallyMap = { ...(prev?.tallies || {}) };
  const pollCounts: Record<string, number> = {};
  for (const r of rows) {
    if (r.poll_id === pollId && r.option_id) {
      pollCounts[r.option_id] = Number(r.vote_count || 0);
    }
  }
  nextTallies[pollId] = pollCounts;
  return {
    tallies: nextTallies,
    tableAvailable: true,
  };
}
