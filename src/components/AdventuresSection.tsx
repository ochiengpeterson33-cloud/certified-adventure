import React from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { usePackages } from '../hooks/useSupabaseData';

export const AdventuresSection: React.FC<{ onOpenBookingModal: () => void }> = ({ onOpenBookingModal }) => {
  const { data: dbPackages, isLoading } = usePackages();

  if (isLoading) {
    return (
      <section id="packages" className="py-24 bg-[#070707] relative border-t border-white/5 flex justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const packages = dbPackages || [];

  if (packages.length === 0) return null;

  return (
    <section id="packages" className="py-24 bg-[#070707] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-white uppercase tracking-tight leading-none mb-4">
              Choose Your <br/><span className="text-[#FF6A00]">Next Adventure</span>
            </h2>
            <p className="text-white/60 text-lg">Curated premium experiences designed for thrill-seekers and luxury travelers.</p>
          </div>
          <button className="min-h-[44px] min-w-[44px] hidden md:flex items-center gap-2 text-white hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((adv, idx) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative rounded-3xl overflow-hidden glass-panel bg-[#111111]/60 hover:bg-[#111111] transition-all duration-500 border border-white/5 hover:border-[#FF6A00]/30"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img loading="lazy" 
                  src={adv.image_url || 'https://images.unsplash.com/photo-1549468057-5ce754b4fa26?auto=format&fit=crop&w=800&q=80'} 
                  alt={adv.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[#FF6A00] font-bold font-['Poppins']">${adv.price}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-['Poppins'] font-bold text-2xl text-white mb-2 uppercase group-hover:text-[#FF6A00] transition-colors">{adv.title}</h3>
                <p className="text-white/60 text-sm mb-6 line-clamp-2">{adv.description}</p>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <Clock className="w-4 h-4 text-[#FF6A00]" />
                    <span>{adv.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <Users className="w-4 h-4 text-[#FF6A00]" />
                    <span>{adv.total_seats} Seats</span>
                  </div>
                </div>

                <button 
                  onClick={onOpenBookingModal}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-[#FF6A00] transition-all duration-300 border border-white/10 hover:border-transparent flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
