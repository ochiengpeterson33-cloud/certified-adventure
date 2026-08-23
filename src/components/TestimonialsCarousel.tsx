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
         location: t.client_role || 'Happy Traveler',
         avatar: t.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
         trip: 'Custom Tour',
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
    <section id="testimonials" className="relative py-24 bg-[#070707] border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6 text-[#FF6A00]">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-white uppercase tracking-tight leading-none mb-4">
            Certified <span className="text-white/40">Stories</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
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
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 relative"
            >
              <Quote className="absolute top-8 right-8 w-16 h-16 text-white/5" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < current.rating ? 'fill-[#FF6A00] text-[#FF6A00]' : 'text-white/20'}`} />
                ))}
              </div>

              <p className="text-white md:text-xl leading-relaxed font-['Poppins'] italic mb-8 relative z-10">
                "{current.reviewText}"
              </p>

              <div className="flex items-center gap-4">
                <img loading="lazy" src={current.avatar} alt={current.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                <div>
                  <h4 className="text-white font-bold tracking-wide flex items-center gap-2">
                    {current.name}
                    {current.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </h4>
                  <div className="text-white/50 text-sm flex items-center gap-2">
                    <span>{current.location}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[#FF6A00]">{current.trip}</span>
                  </div>
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
                  <span className={`h-2 rounded-full transition-all ${currentIndex === idx ? 'w-12 bg-[#FF6A00]' : 'w-3 bg-white/20 hover:bg-white/50'}`}></span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
