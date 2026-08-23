import React, { useState, useMemo } from 'react';
import { ExperienceItem, ExperienceCategory } from '../types';
import { usePackages } from '../hooks/useSupabaseData';
import { Star, Clock, MapPin, Users, Compass, Eye, CalendarCheck, ShieldCheck, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PopularExperiencesProps {
  onSelectExperience: (item: ExperienceItem) => void;
  onOpenBookingModal: (destination?: string, packageTitle?: string) => void;
  filterDestination?: string;
  filterType?: string;
}

export const PopularExperiences: React.FC<PopularExperiencesProps> = ({
  onSelectExperience,
  onOpenBookingModal,
  filterDestination = '',
  filterType = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(filterType || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(filterDestination || '');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');

  const { data: dbPackages, isLoading } = usePackages();

  const combinedExperiences = useMemo(() => {
    let list: ExperienceItem[] = [];
    if (dbPackages && dbPackages.length > 0) {
       const mappedPackages: ExperienceItem[] = dbPackages.map(pkg => ({
         id: pkg.id,
         title: pkg.title,
         category: 'Tours',
         tagline: pkg.description || 'Discover this amazing package.',
         location: pkg.title,
         region: 'Kenya',
         duration: `${pkg.duration_days} Days`,
         price: pkg.price,
         rating: 5.0,
         reviewsCount: 12,
         seatsRemaining: 8,
         totalSeats: 15,
         nextDeparture: 'Flexible',
         image: pkg.featured_image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
         gallery: pkg.featured_image ? [pkg.featured_image] : [],
         description: pkg.description || '',
         highlights: [],
         difficulty: 'Moderate',
         included: [],
         notIncluded: [],
         itinerary: [],
         featured: pkg.is_featured
       }));
       list = [...mappedPackages, ...list];
    }
    return list;
  }, [dbPackages]);

  const categories: ExperienceCategory[] = [
    'All',
    'Road Trips',
    'Adventures',
    'Tours',
    'Travel Packages',
    'Weekend Escapes',
    'Camping',
    'Hiking',
  ];

  const filteredExperiences = combinedExperiences.filter((exp) => {
    const matchesCategory =
      selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <section id="packages" className="relative py-24 bg-[#08121B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12212F] border border-[#E67A3A]/40 text-[#E67A3A] text-xs font-bold uppercase tracking-widest mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Unforgettable Journeys</span>
            </div>
            <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-[#F4E8D2] tracking-tight">
              Popular <span className="text-gradient-orange">Adventures & Packages</span>
            </h2>
            <p className="text-sm sm:text-base text-[#F4E8D2]/70 mt-2 max-w-xl">
              Handcrafted overland road trips, luxury wildlife safaris, and mountain trekking expeditions designed for comfort and style.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#E67A3A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip or place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-xs font-medium text-[#F4E8D2] placeholder-[#F4E8D2]/40 focus:outline-none focus:border-[#E67A3A] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#E67A3A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high')}
                className="py-2.5 px-3 rounded-2xl bg-[#12212F] border border-[#F4E8D2]/20 text-xs font-medium text-[#F4E8D2] focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-[#E67A3A] text-white shadow-lg shadow-[#E67A3A]/30 scale-105'
                    : 'bg-[#12212F]/80 border border-[#F4E8D2]/10 text-[#F4E8D2]/70 hover:border-[#E67A3A]/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence >
            {filteredExperiences.map((exp) => (
              <motion.div
                key={exp.id}

                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group relative rounded-3xl glass-card border border-[#F4E8D2]/10 hover:border-[#E67A3A]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl"
              >
                {/* Top Image Banner */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08121B] via-transparent to-black/30" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#08121B]/80 backdrop-blur-md border border-[#E67A3A]/50 text-[#E67A3A] text-[11px] font-bold uppercase tracking-wider">
                    {exp.category}
                  </div>

                  {/* Seats Remaining Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#29492F]/90 backdrop-blur-md text-[#F4E8D2] text-[11px] font-bold flex items-center gap-1.5 shadow">
                    <Users className="w-3 h-3 text-[#E67A3A]" />
                    <span>{exp.seatsRemaining} Seats Left</span>
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#08121B]/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{exp.rating}</span>
                    <span className="text-[#F4E8D2]/60 font-normal">({exp.reviewsCount})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location & Duration */}
                    <div className="flex items-center justify-between text-xs text-[#F4E8D2]/70 mb-2 font-medium">
                      <span className="flex items-center gap-1 text-[#E67A3A]">
                        <MapPin className="w-3.5 h-3.5" />
                        {exp.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F4E8D2]/50" />
                        {exp.duration}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-['Poppins'] font-bold text-lg text-[#F4E8D2] group-hover:text-white transition-colors line-clamp-2 mb-2">
                      {exp.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs text-[#F4E8D2]/70 line-clamp-2 mb-4 leading-relaxed">
                      {exp.tagline}
                    </p>

                    {/* Highlights Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {exp.highlights.slice(0, 2).map((h, i) => (
                        <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-[#12212F] text-[#F4E8D2]/80 border border-[#F4E8D2]/10">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div className="pt-4 border-t border-[#F4E8D2]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4E8D2]/50 block">Per Person</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-['Poppins'] font-black text-2xl text-[#E67A3A]">${exp.price}</span>
                        {exp.originalPrice && (
                          <span className="text-xs text-[#F4E8D2]/40 line-through">${exp.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectExperience(exp)}
                        className="p-2.5 rounded-xl bg-[#12212F] border border-[#F4E8D2]/20 text-[#F4E8D2] hover:border-[#E67A3A] hover:text-[#E67A3A] transition-colors"
                        title="View Itinerary & Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenBookingModal(exp.location, exp.title)}
                        className="px-4 py-2.5 rounded-xl font-['Poppins'] text-xs font-bold text-white bg-[#E67A3A] hover:bg-[#ff843d] shadow-md shadow-[#E67A3A]/30 transition-all flex items-center gap-1.5"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#12212F]/40 rounded-3xl border border-[#F4E8D2]/10">
            <Compass className="w-12 h-12 text-[#E67A3A] mx-auto mb-3 animate-bounce" />
            <h3 className="font-['Poppins'] font-bold text-lg text-[#F4E8D2]">No matching adventures found</h3>
            <p className="text-xs text-[#F4E8D2]/60 mt-1 mb-4">Try adjusting your search terms or selecting 'All' categories.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-[#E67A3A] text-xs font-bold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
