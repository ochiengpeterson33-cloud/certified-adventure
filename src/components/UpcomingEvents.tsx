import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Ban } from 'lucide-react';
import { motion } from 'motion/react';
import { useEvents } from '../hooks/useSupabaseData';

const EventCountdown: React.FC<{ targetDate: string; isSoldOut?: boolean }> = ({ targetDate, isSoldOut = false }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [expired, setExpired] = useState(() => isSoldOut || +new Date(targetDate) <= +new Date());

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0 && !isSoldOut) {
        setExpired(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [targetDate, isSoldOut]);

  if (expired) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
        <Ban className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        <span className="font-['Poppins'] font-black text-sm uppercase tracking-widest text-red-600 dark:text-red-400">
          Sold Out
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-slate-900 dark:text-white">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest">Days</span>
      </div>
      <div className="text-slate-300 dark:text-white/20 font-light text-2xl">:</div>
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-slate-900 dark:text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest">Hrs</span>
      </div>
      <div className="text-slate-300 dark:text-white/20 font-light text-2xl">:</div>
      <div className="flex flex-col items-center">
        <span className="font-['Poppins'] font-black text-2xl text-[#FF6A00]">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[10px] text-[#FF6A00]/80 dark:text-[#FF6A00]/70 uppercase tracking-widest">Min</span>
      </div>
    </div>
  );
};

interface UpcomingEventsProps {
  onOpenBookingModal?: (destination: string, packageTitle: string) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ onOpenBookingModal }) => {
  const { data: dbEvents, isLoading } = useEvents();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section id="events" className="py-24 bg-[#FAF9F6] dark:bg-[#070707] relative border-t border-slate-200 dark:border-white/5 flex justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const events = dbEvents || [];

  if (events.length === 0) return null;

  return (
    <section id="events" className="py-24 bg-[#FAF9F6] dark:bg-[#070707] relative border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-4">
              Live <span className="text-[#FF6A00]">Events</span>
            </h2>
            <p className="text-slate-600 dark:text-white/60 text-lg">Join our exclusive upcoming adventures. Secure your spot before they sell out.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-slate-800 dark:text-white hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
            <span>View All Events</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {events.map((evt: any, idx: number) => {
            const eventTime = evt.event_date ? new Date(evt.event_date).getTime() : NaN;
            const isOutdated = !Number.isNaN(eventTime) && eventTime <= now;
            const isSoldOut = isOutdated || evt.status?.toLowerCase() === 'sold out' || evt.total_capacity === 0;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`flex flex-col lg:flex-row gap-8 glass-panel bg-white dark:bg-[#111111]/60 p-4 rounded-3xl border shadow-sm transition-all group ${
                  isSoldOut
                    ? 'border-slate-200/80 dark:border-white/5 opacity-90'
                    : 'border-slate-200 dark:border-white/5 hover:border-[#FF6A00]/40 dark:hover:bg-[#111111] hover:shadow-xl'
                }`}
              >
                <div className="lg:w-1/3 h-64 lg:h-auto rounded-2xl overflow-hidden relative shrink-0">
                  <img
                    loading="lazy"
                    src={evt.image_url || 'https://images.unsplash.com/photo-1549468057-5ce754b4fa26?auto=format&fit=crop&w=800&q=80'}
                    alt={evt.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSoldOut
                        ? 'grayscale-[55%] brightness-75'
                        : 'group-hover:scale-105 filter brightness-95 dark:brightness-90'
                    }`}
                  />
                  <div
                    className={`absolute top-4 left-4 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest rounded-full shadow-md ${
                      isSoldOut
                        ? 'bg-red-600 text-white'
                        : 'bg-[#FF6A00] text-white'
                    }`}
                  >
                    {isSoldOut ? 'Sold Out' : (evt.status || 'Upcoming')}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center p-4 lg:p-8">
                  <h3 className={`font-['Poppins'] font-bold text-3xl uppercase tracking-wide mb-6 transition-colors ${
                    isSoldOut
                      ? 'text-slate-600 dark:text-white/70'
                      : 'text-slate-900 dark:text-white group-hover:text-[#FF6A00]'
                  }`}>
                    {evt.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-4 text-slate-700 dark:text-white/80">
                      <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-[#FF6A00]" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Date</div>
                        <div className="font-medium text-sm">{new Date(evt.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-slate-700 dark:text-white/80">
                      <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#FF6A00]" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Location</div>
                        <div className="font-medium text-sm">{evt.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-slate-700 dark:text-white/80">
                      <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#FF6A00]" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Availability</div>
                        <div className={`font-bold text-sm ${isSoldOut ? 'text-red-600 dark:text-red-400 uppercase tracking-wider' : ''}`}>
                          {isSoldOut ? 'Sold Out' : `${evt.total_capacity ?? 'Open'} ${evt.total_capacity ? 'Seats' : ''}`.trim()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
                    <EventCountdown targetDate={evt.event_date} isSoldOut={isSoldOut} />
                    
                    {isSoldOut ? (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-slate-500 dark:text-white/40 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 flex items-center justify-center gap-2 cursor-not-allowed select-none"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Sold Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenBookingModal) {
                            onOpenBookingModal(evt.location || 'Event Venue', evt.title);
                          }
                        }}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-white dark:text-black bg-[#FF6A00] hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-lg shadow-[#FF6A00]/20 flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                      >
                        <span>Book Ticket</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
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
