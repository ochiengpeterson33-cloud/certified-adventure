import React, { useState } from 'react';
import { Calendar, Users, MapPin, DollarSign, Compass, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

interface LuxuryBookingSectionProps {
  initialDestination?: string;
  initialPackageTitle?: string;
}

export const LuxuryBookingSection: React.FC<LuxuryBookingSectionProps> = ({
  initialDestination = '',
  initialPackageTitle = '',
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState(initialDestination || 'Maasai Mara');
  const [travelDate, setTravelDate] = useState('2026-08-20');
  const [guests, setGuests] = useState(2);
  const [travelType, setTravelType] = useState('Road Trips');
  const [budgetPerPerson, setBudgetPerPerson] = useState(450);
  const [specialRequests, setSpecialRequests] = useState(initialPackageTitle ? `Inquiring for package: ${initialPackageTitle}` : '');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0];
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

      const { error } = await supabase.from('bookings').insert({
        first_name: firstName || 'Unknown',
        last_name: lastName || 'Unknown',
        email,
        phone,
        date: travelDate,
        guests,
        notes: `Budget: $${budgetPerPerson}/person | Type: ${travelType} | Destination: ${destination}\n${specialRequests}`,
      });

      if (error) throw error;

      setSubmitted(true);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E67A3A', '#29492F', '#F4E8D2', '#FFFFFF'],
        });
      } catch {
        // ignore
      }
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
      setErrorMsg(`Booking failed: ${errorMessage}. Please check if Supabase is connected and schema is applied.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-now" className="relative py-24 bg-[#08121B] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-[600px] h-[600px] bg-[#E67A3A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12212F] border border-[#E67A3A]/40 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Instant Reservation Concierge</span>
          </div>
          <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-[#F4E8D2] tracking-tight">
            Book Your <span className="text-gradient-orange">Luxury Adventure</span>
          </h2>
          <p className="text-sm text-[#F4E8D2]/70 mt-2">
            Fill in your preferred dates and group size. Our concierge team will confirm availability within 30 minutes with an official quote.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-[#E67A3A]/40 shadow-2xl relative">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] placeholder-[#F4E8D2]/40 focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] placeholder-[#F4E8D2]/40 focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] placeholder-[#F4E8D2]/40 focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Destination</span>
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A] cursor-pointer"
                  >
                    <option value="Maasai Mara" className="bg-[#08121B]">Maasai Mara National Reserve</option>
                    <option value="Diani Beach" className="bg-[#08121B]">Diani Beach Coastal Escape</option>
                    <option value="Mount Kenya" className="bg-[#08121B]">Mount Kenya Trekking Expedition</option>
                    <option value="Amboseli" className="bg-[#08121B]">Amboseli Kilimanjaro View</option>
                    <option value="Lake Naivasha" className="bg-[#08121B]">Lake Naivasha & Hell's Gate</option>
                    <option value="Samburu" className="bg-[#08121B]">Samburu Wild Reserve</option>
                    <option value="Aberdare Ranges" className="bg-[#08121B]">Aberdare Waterfall Glamping</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Travel Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                {/* Guests */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Number of Guests ({guests})</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full accent-[#E67A3A] cursor-pointer"
                  />
                </div>
              </div>

              {/* Slider Budget */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#08121B]/60 border border-[#F4E8D2]/10">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#E67A3A]">Target Budget Per Person</span>
                  <span className="font-['Poppins'] font-black text-lg text-white">${budgetPerPerson}</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={1500}
                  step={25}
                  value={budgetPerPerson}
                  onChange={(e) => setBudgetPerPerson(parseInt(e.target.value))}
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
              </div>

              {/* Special Requests */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E67A3A]">Special Requests & Preferences</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Vegetarian diet, hot air balloon safari, private Land Cruiser vehicle..."
                  className="w-full p-4 rounded-2xl bg-[#08121B]/80 border border-[#F4E8D2]/20 text-xs text-[#F4E8D2] placeholder-[#F4E8D2]/40 focus:outline-none focus:border-[#E67A3A]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-['Poppins'] text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#E67A3A] via-[#E67A3A] to-[#ff9452] shadow-xl shadow-[#E67A3A]/40 hover:shadow-[#E67A3A]/60 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
              >
                <Compass className="w-5 h-5" />
                <span>{isSubmitting ? 'Confirming...' : 'Book Adventure Now'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#29492F] border-2 border-[#E67A3A] flex items-center justify-center mx-auto text-[#F4E8D2] shadow-2xl animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-[#E67A3A]" />
              </div>

              <h3 className="font-['Poppins'] font-black text-2xl text-white">
                Reservation Request Confirmed!
              </h3>

              <p className="text-sm text-[#F4E8D2]/80 max-w-md mx-auto leading-relaxed">
                Thank you <strong className="text-[#E67A3A]">{fullName}</strong>! Our Certified Adventures travel concierge is preparing your customized itinerary for <strong className="text-[#F4E8D2]">{destination}</strong>.
              </p>

              <div className="p-4 rounded-2xl bg-[#08121B] border border-[#E67A3A]/30 max-w-md mx-auto text-xs text-[#F4E8D2]/70 font-mono">
                Booking Reference ID: <span className="text-[#E67A3A] font-bold">CA-2026-8891</span>
              </div>

              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-[#12212F] border border-[#F4E8D2]/20 text-xs font-semibold text-[#F4E8D2] hover:bg-[#E67A3A] hover:text-white transition-colors"
              >
                Book Another Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
