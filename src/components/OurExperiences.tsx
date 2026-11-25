import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bus, Map, Heart, Compass, Users, Car, MapPin } from 'lucide-react';
import { useHomepageExperiences } from '../hooks/useSupabaseData';

interface ExperienceData {
  id: string;
  title: string;
  location: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const experiences: ExperienceData[] = [
  {
    id: 'nganya',
    title: 'Nganya Experience',
    location: 'Nairobi City & Street Culture',
    description: "Ride Nairobi's most iconic matatus with music, lights and street culture.",
    icon: Bus,
    tag: 'Culture & Vibe',
  },
  {
    id: 'roadtrips',
    title: 'Road Trips & Adventures',
    location: 'Rift Valley & Scenic Escapes',
    description: 'Weekend escapes and unforgettable destinations across Kenya.',
    icon: Map,
    tag: 'Adventure',
  },
  {
    id: 'weddings',
    title: 'Weddings & Ruracio Transport',
    location: 'Nairobi & Countrywide',
    description: 'Comfortable and stylish transport for special occasions and weddings.',
    icon: Heart,
    tag: 'Special Events',
  },
  {
    id: 'safari',
    title: 'Safari Tours',
    location: 'Maasai Mara & Amboseli',
    description: 'Guided wildlife adventures and game drives across Kenya.',
    icon: Compass,
    tag: 'Wildlife',
  },
  {
    id: 'coaster',
    title: 'Coaster & Group Hire',
    location: 'Kenya Nationwide Charter',
    description: 'Perfect for schools, churches, corporates, retreats and group events.',
    icon: Users,
    tag: 'Group Hire',
  },
  {
    id: 'private',
    title: 'Private Car Hire',
    location: 'Nairobi & Executive Travel',
    description: 'Comfortable executive transport and chauffeurs for individuals and families.',
    icon: Car,
    tag: 'Executive',
  }
];

const ExperienceVideo = ({ src }: { src: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1 }
    );
    
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <video 
      ref={videoRef}
      src={src} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      muted
      loop
      playsInline
      preload="none"
    />
  );
};

const SectionBackgroundVideo = ({ src, poster }: { src: string; poster?: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover object-center"
    />
  );
};

interface OurExperiencesProps {
  onOpenBookingModal?: (destination?: string, packageTitle?: string) => void;
}

