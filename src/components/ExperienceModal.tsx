import React, { useState } from 'react';
import { ExperienceItem } from '../types';
import { X, CheckCircle, XCircle, Clock, MapPin, Users, Calendar, Star, ShieldCheck, ChevronRight, Award, Compass, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExperienceModalProps {
  experience: ExperienceItem | null;
  onClose: () => void;
  onOpenBookingModal: (destination: string, packageTitle: string) => void;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  experience,
  onClose,
  onOpenBookingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'gallery' | 'inclusions'>('itinerary');
  const [selectedImage, setSelectedImage] = useState<string>('');

  

  
  const [cachedExperience, setCachedExperience] = React.useState<ExperienceItem | null>(null);
  React.useEffect(() => {
    if (experience) {
      setCachedExperience(experience);
    }
  }, [experience]);

  const displayExp = experience || cachedExperience;
  const currentHeroImage = selectedImage || displayExp?.image;


  return (
    <AnimatePresence>
      {displayExp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08121B]/90 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#0d1c29] border border-[#E67A3A]/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-2 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Top Header Banner */}
          <div className="relative h-48 sm:h-64 md:h-80 flex-shrink-0">
            <img
              src={currentHeroImage}
              alt={displayExp.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c29] via-[#0d1c29]/40 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-[#08121B]/80 text-[#F4E8D2] hover:bg-[#E67A3A] hover:text-white transition-colors border border-[#F4E8D2]/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Metadata Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#E67A3A] text-white text-[10px] font-bold uppercase tracking-wider">
                  {displayExp.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#29492F] text-[#F4E8D2] text-[10px] font-bold">
                  {displayExp.difficulty} Level
                </span>
                <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-[#08121B]/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{displayExp.rating} ({displayExp.reviewsCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-['Poppins'] font-black text-2xl sm:text-3xl text-white tracking-tight">
                {displayExp.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#F4E8D2]/80 mt-1 font-medium">
                <span className="flex items-center gap-1 text-[#E67A3A]">
                  <MapPin className="w-3.5 h-3.5" />
                  {displayExp.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#E67A3A]" />
                  {displayExp.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E67A3A]" />
                  Next Departure: {displayExp.nextDeparture}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Tab Controls */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[#F4E8D2]/10 bg-[#08121B]/80 flex-shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-3 sm:py-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-[#E67A3A] text-white shadow-md'
                  : 'text-[#F4E8D2]/70 hover:text-white'
              }`}
            >
              Day-by-Day Itinerary
            </button>

            <button
              onClick={() => setActiveTab('inclusions')}
              className={`px-4 py-3 sm:py-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
                activeTab === 'inclusions'
                  ? 'bg-[#E67A3A] text-white shadow-md'
                  : 'text-[#F4E8D2]/70 hover:text-white'
              }`}
            >
              What's Included
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-3 sm:py-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[#E67A3A] text-white shadow-md'
                  : 'text-[#F4E8D2]/70 hover:text-white'
              }`}
            >
              Photo Gallery ({displayExp.gallery?.length || 0})
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E67A3A] mb-2">Trip Overview</h4>
                  <p className="text-sm text-[#F4E8D2]/90 leading-relaxed font-normal">
                    {displayExp.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E67A3A] mb-3">Key Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {displayExp.highlights?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/10 text-xs text-[#F4E8D2]">
                        <Award className="w-4 h-4 text-[#E67A3A] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Days */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E67A3A] mb-4">Detailed Daily Schedule</h4>
                  <div className="space-y-4">
                    {displayExp.itinerary?.map((day) => (
                      <div key={day.day} className="p-4 rounded-2xl bg-[#12212F]/80 border border-[#F4E8D2]/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-[#E67A3A]/20 border border-[#E67A3A] text-[#E67A3A] text-xs font-bold">
                            Day {day.day}
                          </span>
                          <span className="text-[11px] font-medium text-[#F4E8D2]/60">
                            Meals: {day.mealsIncluded}
                          </span>
                        </div>
                        <h5 className="font-['Poppins'] font-bold text-sm text-[#F4E8D2]">
                          {day.title}
                        </h5>
                        <p className="text-xs text-[#F4E8D2]/70 leading-relaxed">
                          {day.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {day.activities?.map((act, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#08121B] text-[#E67A3A] border border-[#E67A3A]/30">
                              • {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Included */}
                <div className="p-5 rounded-2xl bg-[#12212F]/80 border border-emerald-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Included in Price</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#F4E8D2]/90">
                    {displayExp.included?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Not Included */}
                <div className="p-5 rounded-2xl bg-[#12212F]/80 border border-rose-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>Not Included</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#F4E8D2]/70">
                    {displayExp.notIncluded?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayExp.gallery?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative rounded-2xl overflow-hidden h-36 border-2 transition-all ${
                      currentHeroImage === img ? 'border-[#E67A3A] scale-95 shadow-lg' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img loading="lazy" src={img} alt="Gallery view" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Sticky Reservation Bar */}
          <div className="p-4 sm:p-6 bg-[#08121B] border-t border-[#F4E8D2]/10 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4E8D2]/50 block">Investment Per Person</span>
              <div className="flex items-baseline gap-2">
                <span className="font-['Poppins'] font-black text-3xl text-[#E67A3A]">${displayExp.price}</span>
                <span className="text-xs text-[#F4E8D2]/60">All taxes & permits included</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`https://wa.me/254700000000?text=Hi!%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(displayExp.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-[#29492F] text-xs font-semibold text-white hover:bg-[#345e3c] transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-[#E67A3A]" />
                <span className="hidden sm:inline">Inquire on</span> WhatsApp
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenBookingModal(displayExp.location, displayExp.title);
                }}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl font-['Poppins'] text-xs font-bold text-white bg-[#E67A3A] hover:bg-[#ff843d] shadow-lg shadow-[#E67A3A]/30 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Reserve Seat Now</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
