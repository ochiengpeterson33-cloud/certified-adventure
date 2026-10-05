import React, { useState } from 'react';
import { X, CheckCircle2, Compass, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useEvents } from '../hooks/useSupabaseData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  packageTitle?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  destination = 'Maasai Mara',
  packageTitle = 'Custom Luxury Trip',
}) => {
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const activeEvent = events && events.length > 0 ? events[0] : null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    return activeEvent?.event_date?.split('T')[0] || new Date().toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update date and reset submission state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (activeEvent?.event_date) {
        setTravelDate(activeEvent.event_date.split('T')[0]);
      } else {
        setTravelDate(new Date().toISOString().split('T')[0]);
      }
      setSubmitted(false);
      setErrorMsg('');
    }
  }, [isOpen, activeEvent]);

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
        notes: `Package: ${packageTitle} | Destination: ${destination}\n${notes}`,
        event_id: activeEvent?.id,
      });

      if (error) throw error;

      setSubmitted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
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
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08121B]/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-[#0d1c29] border border-[#E67A3A]/40 rounded-3xl shadow-2xl overflow-hidden z-10 text-left my-8 p-6 sm:p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-full bg-[#12212F] text-[#F4E8D2] hover:bg-[#E67A3A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#E67A3A]/20 text-[#E67A3A] border border-[#E67A3A] text-[10px] font-bold uppercase">
                  {packageTitle?.toLowerCase().includes('trip') || packageTitle?.toLowerCase().includes('event') || packageTitle?.toLowerCase().includes('hike') ? 'Event Ticket' : 'Adventure Reservation'}
                </span>
                <h3 className="font-['Poppins'] font-bold text-2xl text-white mt-2">
                  Reserve: {packageTitle || activeEvent?.title || 'Certified Experience'}
                </h3>
                <p className="text-base text-[#F4E8D2]/70 mt-1">
                  {destination ? `Location: ${destination}` : 'Travel in Comfort & Style with Certified Adventures.'}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {!activeEvent && !packageTitle && !isLoadingEvents ? (
                <div className="bg-[#E67A3A]/10 border border-[#E67A3A]/20 text-[#F4E8D2] p-6 rounded-2xl text-center">
                  <Calendar className="w-12 h-12 text-[#E67A3A] mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">No Active Events</p>
                  <p className="text-sm text-[#F4E8D2]/70">There are currently no active events available for booking.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mwangi Wachira"
                    className="w-full px-4 py-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mwangi@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A]">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 711 000 000"
                      className="w-full px-4 py-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A]">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A]">Travelers / Tickets ({guests})</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">Additional Request (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special diet, pickup location, questions..."
                    className="w-full p-3 rounded-2xl bg-[#08121B] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-['Poppins'] text-xs font-bold text-white bg-[#E67A3A] hover:bg-[#ff843d] shadow-lg shadow-[#E67A3A]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming...' : 'Confirm Reservation / Ticket'}</span>
                </button>
              </form>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#E67A3A] mx-auto animate-bounce" />
              <h3 className="font-['Poppins'] font-bold text-xl text-white">Booking Sent!</h3>
              <p className="text-base text-[#F4E8D2]/80">
                Thank you {fullName}! We have received your booking inquiry for {packageTitle}. Our team will contact you on {phone} within 30 minutes.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#E67A3A] text-xs font-bold text-white"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </div>
      </div>
      )}
    </AnimatePresence>
  );
};
