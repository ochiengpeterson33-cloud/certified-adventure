import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import nganyaThumb from '../assets/images/poll_nganya_night_1795527362591.jpg';
import lamuThumb from '../assets/images/poll_lamu_dhow_1795527363306.jpg';
import bonfireThumb from '../assets/images/poll_maasai_bonfire_1795527364118.jpg';
import dianiThumb from '../assets/images/poll_diani_beach_1795527363938.jpg';
import hellsGateThumb from '../assets/images/poll_hells_gate_1795527364961.jpg';
import safariThumb from '../assets/images/poll_olpejeta_safari_1795527364891.jpg';

export function useRealtimeSync(tableName: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  const queryKeyStr = JSON.stringify(queryKey);

  useEffect(() => {
    const channelName = `public:${tableName}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        queryClient.invalidateQueries({ queryKey: JSON.parse(queryKeyStr) });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tableName, queryKeyStr]);
}

export function useHeroVideos() {
  useRealtimeSync('categories', ['homepage-hero-videos']);
  return useQuery({
    queryKey: ['homepage-hero-videos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('description').eq('slug', 'homepage-hero-videos').single();
      if (error && error.code !== 'PGRST116') throw error; // ignore not found
      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function usePackages() {
  useRealtimeSync('packages', ['packages']);
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useRoadTrips() {
  useRealtimeSync('road_trips', ['road_trips']);
  return useQuery({
    queryKey: ['road_trips'],
    queryFn: async () => {
      const { data, error } = await supabase.from('road_trips').select('*').order('start_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useDestinations() {
  useRealtimeSync('destinations', ['destinations']);
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('destinations').select('*').order('name');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useGallery() {
  useRealtimeSync('gallery', ['gallery']);
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useTestimonials() {
  useRealtimeSync('testimonials', ['testimonials']);
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useFaqs() {
  useRealtimeSync('faqs', ['faqs']);
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faqs').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useWebsiteSettings() {
  useRealtimeSync('website_settings', ['website_settings']);
  return useQuery({
    queryKey: ['website_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('website_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useEvents() {
  useRealtimeSync('events', ['events']);
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('is_active', true).order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useMerch() {
  useRealtimeSync('merch', ['merch']);
  return useQuery({
    queryKey: ['merch'],
    queryFn: async () => {
      const { data, error } = await supabase.from('merch').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useWhyChooseUs() {
  useRealtimeSync('categories', ['categories-why']);
  return useQuery({
    queryKey: ['categories-why'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('description').eq('slug', 'homepage-why-choose-us').single();
      if (error && error.code !== 'PGRST116') throw error; // ignore not found
      if (data && data.description) {
        try {
          return JSON.parse(data.description);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useHomepageExperiences() {
  useRealtimeSync('categories', ['homepage-experiences']);
  return useQuery({
    queryKey: ['homepage-experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'homepage-experiences')
        .single();
      if (error && error.code !== 'PGRST116') throw error; // ignore not found
      if (data && data.description) {
        try {
          return JSON.parse(data.description);
        } catch (e) {
          return {};
        }
      }
      return {};
    },
    staleTime: 1000 * 60 * 5
  });
}

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

export const DEFAULT_CULTURE_POLLS: CulturePoll[] = [
  {
    id: 'poll-best-vibe',
    question: 'Which Kenyan Cultural Experience Deserves the Next Group Feature?',
    category: 'Culture Spotlight',
    subtitle: 'Pick your top cultural tour for our upcoming community departure.',
    status: 'live',
    closes_at: '2026-12-15T20:00:00Z',
    is_active: true,
    options: [
      {
        id: 'opt-nganya-night',
        title: 'Nairobi Nganya Night Tour',
        subtitle: 'Custom street-art buses, sound systems & CBD evening cruise',
        image_url: nganyaThumb,
      },
      {
        id: 'opt-lamu-dhow',
        title: 'Lamu Swahili Dhow & Old Town',
        subtitle: 'Golden-hour wooden dhow sailing, spice walks & coastal food',
        image_url: lamuThumb,
      },
      {
        id: 'opt-maasai-bonfire',
        title: 'Rift Valley Maasai Exchange',
        subtitle: 'Evening savannah bonfire storytelling & local craft heritage',
        image_url: bonfireThumb,
      },
    ],
  },
  {
    id: 'poll-top-escape',
    question: 'Top Weekend Escape for the Next Squad Road Trip?',
    category: 'Destination Vote',
    subtitle: 'The winning route unlocks priority group rates for next month.',
    status: 'open',
    closes_at: '2026-12-22T20:00:00Z',
    is_active: true,
    options: [
      {
        id: 'opt-diani-coast',
        title: 'Diani White Sands & Reef',
        subtitle: 'South Coast beach days, ocean excursions & coastal sunsets',
        image_url: dianiThumb,
      },
      {
        id: 'opt-naivasha-hells-gate',
        title: 'Naivasha & Hell’s Gate Canyon',
        subtitle: 'Sandstone gorge cycling, hot springs & lake boat cruise',
        image_url: hellsGateThumb,
      },
      {
        id: 'opt-nanyuki-olpejeta',
        title: 'Nanyuki & Ol Pejeta Safari',
        subtitle: '4x4 wildlife drives with panoramic Mount Kenya views',
        image_url: safariThumb,
      },
    ],
  },
];

const VOTER_TOKEN_KEY = 'ca_culture_voter_token_v1';
const MY_VOTES_KEY = 'ca_culture_poll_my_votes_v1';
const LOCAL_COUNTS_KEY = 'ca_culture_poll_local_counts_v1';

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
  if (typeof window === 'undefined') return 'server';
  let token = window.localStorage.getItem(VOTER_TOKEN_KEY) || readCookie(VOTER_TOKEN_KEY);
  if (!token) {
    token =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `voter_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

export function getLocalPollVoteAdjustments(): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useCulturePolls() {
  useRealtimeSync('categories', ['homepage-culture-polls']);
  return useQuery({
    queryKey: ['homepage-culture-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('description')
        .eq('slug', 'homepage-culture-polls')
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description);
          return Array.isArray(parsed) ? (parsed as CulturePoll[]) : [];
        } catch {
          return [];
        }
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface CultureVoteRow {
  poll_id: string;
  option_id: string;
  voter_token: string;
  user_id?: string | null;
}

export function useCulturePollVotes() {
  useRealtimeSync('culture_poll_votes', ['culture-poll-votes']);
  return useQuery({
    queryKey: ['culture-poll-votes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('culture_poll_votes')
        .select('poll_id, option_id, voter_token, user_id');

      if (error) {
        return { rows: [] as CultureVoteRow[], tableAvailable: false };
      }

      return { rows: (data || []) as CultureVoteRow[], tableAvailable: true };
    },
    staleTime: 1000 * 15,
  });
}

export async function castCulturePollVote(
  poll: CulturePoll,
  optionId: string
): Promise<{
  ok: boolean;
  alreadyVoted?: boolean;
  expired?: boolean;
  votedOptionId?: string;
  persistedRemote: boolean;
}> {
  if (resolvePollStatus(poll) === 'CLOSED') {
    return { ok: false, expired: true, persistedRemote: false };
  }

  const voterToken = getOrCreateVoterToken();
  const prevVotes = getSavedUserPollVotes();

  // Strict client-side lock: reject duplicate vote if already voted in this browser
  if (prevVotes[poll.id]) {
    return {
      ok: false,
      alreadyVoted: true,
      votedOptionId: prevVotes[poll.id],
      persistedRemote: false,
    };
  }

  // Check if user is authenticated to also bind vote to user_id
  let userId: string | null = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    userId = userData?.user?.id || null;
  } catch {
    userId = null;
  }

  // Insert-only so database unique constraints strictly enforce 1 vote per user/token
  const { error } = await supabase.from('culture_poll_votes').insert({
    poll_id: poll.id,
    option_id: optionId,
    voter_token: voterToken,
    user_id: userId,
  });

  if (!error) {
    if (typeof window !== 'undefined') {
      const nextMyVotes = { ...prevVotes, [poll.id]: optionId };
      window.localStorage.setItem(MY_VOTES_KEY, JSON.stringify(nextMyVotes));
    }
    return { ok: true, votedOptionId: optionId, persistedRemote: true };
  }

  // Unique constraint violation (23505) => user already voted in DB
  if (error.code === '23505') {
    const { data: existingVote } = await supabase
      .from('culture_poll_votes')
      .select('option_id')
      .eq('poll_id', poll.id)
      .or(userId ? `voter_token.eq.${voterToken},user_id.eq.${userId}` : `voter_token.eq.${voterToken}`)
      .limit(1)
      .maybeSingle();

    const confirmedOptionId = existingVote?.option_id || optionId;
    if (typeof window !== 'undefined') {
      const nextMyVotes = { ...prevVotes, [poll.id]: confirmedOptionId };
      window.localStorage.setItem(MY_VOTES_KEY, JSON.stringify(nextMyVotes));
    }
    return {
      ok: false,
      alreadyVoted: true,
      votedOptionId: confirmedOptionId,
      persistedRemote: true,
    };
  }

  // Fallback when culture_poll_votes table is not yet provisioned in remote Supabase
  if (typeof window !== 'undefined') {
    const nextMyVotes = { ...prevVotes, [poll.id]: optionId };
    window.localStorage.setItem(MY_VOTES_KEY, JSON.stringify(nextMyVotes));

    const counts = getLocalPollVoteAdjustments();
    const pollCounts = { ...(counts[poll.id] || {}) };
    pollCounts[optionId] = (pollCounts[optionId] || 0) + 1;
    counts[poll.id] = pollCounts;
    window.localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(counts));
  }

  return { ok: true, votedOptionId: optionId, persistedRemote: false };
}

