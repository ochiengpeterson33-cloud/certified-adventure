import React, { useState } from 'react';
import { Sparkles, Compass, MapPin, Calendar, DollarSign, Users, CheckCircle2, ArrowRight, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface CustomTripBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal: (destination: string, packageTitle: string) => void;
}

export const CustomTripBuilder: React.FC<CustomTripBuilderProps> = ({
  isOpen,
  onClose,
  onOpenBookingModal,
}) => {
  const [destination, setDestination] = useState('muraga restort pool');
  const [duration, setDuration] = useState('5 Days');
  const [guests, setGuests] = useState('2 Adults');
  const [travelStyle, setTravelStyle] = useState('Luxury Safari & Beach Relax');
  const [budgetLevel, setBudgetLevel] = useState('$500 - $1,000 / person');
  const [customNotes, setCustomNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<{
    title: string;
    overview: string;
    highlights: string[];
    days: { day: number; title: string; activities: string }[];
    estimatedCost: string;
  } | null>(null);

  

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Check if GEMINI API key is available via environment or fallback
      const envObj = (import.meta as unknown as { env?: Record<string, string> }).env;
      const apiKey = envObj?.VITE_GEMINI_API_KEY || (window as unknown as { process?: { env?: { GEMINI_API_KEY?: string } } }).process?.env?.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are the lead travel concierge for CERTIFIED ADVENTURES, Kenya's premier luxury adventure operator.
Create a customized luxury travel itinerary for:
- Destination: ${destination}
- Duration: ${duration}
- Travelers: ${guests}
- Travel Style: ${travelStyle}
- Budget: ${budgetLevel}
- Special Notes: ${customNotes}

Respond ONLY in JSON format matching this schema:
{
  "title": "Concise Catchy Luxury Tour Title",
  "overview": "2 sentence elegant overview describing comfort, Land Cruiser transport, and luxury stay",
  "highlights": ["3 to 4 bullet points"],
  "days": [
    {"day": 1, "title": "Day 1 Title", "activities": "Key day activities"},
    {"day": 2, "title": "Day 2 Title", "activities": "Key day activities"}
  ],
  "estimatedCost": "$ estimate per person"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setGeneratedItinerary(parsed);
      } else {
        // High quality bespoke smart fallback itinerary
        setTimeout(() => {
          setGeneratedItinerary({
            title: `Bespoke ${duration} ${destination} Certified Experience`,
            overview: `An exclusive tailormade luxury journey for ${guests}. Featuring private 4x4 Land Cruiser overland transport, luxury tented lodging, and certified guide services.`,
            highlights: [
              'Private 4x4 Land Cruiser with pop-up safari roof & Wi-Fi',
              'Handpicked 4-Star Luxury Lodge / Beachfront Resort Stay',
              'Dedicated KPSGA Senior Wildlife Naturalist & Driver',
              'Sundowner Cocktails & Gourmet Safari Dinners'
            ],
            days: [
              { day: 1, title: 'VIP Pick-up & Overland Journey to ' + destination, activities: 'Morning departure from Nairobi, scenic Rift Valley viewpoint stop, lodge check-in & sunset safari.' },
              { day: 2, title: 'Full Day Wildlife & Wilderness Exploration', activities: 'Sunrise game drive, bush picnic lunch overlooking wildlife hotspots, afternoon relaxation.' },
              { day: 3, title: 'Cultural Encounter & Farewell Sunrise Safari', activities: 'Morning guided nature walk, authentic Maasai village encounter, return transport.' }
            ],
            estimatedCost: budgetLevel
          });
        }, 1200);
      }
    } catch {
      // Fallback
      setGeneratedItinerary({
        title: `Customized ${duration} ${destination} Adventure`,
        overview: `A tailormade itinerary crafted with comfort, safety, and luxury transport by Certified Adventures.`,
        highlights: [
          'Executive 4x4 Safari Transport',
          'Full Board Luxury Accommodation',
          'Certified Guide & Park Permit Fees'
        ],
        days: [
          { day: 1, title: 'Arrival & Scenic Transfer', activities: 'VIP transfer and welcome dinner' },
          { day: 2, title: 'Guided Excursions & Safari', activities: 'Full day game drives and experiences' }
        ],
        estimatedCost: budgetLevel
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
          className="relative w-full max-w-3xl bg-[#0d1c29] border border-[#E67A3A]/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-2 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-[#08121B] border-b border-[#F4E8D2]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E67A3A]/20 border border-[#E67A3A] text-[#E67A3A]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-['Poppins'] font-bold text-lg text-white">
                  AI Custom Itinerary Concierge
                </h3>
                <p className="text-base text-[#F4E8D2]/60">
                  Generate a tailormade luxury tour or road trip package in seconds
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-[#12212F] text-[#F4E8D2] hover:bg-[#E67A3A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form & Result Container */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {!generatedItinerary ? (
              <form onSubmit={handleGenerateItinerary} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Destination */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Preferred Destination(s)</span>
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Maasai Mara, Diani Beach, Mt Kenya"
                      className="w-full px-4 py-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Trip Duration</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    >
                      <option className="bg-[#08121B]">2 Days Weekend Getaway</option>
                      <option className="bg-[#08121B]">3 Days Safari / Road Trip</option>
                      <option className="bg-[#08121B]">5 Days Coast & Savannah</option>
                      <option className="bg-[#08121B]">7 Days Grand Kenya Discovery</option>
                      <option className="bg-[#08121B]">10+ Days Ultimate Luxury Expedition</option>
                    </select>
                  </div>

                  {/* Travelers */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Number of Travelers</span>
                    </label>
                    <input
                      type="text"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder="e.g. 2 Adults, 2 Kids"
                      className="w-full px-4 py-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                      required
                    />
                  </div>

                  {/* Travel Style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#E67A3A] flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Travel Category / Focus</span>
                    </label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                    >
                      <option className="bg-[#08121B]">Luxury Safari & Big 5</option>
                      <option className="bg-[#08121B]">Overland Road Trip Caravan</option>
                      <option className="bg-[#08121B]">Mountain Trekking & Hiking</option>
                      <option className="bg-[#08121B]">Beach & Water Sports Escapade</option>
                      <option className="bg-[#08121B]">Corporate Team Building Retreat</option>
                    </select>
                  </div>
                </div>

                {/* Custom Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E67A3A]">
                    Special Requests or Preferences (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Prefer dietary vegetarian meals, desire sunrise hot air balloon, private 4x4 cruiser..."
                    className="w-full p-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-base text-[#F4E8D2] focus:outline-none focus:border-[#E67A3A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 rounded-2xl font-['Poppins'] text-xs font-bold text-white bg-gradient-to-r from-[#E67A3A] via-[#E67A3A] to-[#ff8c47] shadow-lg shadow-[#E67A3A]/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Crafting Your Custom Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Bespoke Itinerary</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#12212F] border border-[#E67A3A]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#E67A3A]/20 border border-[#E67A3A] text-[#E67A3A] text-[10px] font-bold uppercase">
                      Custom Concierge Result
                    </span>
                    <span className="font-['Poppins'] font-black text-xl text-[#E67A3A]">
                      {generatedItinerary.estimatedCost}
                    </span>
                  </div>

                  <h3 className="font-['Poppins'] font-bold text-xl text-white">
                    {generatedItinerary.title}
                  </h3>

                  <p className="text-base text-[#F4E8D2]/80 leading-relaxed">
                    {generatedItinerary.overview}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-[11px] font-bold text-[#E67A3A] uppercase mb-2">Highlights Included</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedItinerary.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-base text-[#F4E8D2]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Days */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#E67A3A] uppercase">Proposed Day-By-Day Schedule</h4>
                  {generatedItinerary.days.map((d) => (
                    <div key={d.day} className="p-4 rounded-xl bg-[#08121B] border border-[#F4E8D2]/10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#E67A3A] text-white text-[10px] font-bold">
                          Day {d.day}
                        </span>
                        <h5 className="text-xs font-bold text-[#F4E8D2]">{d.title}</h5>
                      </div>
                      <p className="text-base text-[#F4E8D2]/70">{d.activities}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#F4E8D2]/10">
                  <button
                    onClick={() => setGeneratedItinerary(null)}
                    className="px-4 py-3 rounded-2xl bg-[#12212F] text-xs font-semibold text-[#F4E8D2] hover:bg-[#1a2d3e]"
                  >
                    Modify Search
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenBookingModal(destination, generatedItinerary.title);
                    }}
                    className="flex-1 py-3 rounded-2xl font-['Poppins'] text-xs font-bold text-white bg-[#E67A3A] hover:bg-[#ff843d] shadow-lg shadow-[#E67A3A]/30 flex items-center justify-center gap-2"
                  >
                    <span>Request Quotation & Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
