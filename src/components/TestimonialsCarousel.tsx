import React, { useState, useMemo, useEffect } from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';
import { Testimonial } from '../types';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TestimonialsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: dbTestimonials } = useTestimonials();
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const combinedTestimonials = useMemo(() => {
    if (dbTestimonials && dbTestimonials.length > 0) {
       return dbTestimonials.map(t => ({
         id: t.id,
         name: t.client_name,
         location: t.client_role || '',
         avatar: t.avatar_url || '',
         trip: t.package_title || '',
         rating: t.rating || 5,
         reviewText: t.content,
         date: new Date().toISOString(),
         verified: true
       }));
    }
    // Fallback to local data only if db is empty
    return [];
  }, [dbTestimonials]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && combinedTestimonials.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % combinedTestimonials.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, combinedTestimonials.length]);

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? combinedTestimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % combinedTestimonials.length);
  };

  if (!combinedTestimonials || combinedTestimonials.length === 0) return null;

  const current = combinedTestimonials[currentIndex] || combinedTestimonials[0];

  return (
    <section id="testimonials" className="relative py-24 bg-[#FAF9F6] dark:bg-[#070707] border-t border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 dark:bg-white/5 border border-orange-200 dark:border-white/10 mb-6 text-[#FF6A00]">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-4">
            Certified <span className="text-slate-400 dark:text-white/40">Stories</span>
          </h2>
          <p className="text-slate-600 dark:text-white/60 text-lg max-w-2xl mx-auto">
            Real experiences from travelers who trusted us with their ultimate adventure.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none relative"
            >
              <Quote className="absolute top-8 right-8 w-16 h-16 text-slate-100 dark:text-white/5" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < current.rating ? 'fill-[#FF6A00] text-[#FF6A00]' : 'text-slate-200 dark:text-white/20'}`} />
                ))}
              </div>

              <p className="text-slate-800 dark:text-white md:text-xl leading-relaxed font-['Poppins'] italic mb-8 relative z-10">
                "{current.reviewText}"
              </p>

              <div className="flex items-center gap-4">
                {current.avatar ? (
                  <img loading="lazy" src={current.avatar} alt={current.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#FF6A00]/15 border-2 border-[#FF6A00]/30 flex items-center justify-center font-black text-lg text-[#FF6A00] shrink-0">
                    {(current.name?.[0] || 'C').toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold tracking-wide flex items-center gap-2">
                    {current.name}
                    {current.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </h4>
                  {(current.location || current.trip) && (
                    <div className="text-slate-500 dark:text-white/50 text-sm flex items-center gap-2">
                      {current.location && <span>{current.location}</span>}
                      {current.location && current.trip && <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />}
                      {current.trip && <span className="text-[#FF6A00]">{current.trip}</span>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {combinedTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx); }}
                  className="w-10 h-10 flex items-center justify-center" aria-label="Slide dot">
                  <span className={`h-2 rounded-full transition-all ${currentIndex === idx ? 'w-12 bg-[#FF6A00]' : 'w-3 bg-slate-300 hover:bg-slate-400 dark:bg-white/20 dark:hover:bg-white/50'}`}></span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
