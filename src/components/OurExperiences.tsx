import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bus, Map, Heart, Compass, Users, Car, Calendar, Sparkles } from 'lucide-react';
import { useHomepageExperiences } from '../hooks/useSupabaseData';

interface ExperienceData {
  id: string;
  title: string;
  location: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  tag: string;
}

const experiences: ExperienceData[] = [
  {
    id: 'nganya',
    title: 'Nganya Experience',
    location: 'Nairobi City & Street Culture',
    description: "Ride Nairobi's most iconic matatus with music, lights and street culture.",
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tag: 'Culture & Vibe',
  },
  {
    id: 'roadtrips',
    title: 'Road Trips & Adventures',
    location: 'Rift Valley & Scenic Escapes',
    description: 'Weekend escapes and unforgettable destinations across Kenya.',
    icon: Map,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    tag: 'Adventure',
  },
  {
    id: 'weddings',
    title: 'Weddings & Ruracio Transport',
    location: 'Nairobi & Countrywide',
    description: 'Comfortable and stylish transport for special occasions and weddings.',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    tag: 'Special Events',
  },
  {
    id: 'safari',
    title: 'Safari Tours',
    location: 'Maasai Mara & Amboseli',
    description: 'Guided wildlife adventures and game drives across Kenya.',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    tag: 'Wildlife',
  },
  {
    id: 'coaster',
    title: 'Coaster & Group Hire',
    location: 'Kenya Nationwide Charter',
    description: 'Perfect for schools, churches, corporates, retreats and group events.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tag: 'Group Hire',
  },
  {
    id: 'private',
    title: 'Private Car Hire',
    location: 'Nairobi & Executive Travel',
    description: 'Comfortable executive transport and chauffeurs for individuals and families.',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
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

interface OurExperiencesProps {
  onOpenBookingModal?: (destination?: string, packageTitle?: string) => void;
}

export const OurExperiences: React.FC<OurExperiencesProps> = ({ onOpenBookingModal }) => {
  const { data: dynamicImages } = useHomepageExperiences();

  const handleBook = (exp: ExperienceData) => {
    onOpenBookingModal?.(exp.location, exp.title);
  };

  return (
    <section id="experiences" className="py-24 bg-[#08121B] relative overflow-hidden font-['Poppins'] border-t border-[#E67A3A]/20">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#E67A3A]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E67A3A]/10 border border-[#E67A3A]/30 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#E67A3A]" />
            Signature Travel Styles
          </div>
          <h2 className="font-black text-[clamp(2.25rem,4vw+1rem,4.5rem)] text-[#F4E8D2] uppercase tracking-tighter leading-none mb-6">
            Explore <span className="text-gradient-orange">Our Experiences</span>
          </h2>
          <p className="text-[#F4E8D2]/70 text-lg leading-relaxed">
            Choose your favourite adventure and reserve your customized experience instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {experiences.map((exp, idx) => {
            const imgUrl = dynamicImages?.[exp.id] || exp.image;
            return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => handleBook(exp)}
              className="group relative rounded-3xl overflow-hidden glass-card border border-[#F4E8D2]/10 hover:border-[#E67A3A]/50 transition-all duration-500 shadow-xl flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-[#E67A3A]/10"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                {dynamicImages?.[exp.id + '_video'] ? (
                  <ExperienceVideo src={dynamicImages[exp.id + '_video']} />
                ) : (
                  <img 
                    src={imgUrl} 
                    alt={exp.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08121B] via-[#08121B]/60 to-transparent" />
                
                {/* Category tag */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-[#F4E8D2] border border-white/10 uppercase tracking-wider">
                    {exp.tag}
                  </span>
                </div>

                {/* Icon Badge */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:bg-[#E67A3A] transition-colors duration-300">
                  <exp.icon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="p-6 sm:p-7 relative -mt-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-[#E67A3A] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-[#F4E8D2]/70 text-sm mb-5 line-clamp-2">
                    {exp.description}
                  </p>
                </div>

                {/* Booking Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
                  <span className="text-xs font-medium text-[#F4E8D2]/60 flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-[#E67A3A] shrink-0" />
                    <span className="truncate">{exp.location}</span>
                  </span>
                  
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBook(exp);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67A3A] hover:bg-[#FF6A00] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md shadow-[#E67A3A]/20 shrink-0 group-hover:bg-[#FF6A00]"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
