import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useHeroSlides, useHeroVideos } from '../hooks/useSupabaseData';

export const Hero: React.FC<{ onOpenBookingModal: () => void }> = ({ onOpenBookingModal }) => {
  const { data: dbSlides, isLoading: isSlidesLoading } = useHeroSlides();
  const { data: dbVideos, isLoading: isVideosLoading } = useHeroVideos();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : [];
  
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && slides.length > 1) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  if (isSlidesLoading || isVideosLoading) {
    return (
      <section className="relative h-[80vh] md:h-[100vh] w-full flex flex-col justify-center items-center overflow-hidden bg-[#070707]">
         <div className="w-16 h-16 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (slides.length === 0) {
    slides.push({
      id: 'fallback',
      title: "Discover The Unknown",
      subtitle: "Join us on epic adventures across the globe.",
      button_text: "Explore Now",
      image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
    });
  }

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentSlideIndex];
  
  const activeVideos = (dbVideos || []).filter((v: any) => v.is_active).sort((a: any, b: any) => a.display_order - b.display_order);
  const activeVideo = activeVideos.length > 0 ? activeVideos[0] : null;

  return (
    <section id="home" className="relative h-[80vh] md:h-[100vh] w-full flex flex-col justify-center overflow-hidden bg-[#070707]">
      {/* Hero Backgrounds */}
      {activeVideo ? (
        <div className="absolute inset-0 z-0">
          <video
            src={activeVideo.video_url}
            poster={activeVideo.poster_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/30 via-[#070707]/50 to-[#070707]/80" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentSlide.image_url}
              alt={currentSlide.title || 'Adventure'}
              fetchPriority={currentSlideIndex === 0 ? "high" : "auto"}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark Black Gradient Overlay (50-60%) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/30 via-[#070707]/50 to-[#070707]/80" />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Slider Controls */}
      {!activeVideo && slides.length > 1 && (
        <div className="absolute z-30 left-4 right-4 md:left-10 md:right-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <button 
            onClick={handlePrevSlide}
            className="pointer-events-auto w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNextSlide}
            className="pointer-events-auto w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-24 md:mt-20">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="font-['Poppins'] font-black text-[clamp(2.5rem,6vw+1rem,6rem)] leading-[1.05] text-white leading-[1.05] tracking-tight mb-6 uppercase" dangerouslySetInnerHTML={{ __html: (activeVideo ? activeVideo.title : currentSlide.title) || '' }}>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-medium mb-10 max-w-2xl">
                {activeVideo ? activeVideo.subtitle : currentSlide.subtitle}
              </p>
              
              <motion.button 
                onClick={onOpenBookingModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#E67A3A] hover:bg-[#c9662d] text-white font-bold text-lg md:text-xl px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg transition-colors flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                <span>Book Active Event</span>
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </AnimatePresence>

          
        </div>
      </div>

      

      {/* Slider Dots */}
      {!activeVideo && slides.length > 1 && (
        <div className="absolute z-30 bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentSlideIndex(idx);
              }}
              className="w-10 h-10 flex items-center justify-center" aria-label="Slide dot">
              <span className={`transition-all duration-500 rounded-full ${currentSlideIndex === idx ? 'w-10 h-2 bg-[#FF6A00]' : 'w-2 h-2 bg-white/50 hover:bg-white'}`}></span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
