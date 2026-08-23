import React, { useMemo } from 'react';
import { useDestinations } from '../hooks/useSupabaseData';
import { Destination } from '../types';
import { MapPin, Compass, ArrowUpRight, Calendar, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface DestinationsGridProps {
  onSelectDestination: (destName: string) => void;
}

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({ onSelectDestination }) => {
  const { data: dbDestinations } = useDestinations();

  const combinedDestinations = useMemo(() => {
    let list: Destination[] = [];
    if (dbDestinations && dbDestinations.length > 0) {
       const mappedDestinations: Destination[] = dbDestinations.map(d => ({
         id: d.id,
         name: d.name,
         tagline: d.description || 'Explore this amazing destination',
         region: d.county || d.country || 'Kenya',
         image: d.hero_image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
         packageCount: 5,
         bestTime: 'July - October',
         highlight: 'Wildlife & Scenery',
         rating: 4.9,
         popularFor: ['Safaris', 'Photography']
       }));
       list = [...mappedDestinations, ...list];
    }
    return list;
  }, [dbDestinations]);

  return (
    <section id="destinations" className="relative py-24 bg-[#08121B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12212F] border border-[#E67A3A]/40 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Iconic Kenya Destinations</span>
            </div>
            <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-[#F4E8D2] tracking-tight">
              Explore Our <span className="text-gradient-orange">Featured Destinations</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#F4E8D2]/70 max-w-md">
            From savannah grasslands and snow-capped peaks to pristine coral reefs. Click any destination to filter tailored packages.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {combinedDestinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              onClick={() => onSelectDestination(dest.name)}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer border border-[#F4E8D2]/15 hover:border-[#E67A3A] transition-all duration-500 shadow-xl ${
                idx === 0 || idx === 3 ? 'lg:col-span-2 h-80 sm:h-96' : 'h-80 sm:h-96'
              }`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90 contrast-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08121B] via-[#08121B]/30 to-transparent" />

              {/* Package Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#08121B]/80 backdrop-blur-md border border-[#E67A3A]/40 text-[#E67A3A] text-[11px] font-bold">
                {dest.packageCount} Available Packages
              </div>

              {/* Arrow Indicator */}
              <div className="absolute top-4 right-4 p-2.5 rounded-full bg-[#08121B]/70 backdrop-blur-md text-[#F4E8D2] group-hover:bg-[#E67A3A] group-hover:text-white transition-all transform group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{dest.rating} Rating</span>
                  <span className="text-[#F4E8D2]/50 font-normal">• {dest.region}</span>
                </div>

                <h3 className="font-['Poppins'] font-bold text-2xl text-white group-hover:text-[#E67A3A] transition-colors mb-1">
                  {dest.name}
                </h3>

                <p className="text-xs text-[#F4E8D2]/80 line-clamp-1 mb-3">
                  {dest.tagline}
                </p>

                <div className="flex items-center gap-2 text-[10px] font-medium text-[#F4E8D2]/70">
                  <Calendar className="w-3 h-3 text-[#E67A3A]" />
                  <span>Best Time: {dest.bestTime}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
