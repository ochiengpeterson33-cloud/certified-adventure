import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

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
