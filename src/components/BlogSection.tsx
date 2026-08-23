import React from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useRealtimeSync } from '../hooks/useSupabaseData';

export const BlogSection: React.FC = () => {
  useRealtimeSync('blog_posts', ['blog_posts']);
  const { data: dbPosts } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });

  if (!dbPosts || dbPosts.length === 0) return null;

  return (
    <section id="blog" className="relative py-24 bg-[#08121B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12212F] border border-[#E67A3A]/40 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Travel Stories</span>
          </div>
          <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-[#F4E8D2] tracking-tight">
            Latest from the <span className="text-gradient-orange">Blog</span>
          </h2>
          <p className="text-sm text-[#F4E8D2]/70 mt-2">
            Read our latest guides, travel tips, and stories from the wild.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dbPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group rounded-3xl overflow-hidden glass-card border border-[#F4E8D2]/10 hover:border-[#E67A3A]/40 transition-all shadow-lg flex flex-col h-full bg-[#12212F]/40"
            >
              {/* Featured Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.featured_image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow relative z-10">
                <h3 className="font-['Poppins'] font-bold text-xl text-white mb-3 group-hover:text-[#E67A3A] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs text-[#F4E8D2]/50 mb-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#E67A3A]" />
                    <span>{post.author_name || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E67A3A]" />
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#F4E8D2]/70 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-[#F4E8D2]/10">
                  <button className="text-sm font-bold text-[#E67A3A] hover:text-[#ff843d] flex items-center gap-2 transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
