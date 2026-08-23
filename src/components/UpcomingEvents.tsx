import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useEvents } from '../hooks/useSupabaseData';

const EventCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-white">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[10px] text-white/50 uppercase tracking-widest">Days</span>
      </div>
      <div className="text-white/20 font-light text-2xl">:</div>
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] text-white/50 uppercase tracking-widest">Hrs</span>
      </div>
      <div className="text-white/20 font-light text-2xl">:</div>
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-[#FF6A00]">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[10px] text-[#FF6A00]/70 uppercase tracking-widest">Min</span>
      </div>
    </div>
  );
};

export const UpcomingEvents: React.FC = () => {
  const { data: dbEvents, isLoading } = useEvents();

  if (isLoading) {
    return (
      <section id="events" className="py-24 bg-[#070707] relative border-t border-white/5 flex justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const events = dbEvents || [];

  if (events.length === 0) return null;

  return (
    <section id="events" className="py-24 bg-[#070707] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-white uppercase tracking-tight leading-none mb-4">
              Live <span className="text-[#FF6A00]">Events</span>
            </h2>
            <p className="text-white/60 text-lg">Join our exclusive upcoming adventures. Secure your spot before they sell out.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
            <span>View All Events</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {events.map((evt: any, idx: number) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col lg:flex-row gap-8 glass-panel bg-[#111111]/60 hover:bg-[#111111] p-4 rounded-3xl border border-white/5 hover:border-[#FF6A00]/30 transition-colors group"
            >
              <div className="lg:w-1/3 h-64 lg:h-auto rounded-2xl overflow-hidden relative shrink-0">
                <img loading="lazy" src={evt.image_url || 'https://images.unsplash.com/photo-1549468057-5ce754b4fa26?auto=format&fit=crop&w=800&q=80'} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6A00] text-white text-xs font-bold uppercase tracking-widest rounded-full">
                  {evt.status || 'Upcoming'}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center p-4 lg:p-8">
                <h3 className="font-['Poppins'] font-bold text-3xl text-white uppercase tracking-wide mb-6 group-hover:text-[#FF6A00] transition-colors">{evt.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#FF6A00]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Date</div>
                      <div className="font-medium text-sm">{new Date(evt.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#FF6A00]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Location</div>
                      <div className="font-medium text-sm">{evt.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#FF6A00]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Availability</div>
                      <div className="font-medium text-sm">{evt.total_capacity} Seats</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
                  <EventCountdown targetDate={evt.event_date} />
                  
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-black bg-[#FF6A00] hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-[#FF6A00]/20 flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0">
                    <span>Book Ticket</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
