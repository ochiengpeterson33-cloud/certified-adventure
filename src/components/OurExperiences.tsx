import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bus, Map, Heart, Compass, Users, Car } from 'lucide-react';
import { useHomepageExperiences } from '../hooks/useSupabaseData';

const experiences = [
  {
    id: 'nganya',
    title: 'Nganya Experience',
    description: "Ride Nairobi's most iconic matatus with music, lights and street culture.",
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'roadtrips',
    title: 'Road Trips & Adventures',
    description: 'Weekend escapes and unforgettable destinations.',
    icon: Map,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'weddings',
    title: 'Weddings & Ruracio Transport',
    description: 'Comfortable and stylish transport for special occasions.',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'safari',
    title: 'Safari Tours',
    description: 'Guided wildlife adventures across Kenya.',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coaster',
    title: 'Coaster & Group Hire',
    description: 'Perfect for schools, churches, corporates and events.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80', // Better group hire image if possible, will find generic for now
  },
  {
    id: 'private',
    title: 'Private Car Hire',
    description: 'Comfortable executive transport for individuals and families.',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
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

export const OurExperiences: React.FC = () => {
  const { data: dynamicImages } = useHomepageExperiences();
  return (
    <section className="py-24 bg-[#08121B] relative overflow-hidden font-['Poppins'] border-t border-[#E67A3A]/20">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#E67A3A]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-black text-[clamp(2.25rem,4vw+1rem,4.5rem)] text-[#F4E8D2] uppercase tracking-tighter leading-none mb-6">
            Explore <span className="text-gradient-orange">Our Experiences</span>
          </h2>
          <p className="text-[#F4E8D2]/70 text-lg leading-relaxed">
            Choose the adventure that fits your vibe.
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
              className="group relative rounded-3xl overflow-hidden glass-card border border-[#F4E8D2]/10 hover:border-[#E67A3A]/50 transition-all duration-500 shadow-xl"
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
                
                {/* Icon Badge */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:bg-[#E67A3A] transition-colors duration-300">
                  <exp.icon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="p-6 sm:p-8 relative -mt-10">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-[#E67A3A] transition-colors">{exp.title}</h3>
                <p className="text-[#F4E8D2]/70 text-sm mb-6 line-clamp-2">
                  {exp.description}
                </p>
                <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#E67A3A] group-hover:text-white transition-colors">
                  Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
