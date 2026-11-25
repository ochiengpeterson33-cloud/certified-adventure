import React, { useEffect, useState } from 'react';
import { Shield, Target, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useWhyChooseUs } from '../hooks/useSupabaseData';

const IconMap = [Shield, Target, Navigation];

export const WhyChooseUs: React.FC = () => {
  const { data: whyData } = useWhyChooseUs();

  const hasContent =
    Boolean(whyData?.title) ||
    Boolean(whyData?.subtitle) ||
    Boolean(whyData?.image_url) ||
    Boolean(whyData?.list && whyData.list.length > 0);

  if (!hasContent) return null;

  const why = {
    title: whyData?.title || '',
    subtitle: whyData?.subtitle || '',
    list: Array.isArray(whyData?.list) ? whyData.list : [],
    image_url: whyData?.image_url || null,
  };

  return (
    <section
      id="about"
      className="py-24 bg-white dark:bg-[#08121B] border-t border-slate-200/80 dark:border-white/5 relative overflow-hidden transition-colors duration-300"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F4E8D2]/30 dark:bg-[#FF6A00]/[0.05] rounded-l-[100px] pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {why.image_url && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-slate-200/70 dark:border-white/10">
                <img
                  loading="lazy"
                  src={why.image_url}
                  alt={why.title || 'About us'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-[#08121B]/65 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#FF6A00] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-15 pointer-events-none" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,4.5rem)] text-gray-900 dark:text-[#F4E8D2] uppercase tracking-tighter leading-none mb-6">
              {why.title}
            </h2>
            <p className="text-gray-600 dark:text-[#F4E8D2]/75 text-lg leading-relaxed mb-12 max-w-xl">
              {why.subtitle}
            </p>

            <div className="space-y-8">
              {(why.list || []).map((reason: any, idx: number) => {
                const Icon = IconMap[idx % IconMap.length];
                return (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-16 h-16 rounded-full bg-[#F4E8D2] dark:bg-[#FF6A00]/15 dark:border dark:border-[#FF6A00]/25 flex items-center justify-center shrink-0 group-hover:bg-[#FF6A00] dark:group-hover:bg-[#FF6A00] transition-colors duration-500">
                      <Icon className="w-8 h-8 text-[#FF6A00] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div>
                      <h4 className="font-['Poppins'] font-bold text-gray-900 dark:text-white uppercase tracking-wide text-xl mb-2">
                        {reason.title}
                      </h4>
                      <p className="text-gray-600 dark:text-[#F4E8D2]/70 leading-relaxed">
                        {reason.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
