import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bus, Map, Heart, Compass, Users, Car, MapPin } from 'lucide-react';
import {
  useHomepageExperiences,
  parseExperiencesGlassConfig,
  computeExperiencesGlassStyles,
} from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';

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

const SectionBackgroundVideo = ({
  src,
  poster,
  style,
}: {
  src: string;
  poster?: string;
  style?: React.CSSProperties;
}) => {
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
      style={style}
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
  const { isDark } = useTheme();

  const bgType = dynamicImages?.section_bg_type;
  const bgImage = dynamicImages?.section_bg_image;
  const bgVideo = dynamicImages?.section_bg_video;

  const showSectionVideo = Boolean(bgVideo) && (bgType === 'video' || !bgType);
  const showSectionImage = !showSectionVideo && Boolean(bgImage) && (bgType === 'image' || !bgType);
  const hasCustomSectionBg = showSectionVideo || showSectionImage;

  const glassConfig = parseExperiencesGlassConfig(dynamicImages);
  const glassStyles = computeExperiencesGlassStyles(glassConfig, isDark);

  const handleBook = (exp: ExperienceData) => {
    onOpenBookingModal?.(exp.location, exp.title);
  };

  return (
    <section
      id="experiences"
      className="py-24 bg-[#F5F2EC] dark:bg-[#08121B] relative overflow-hidden font-['Poppins'] border-t border-slate-200 dark:border-[#E67A3A]/20 transition-colors duration-300"
    >
      {/* Admin-Configured Section Background Media (Video or Image) */}
      {hasCustomSectionBg && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {showSectionVideo ? (
            <SectionBackgroundVideo
              src={bgVideo}
              poster={bgImage}
              style={{ filter: glassStyles.mediaFilter }}
            />
          ) : (
            <img
              src={bgImage}
              alt="Explore Our Experiences background"
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{ filter: glassStyles.mediaFilter }}
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* Admin-leveled contrast scrim */}
          <div
            style={{ backgroundColor: glassStyles.sectionScrimColor }}
            className="absolute inset-0 transition-colors duration-300"
          />
          {/* Top & bottom soft edge fade for seamless section transitions */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EC]/90 via-transparent to-[#F5F2EC]/90 dark:from-[#08121B]/90 dark:via-transparent dark:to-[#08121B]/90" />
        </div>
      )}

      {/* Atmospheric Depth Mesh (gives frosted glass visible refraction even without custom background media) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full sm:w-[860px] h-[340px] sm:h-[440px] bg-[#E67A3A]/20 dark:bg-[#E67A3A]/16 blur-[120px] rounded-full" />
        <div className="absolute bottom-8 -left-24 w-[420px] h-[420px] bg-[#29492F]/14 dark:bg-[#29492F]/28 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-[380px] h-[380px] bg-[#E67A3A]/15 dark:bg-[#FF6A00]/12 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-1">
          <h2
            style={{ textWrap: 'balance' }}
            className="font-black text-[clamp(2rem,4vw+1rem,4.5rem)] text-slate-900 dark:text-[#F4E8D2] uppercase tracking-tighter leading-none mb-4 sm:mb-6"
          >
            Explore <span className="text-gradient-orange">Our Experiences</span>
          </h2>
          <p className="text-slate-700 dark:text-[#F4E8D2]/85 text-sm sm:text-lg leading-relaxed font-medium">
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
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
                onClick={() => handleBook(exp)}
                style={glassStyles.cardStyle}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:border-[#E67A3A]/60 min-w-0"
              >
                {/* Frosted Glass Bezel around Experience Media */}
                <div className="p-2 sm:p-3 pb-0">
                  <div className="aspect-[4/3] w-full overflow-hidden relative rounded-xl sm:rounded-2xl bg-[#08121B]">
                    {videoUrl ? (
                      <ExperienceVideo src={videoUrl} />
                    ) : imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={exp.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#08121B] via-[#102436] to-[#1a110a] flex items-center justify-center">
                        <exp.icon className="w-12 h-12 sm:w-20 sm:h-20 text-[#FF6A00]/30 group-hover:text-[#FF6A00]/50 group-hover:scale-110 transition-all duration-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15 pointer-events-none" />

                    {/* Icon Glass Medallion */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-[#E67A3A] group-hover:border-[#E67A3A] transition-colors duration-300">
                      <exp.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Frosted Glass Card Content */}
                <div className="p-3 sm:p-5 md:p-6 pt-3 sm:pt-4 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#D85A17] dark:text-[#FF9E64] mb-1 truncate">
                      {exp.tag}
                    </p>
                    <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight leading-snug group-hover:text-[#E67A3A] transition-colors">
                      {exp.title}
                    </h3>
                    <p
                      style={{ color: glassStyles.descriptionColor }}
                      className="text-[11px] sm:text-sm mb-2.5 sm:mb-4 line-clamp-2 leading-relaxed"
                    >
                      {exp.description}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-[#F4E8D2]/75 mb-3 sm:mb-4 min-w-0">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E67A3A] shrink-0" />
                      <span className="truncate">{exp.location}</span>
                    </div>
                  </div>

                  {/* Booking Action Button */}
                  <div
                    style={{ borderColor: glassStyles.dividerColor }}
                    className="pt-2.5 sm:pt-4 border-t mt-auto"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(exp);
                      }}
                      className="group/btn relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#E67A3A] to-[#FF6A00] hover:from-[#FF6A00] hover:to-[#ff8524] text-white px-3 py-2 sm:px-4 sm:py-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-[#E67A3A]/25 hover:shadow-lg hover:shadow-[#FF6A00]/35 ring-1 ring-inset ring-white/20 flex items-center justify-between gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                    >
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