export const OurExperiences: React.FC<OurExperiencesProps> = ({ onOpenBookingModal }) => {
  const { data: dynamicImages } = useHomepageExperiences();

  const bgType = dynamicImages?.section_bg_type;
  const bgImage = dynamicImages?.section_bg_image;
  const bgVideo = dynamicImages?.section_bg_video;

  const showSectionVideo = Boolean(bgVideo) && (bgType === 'video' || !bgType);
  const showSectionImage = !showSectionVideo && Boolean(bgImage) && (bgType === 'image' || !bgType);
  const hasCustomSectionBg = showSectionVideo || showSectionImage;

  const overlayClassMap: Record<string, string> = {
    '40': 'bg-[#F8F6F2]/55 dark:bg-[#08121B]/40',
    '60': 'bg-[#F8F6F2]/70 dark:bg-[#08121B]/60',
    '75': 'bg-[#F8F6F2]/80 dark:bg-[#08121B]/75',
    '85': 'bg-[#F8F6F2]/90 dark:bg-[#08121B]/85',
  };
  const overlayScrimClass = overlayClassMap[dynamicImages?.section_bg_overlay || '60'] || overlayClassMap['60'];

  const handleBook = (exp: ExperienceData) => {
    onOpenBookingModal?.(exp.location, exp.title);
  };

  return (
    <section id="experiences" className="py-24 bg-[#F8F6F2] dark:bg-[#08121B] relative overflow-hidden font-['Poppins'] border-t border-slate-200 dark:border-[#E67A3A]/20 transition-colors duration-300">
      {/* Admin-Configured Section Background Media (Video or Image) */}
      {hasCustomSectionBg && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {showSectionVideo ? (
            <SectionBackgroundVideo src={bgVideo} poster={bgImage} />
          ) : (
            <img
              src={bgImage}
              alt="Explore Our Experiences background"
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* Theme-aware contrast veil */}
          <div className={`absolute inset-0 transition-colors duration-300 ${overlayScrimClass}`} />
          {/* Top & bottom soft edge fade for seamless section transitions */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F2] via-transparent to-[#F8F6F2] dark:from-[#08121B] dark:via-transparent dark:to-[#08121B]" />
        </div>
      )}

      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#E67A3A]/10 dark:bg-[#E67A3A]/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-1">
          <h2 className="font-black text-[clamp(2rem,4vw+1rem,4.5rem)] text-slate-900 dark:text-[#F4E8D2] uppercase tracking-tighter leading-none mb-4 sm:mb-6">
            Explore <span className="text-gradient-orange">Our Experiences</span>
          </h2>
          <p className="text-slate-700 dark:text-[#F4E8D2]/80 text-sm sm:text-lg leading-relaxed font-medium">
            Choose your favourite adventure and reserve your customized experience instantly.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {experiences.map((exp, idx) => {
            const imgUrl = dynamicImages?.[exp.id];
            const videoUrl = dynamicImages?.[exp.id + '_video'];
            return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => handleBook(exp)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card bg-white dark:bg-transparent border border-slate-200 dark:border-[#F4E8D2]/10 hover:border-[#E67A3A]/50 transition-all duration-500 shadow-lg dark:shadow-xl flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-[#E67A3A]/10 min-w-0"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#08121B]">
                {videoUrl ? (
                  <ExperienceVideo src={videoUrl} />
                ) : imgUrl ? (
                  <img 
                    src={imgUrl} 
                    alt={exp.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#08121B] via-[#102436] to-[#1a110a] flex items-center justify-center">
                    <exp.icon className="w-14 h-14 sm:w-20 sm:h-20 text-[#FF6A00]/25 group-hover:text-[#FF6A00]/45 group-hover:scale-110 transition-all duration-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 dark:from-[#08121B] dark:via-[#08121B]/60 to-transparent" />
                
                {/* Category tag */}
                <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 max-w-[calc(100%-3rem)]">
                  <span className="inline-block truncate max-w-full px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[11px] font-bold text-[#F4E8D2] border border-white/10 uppercase tracking-wider">
                    {exp.tag}
                  </span>
                </div>

                {/* Icon Badge */}
                <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:bg-[#E67A3A] transition-colors duration-300">
                  <exp.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
              </div>
              
              <div className="p-3 sm:p-6 md:p-7 relative -mt-4 sm:-mt-8 flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight leading-snug group-hover:text-[#E67A3A] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-slate-600 dark:text-[#F4E8D2]/70 text-[11px] sm:text-sm mb-2.5 sm:mb-4 line-clamp-2">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-[#F4E8D2]/60 mb-3 sm:mb-5 min-w-0">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E67A3A] shrink-0" />
                    <span className="truncate">{exp.location}</span>
                  </div>
                </div>

                {/* Booking Action Button */}
                <div className="pt-2.5 sm:pt-4 border-t border-slate-200/80 dark:border-white/10 mt-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBook(exp);
                    }}
                    className="group/btn relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#E67A3A] to-[#FF6A00] hover:from-[#FF6A00] hover:to-[#ff8524] text-white px-3 py-2 sm:px-4 sm:py-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-[#E67A3A]/25 hover:shadow-lg hover:shadow-[#FF6A00]/35 ring-1 ring-inset ring-white/20 flex items-center justify-between gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    {/* Subtle hover light sweep */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <span className="relative z-10 pl-0.5 sm:pl-1">Book Now</span>
                    <span className="relative z-10 w-5 h-5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/20 group-hover/btn:bg-white/30 flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
