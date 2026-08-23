import React, { useMemo } from 'react';
import { useRoadTrips } from '../hooks/useSupabaseData';
import { RoadTripTimeline } from '../types';
import { Calendar, MapPin, Users, Route, Bus, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface UpcomingRoadTripsProps {
  onOpenBookingModal: (destination: string, packageTitle: string) => void;
}

export const UpcomingRoadTrips: React.FC<UpcomingRoadTripsProps> = ({ onOpenBookingModal }) => {
  const { data: dbRoadTrips, isLoading } = useRoadTrips();

  const combinedRoadTrips = useMemo(() => {
    let list: RoadTripTimeline[] = [];
    if (dbRoadTrips && dbRoadTrips.length > 0) {
       list = dbRoadTrips.map(trip => ({
         id: trip.id,
         title: trip.title,
         date: 'Flexible Departure',
         location: trip.title,
         seatsRemaining: 12, // Default or real from DB if available
         totalSeats: 20, // Default or real from DB
         price: trip.price,
         route: 'Nairobi to Destination',
         vehicleType: '4x4 Luxury Safari Cruiser',
         status: 'Booking Open',
         image: trip.featured_image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
       }));
    }
    return list;
  }, [dbRoadTrips]);

  if (isLoading) {
    return (
      <section id="road-trips" className="relative py-24 bg-gradient-to-b from-[#08121B] via-[#0c1824] to-[#08121B] border-t border-[#E67A3A]/20 flex justify-center">
        <div className="w-12 h-12 border-4 border-[#E67A3A] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (combinedRoadTrips.length === 0) return null;

  return (
    <section id="road-trips" className="relative py-24 bg-gradient-to-b from-[#08121B] via-[#0c1824] to-[#08121B] border-t border-[#E67A3A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12212F] border border-[#E67A3A]/40 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-3">
            <Bus className="w-3.5 h-3.5" />
            <span>Scheduled Group Caravans</span>
          </div>
          <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-[#F4E8D2] tracking-tight">
            Upcoming <span className="text-gradient-orange">Road Trips & Expeditions</span>
          </h2>
          <p className="text-sm sm:text-base text-[#F4E8D2]/70 mt-3">
            Join our guaranteed group departures in luxury 4x4 cruisers with professional guides, fun group dynamics, and verified safety.
          </p>
        </div>

        {/* Timeline Cards Stack */}
        <div className="space-y-6">
          {combinedRoadTrips.map((trip, idx) => {
            const seatsPercent = Math.round(((trip.totalSeats - trip.seatsRemaining) / trip.totalSeats) * 100);
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-3xl glass-card border border-[#F4E8D2]/10 hover:border-[#E67A3A] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Left Thumbnail + Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                  <div className="relative w-full sm:w-44 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#08121B]/80 text-[#E67A3A] text-[10px] font-bold">
                      {trip.status}
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#E67A3A] font-semibold">
                      <span className="flex items-center gap-1 bg-[#12212F] px-3 py-1 rounded-full border border-[#E67A3A]/30">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.date}
                      </span>
                      <span className="flex items-center gap-1 text-[#F4E8D2]/80">
                        <MapPin className="w-3.5 h-3.5 text-[#E67A3A]" />
                        {trip.location}
                      </span>
                    </div>
                    <h3 className="font-['Poppins'] font-bold text-xl text-[#F4E8D2] group-hover:text-white transition-colors">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#F4E8D2]/70">
                      <Route className="w-3.5 h-3.5 text-[#E67A3A]" />
                      <span className="font-mono">{trip.route}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#F4E8D2]/60">
                      <Bus className="w-3.5 h-3.5 text-[#29492F]" />
                      <span>Fleet: {trip.vehicleType}</span>
                    </div>
                  </div>
                </div>

                {/* Right Progress & Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#F4E8D2]/10 flex-shrink-0 min-w-[220px]">
                  {/* Seats remaining bar */}
                  <div className="w-full sm:w-48 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#F4E8D2]/80">
                      <span>Seats Remaining</span>
                      <span className="text-[#E67A3A]">{trip.seatsRemaining} / {trip.totalSeats} left</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#12212F] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#29492F] via-[#E67A3A] to-[#E67A3A] rounded-full transition-all duration-1000"
                        style={{ width: `${seatsPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between lg:justify-end">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#F4E8D2]/50 block">Trip Fare</span>
                      <span className="font-['Poppins'] font-black text-2xl text-[#E67A3A]">${trip.price}</span>
                    </div>
                    <button
                      onClick={() => onOpenBookingModal(trip.location, trip.title)}
                      className="px-6 py-3 rounded-2xl font-['Poppins'] text-xs font-bold text-white bg-[#E67A3A] hover:bg-[#ff8642] shadow-lg shadow-[#E67A3A]/30 transition-all flex items-center gap-2 group-hover:translate-x-1"
                    >
                      <span>Reserve Seat</span>
                      <ArrowRight className="w-4 h-4" />
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
