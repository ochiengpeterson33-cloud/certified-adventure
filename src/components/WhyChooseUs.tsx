import React, { useEffect, useState } from 'react';
import { Shield, Target, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useWhyChooseUs } from '../hooks/useSupabaseData';

const IconMap = [Shield, Target, Navigation];

export const WhyChooseUs: React.FC = () => {
  const { data: whyData } = useWhyChooseUs();
  
  const why = {
    title: whyData?.title || 'Why Certified',
    subtitle: whyData?.subtitle || 'We don\'t just organize trips; we craft lifestyle experiences. Every detail is meticulously planned to ensure maximum comfort, thrill, and safety.',
    list: whyData?.list && whyData.list.length > 0 ? whyData.list : [
      { title: 'Premium Comfort', desc: 'From our custom VIP transport fleet to luxury eco-camp selections, we prioritize your comfort.' },
      { title: 'Safety First', desc: 'All our guides are wilderness first-aid certified and we use state-of-the-art GPS tracking on all remote expeditions.' },
      { title: 'Unmatched Expertise', desc: 'Over a decade of navigating the toughest terrains and finding the most exclusive hidden gems.' }
    ],
    image_url: whyData?.image_url || null
  };

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F4E8D2]/30 rounded-l-[100px] pointer-events-none hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img loading="lazy" 
                src={why.image_url || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"} 
                alt="Safari Guide"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="text-white font-['Poppins'] font-bold text-xl uppercase tracking-wider mb-2">Since 2018</div>
                  <p className="text-white/80 text-sm">Pioneering luxury adventure travel across East Africa.</p>
                </div>
              </div>
            </div>
            {/* Abstract Shape */}
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#FF6A00] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,4.5rem)] text-gray-900 uppercase tracking-tighter leading-none mb-6">
              {why.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-xl">
              {why.subtitle}
            </p>

            <div className="space-y-8">
              {(why.list || []).map((reason: any, idx: number) => {
                const Icon = IconMap[idx % IconMap.length];
                return (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-16 h-16 rounded-full bg-[#F4E8D2] flex items-center justify-center shrink-0 group-hover:bg-[#FF6A00] transition-colors duration-500">
                      <Icon className="w-8 h-8 text-[#FF6A00] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div>
                      <h4 className="font-['Poppins'] font-bold text-gray-900 uppercase tracking-wide text-xl mb-2">{reason.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{reason.desc}</p>
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
