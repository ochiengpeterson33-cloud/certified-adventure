import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGallery } from '../hooks/useSupabaseData';

interface GalleryPhoto {
  id: string;
  title: string;
  image_url: string;
  category: 'events' | 'crowd' | 'moments' | 'backstage';
  objectPosition?: string;
}

// Fallback high-fidelity photos from the project's actual assets
const FALLBACK_PHOTOS: GalleryPhoto[] = [
  {
    id: 'fe428ad4-75b3-47d3-bc6b-53b2a38d81f3',
    title: 'Park & Chill — Night Bus & Vibes',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/8volcg72k2_1785606351318.jpeg',
    category: 'events',
    objectPosition: 'center 32%',
  },
  {
    id: '015a34ce-f8f0-43ee-9274-579482d9db6a',
    title: 'Club Illumination & Sound',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/d886lc9nkgl_1785796112517.jpg',
    category: 'moments',
    objectPosition: 'center 22%',
  },
  {
    id: '253d0e4c-bd64-4b3b-bba5-5f6efb4e89dd',
    title: 'Electric Atmosphere',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/ue2mf6fgvwa_1785761176015.jpg',
    category: 'events',
    objectPosition: 'center 35%',
  },
  {
    id: '046adb01-2cfe-47ab-a424-c7c976521ff9',
    title: 'Family & Culture',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/klgln9v89k_1785607234774.png',
    category: 'crowd',
    objectPosition: 'center 25%',
  },
  {
    id: '89922e04-c66c-4fcb-8710-0809dce931f6',
    title: 'Golden Hour Memories',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/87eg0mugs2t_1785796141823.jpg',
    category: 'moments',
    objectPosition: 'center 25%',
  },
  {
    id: 'faea079c-fae0-49bf-9b92-d31b2f79b354',
    title: 'Unfiltered Stage Energy',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/0m2j2dkbw97m_1785607316446.png',
    category: 'crowd',
    objectPosition: 'center 35%',
  },
  {
    id: '1391af0e-4abd-4346-a850-ed7ff135c92e',
    title: 'Midnight Beats',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/r6jdr86hkbl_1785796250772.jpg',
    category: 'backstage',
    objectPosition: 'center 25%',
  },
  {
    id: '0a4fd2aa-2fd6-47cf-9995-33b825660237',
    title: 'Night Glow & Crowd',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/0kew69esrg8n_1785796127068.jpg',
    category: 'crowd',
    objectPosition: 'center 25%',
  },
  {
    id: 'ca96ddc5-0fca-4c78-9eb8-49c014c53bb3',
    title: 'Backstage Chronicles',
    image_url: 'https://hfhhrdnljpkqmnmvvmun.supabase.co/storage/v1/object/public/gallery-images/x1amarqnps_1785796166677.jpg',
    category: 'backstage',
    objectPosition: 'center 25%',
  },
];

type FilterCategory = 'All' | 'Events' | 'Crowd' | 'Moments' | 'Backstage';

export const GalleryMasonry: React.FC = () => {
  const { data: dbGallery } = useGallery();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState<boolean>(false);

  // Touch tracking for mobile swipe navigation in lightbox
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Combine DB photos with fallback while respecting admin updates
  const processedPhotos = useMemo(() => {
    let rawList: GalleryPhoto[] = [];

    if (dbGallery && dbGallery.length > 0) {
      rawList = dbGallery.map((item, idx) => {
        const titleLower = (item.title || '').toLowerCase();
        let cat: 'events' | 'crowd' | 'moments' | 'backstage' = 'moments';
        if (
          titleLower.includes('chill') ||
          titleLower.includes('event') ||
          titleLower.includes('bus') ||
          titleLower.includes('jav')
        ) {
          cat = 'events';
        } else if (
          titleLower.includes('fam') ||
          titleLower.includes('crowd') ||
          titleLower.includes('people') ||
          titleLower.includes('queen')
        ) {
          cat = 'crowd';
        } else if (titleLower.includes('stage') || titleLower.includes('backstage') || titleLower.includes('crew')) {
          cat = 'backstage';
        } else {
          const cats: ('events' | 'crowd' | 'moments' | 'backstage')[] = ['events', 'crowd', 'moments', 'backstage'];
          cat = cats[idx % cats.length];
        }

        let objectPosition = 'center 25%';
        if (item.image_url.includes('8volcg72k2') || titleLower.includes('park and chill')) {
          objectPosition = 'center 32%';
        } else if (item.image_url.includes('ue2mf6fgvwa') || item.image_url.includes('0m2j2dkbw97m')) {
          objectPosition = 'center 35%';
        }

        return {
          id: item.id,
          title: item.title || `Gallery Moment ${idx + 1}`,
          image_url: item.image_url,
          category: cat,
          objectPosition,
        };
      });
    } else {
      rawList = FALLBACK_PHOTOS;
    }

    // PRIORITIZE FEATURED IMAGE:
    // Prioritize the photograph showing the illuminated graffiti bus with two people in front (8volcg72k2 / PARK AND CHILL)
    const featuredBusIndex = rawList.findIndex(
      (p) =>
        p.image_url.includes('8volcg72k2') ||
        p.title.toLowerCase().includes('park and chill') ||
        p.title.toLowerCase().includes('bus')
    );

    if (featuredBusIndex > 0) {
      const [featured] = rawList.splice(featuredBusIndex, 1);
      rawList.unshift(featured);
    }

    // Ensure we have at least 7 items for the full editorial layout
    if (rawList.length < 7) {
      const existingUrls = new Set(rawList.map((p) => p.image_url));
      for (const fallback of FALLBACK_PHOTOS) {
        if (!existingUrls.has(fallback.image_url)) {
          rawList.push(fallback);
          if (rawList.length >= 7) break;
        }
      }
    }

    return rawList;
  }, [dbGallery]);

  // Filter photos based on tab selection
  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'All') return processedPhotos;
    const key = activeFilter.toLowerCase();
    const matches = processedPhotos.filter((p) => p.category === key);
    return matches.length > 0 ? matches : processedPhotos;
  }, [processedPhotos, activeFilter]);

  // The 7 centerpiece editorial slots
  const editorialSlots = useMemo(() => {
    return filteredPhotos.slice(0, 7);
  }, [filteredPhotos]);

  // Any additional photos beyond the 7
  const extraPhotos = useMemo(() => {
    return filteredPhotos.slice(7);
  }, [filteredPhotos]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
      }
    },
    [lightboxIndex, filteredPhotos.length]
  );

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, handleKeyDown]);

  const openLightboxAt = (photo: GalleryPhoto) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(idx !== -1 ? idx : 0);
  };

  // Mobile swipe handlers for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-28 bg-[#060C13] relative overflow-hidden border-t border-white/5">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#FF6A00]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-[#FF6A00]/5 rounded-full blur-[90px] sm:blur-[100px] pointer-events-none" />

      {/* 16px horizontal page padding (px-4) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            1. GALLERY HEADING AT THE TOP
            - Clean responsive typography scaling seamlessly from 320px up to 4K
            - "Energy" styled with distinct script typeface
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-5 pb-6 border-b border-white/5">
          <div className="max-w-2xl">
            {/* Small uppercase label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#FF6A00] text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3.5 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
              EVENT GALLERY
            </div>

            {/* Large heading with distinctive handwritten "Energy" */}
            <h2 className="font-['Poppins'] font-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white tracking-tight leading-[1.15] uppercase break-words">
              The Night <span className="text-[#FF6A00] font-light">•</span> The People <span className="text-[#FF6A00] font-light">•</span>{' '}
              <span className="font-['Caveat',cursive] italic font-bold text-[#FF6A00] text-[1.2em] lowercase capitalize inline-block -rotate-1 tracking-normal select-none">
                Energy
              </span>
            </h2>
          </div>

          {/* Short supporting description */}
          <div className="max-w-md lg:text-right">
            <p className="text-white/70 text-xs sm:text-sm lg:text-base font-normal leading-relaxed">
              Real moments. Unfiltered vibes. A gallery of the people, the culture and the energy that make it all happen.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. HORIZONTALLY SCROLLABLE FILTER BUTTONS (Mobile Friendly)
            - Smooth touch scrolling on mobile without creating page overflow
            ========================================================================= */}
        <div className="w-full overflow-hidden mb-7 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
            {(['All', 'Events', 'Crowd', 'Moments', 'Backstage'] as FilterCategory[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveFilter(tab);
                    setShowAllPhotos(false);
                  }}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 select-none ${
                    isActive
                      ? 'bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            MOBILE LAYOUT (< 768px):
            Hierarchical 2-column mobile architecture:
            FEATURED (Full width)
            ↓
            PHOTO 2 | PHOTO 3 (2 columns)
            ↓
            PHOTO 4 | PHOTO 5 (2 columns)
            ↓
            WIDE PHOTO (Full width)
            ↓
            PHOTO 7 (Full width)
            - 10–12px spacing between images (gap-2.5 on xs, gap-3 on sm)
            - 16px horizontal page padding
            - Consistent 16–18px rounded corners (rounded-2xl)
            - No distorted images, no horizontal page scrolling, no tiny images
            ========================================================================= */}
        <div className="grid md:hidden grid-cols-2 gap-2.5 sm:gap-3">
          {/* 1. FEATURED PHOTOGRAPH (Col-span-2: Occupies almost full available width) */}
          {editorialSlots[0] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[0])}
              className="col-span-2 h-[290px] xs:h-[330px] sm:h-[380px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl border border-white/5"
            >
              <img
                loading="eager"
                src={editorialSlots[0].image_url}
                alt={editorialSlots[0].title}
                style={{ objectPosition: editorialSlots[0].objectPosition || 'center 32%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Featured Badge */}
              <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#FF6A00] text-[10px] font-black uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3" />
                FEATURED
              </div>

              {/* Title & Category */}
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[0].category}
                </span>
                <h3 className="text-white text-lg xs:text-xl font-black uppercase tracking-tight line-clamp-1 drop-shadow-md">
                  {editorialSlots[0].title}
                </h3>
              </div>
            </div>
          )}

          {/* 2. PHOTO 2 | PHOTO 3 (2-column row) */}
          {editorialSlots[1] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[1])}
              className="col-span-1 h-[190px] xs:h-[220px] sm:h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-md border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[1].image_url}
                alt={editorialSlots[1].title}
                style={{ objectPosition: editorialSlots[1].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[#FF6A00] text-[9px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[1].category}
                </span>
                <p className="text-white text-xs xs:text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[1].title}
                </p>
              </div>
            </div>
          )}

          {editorialSlots[2] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[2])}
              className="col-span-1 h-[190px] xs:h-[220px] sm:h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-md border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[2].image_url}
                alt={editorialSlots[2].title}
                style={{ objectPosition: editorialSlots[2].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[#FF6A00] text-[9px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[2].category}
                </span>
                <p className="text-white text-xs xs:text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[2].title}
                </p>
              </div>
            </div>
          )}

          {/* 3. PHOTO 4 | PHOTO 5 (2-column row) */}
          {editorialSlots[3] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[3])}
              className="col-span-1 h-[190px] xs:h-[220px] sm:h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-md border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[3].image_url}
                alt={editorialSlots[3].title}
                style={{ objectPosition: editorialSlots[3].objectPosition || 'center 28%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[#FF6A00] text-[9px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[3].category}
                </span>
                <p className="text-white text-xs xs:text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[3].title}
                </p>
              </div>
            </div>
          )}

          {editorialSlots[4] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[4])}
              className="col-span-1 h-[190px] xs:h-[220px] sm:h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-md border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[4].image_url}
                alt={editorialSlots[4].title}
                style={{ objectPosition: editorialSlots[4].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[#FF6A00] text-[9px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[4].category}
                </span>
                <p className="text-white text-xs xs:text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[4].title}
                </p>
              </div>
            </div>
          )}

          {/* 4. WIDE PHOTO (Photo 6: Spans full width across both columns) */}
          {editorialSlots[5] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[5])}
              className="col-span-2 h-[200px] xs:h-[230px] sm:h-[260px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-lg border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[5].image_url}
                alt={editorialSlots[5].title}
                style={{ objectPosition: editorialSlots[5].objectPosition || 'center 35%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                    {editorialSlots[5].category}
                  </span>
                  <h4 className="text-white text-sm xs:text-base font-black uppercase tracking-tight line-clamp-1">
                    {editorialSlots[5].title}
                  </h4>
                </div>
                <span className="text-white/50 text-[10px] font-mono tracking-widest uppercase hidden xs:inline-block">
                  Panoramic
                </span>
              </div>
            </div>
          )}

          {/* 5. PHOTO 7 (Spans full width across both columns) */}
          {editorialSlots[6] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[6])}
              className="col-span-2 h-[200px] xs:h-[230px] sm:h-[260px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-lg border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[6].image_url}
                alt={editorialSlots[6].title}
                style={{ objectPosition: editorialSlots[6].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover active:scale-95 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[6].category}
                </span>
                <p className="text-white text-sm xs:text-base font-black uppercase tracking-tight line-clamp-1">
                  {editorialSlots[6].title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            TABLET LAYOUT (768px - 1023px):
            Refined 2-column visual hierarchy with comfortable tablet spacing
            ========================================================================= */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
          {/* Featured Large */}
          {editorialSlots[0] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[0])}
              className="col-span-2 h-[420px] relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-2xl border border-white/5"
            >
              <img
                loading="eager"
                src={editorialSlots[0].image_url}
                alt={editorialSlots[0].title}
                style={{ objectPosition: editorialSlots[0].objectPosition || 'center 32%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#FF6A00] text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                FEATURED HIGHLIGHT
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[#FF6A00] text-xs font-bold uppercase tracking-wider block mb-1">
                  {editorialSlots[0].category}
                </span>
                <h3 className="text-white text-2xl font-black uppercase tracking-tight">
                  {editorialSlots[0].title}
                </h3>
              </div>
            </div>
          )}

          {/* Grid Pairs */}
          {editorialSlots.slice(1, 5).map((photo) => (
            <div
              key={photo.id}
              onClick={() => openLightboxAt(photo)}
              className="col-span-1 h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-lg border border-white/5"
            >
              <img
                loading="lazy"
                src={photo.image_url}
                alt={photo.title}
                style={{ objectPosition: photo.objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {photo.category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {photo.title}
                </p>
              </div>
            </div>
          ))}

          {/* Wide Photo */}
          {editorialSlots[5] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[5])}
              className="col-span-2 h-[260px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-lg border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[5].image_url}
                alt={editorialSlots[5].title}
                style={{ objectPosition: editorialSlots[5].objectPosition || 'center 35%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[5].category}
                </span>
                <p className="text-white text-base font-bold uppercase tracking-tight">
                  {editorialSlots[5].title}
                </p>
              </div>
            </div>
          )}

          {/* 7th Photo */}
          {editorialSlots[6] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[6])}
              className="col-span-2 h-[260px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-lg border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[6].image_url}
                alt={editorialSlots[6].title}
                style={{ objectPosition: editorialSlots[6].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[6].category}
                </span>
                <p className="text-white text-base font-bold uppercase tracking-tight">
                  {editorialSlots[6].title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            DESKTOP LAYOUT (1024px+): Exact Editorial Grid Matching Reference Diagram
            ┌───────────────────────────────┬───────────────┬───────────────┐
            │                               │   PHOTO 2     │   PHOTO 3     │
            │        FEATURED PHOTO         ├───────────────┼───────────────┤
            │        LARGE                  │   PHOTO 4     │   PHOTO 5     │
            ├───────────────────────────────┴───────────────┼───────────────┤
            │              PHOTO 6 / WIDE                   │   PHOTO 7     │
            └───────────────────────────────────────────────┴───────────────┘
            ========================================================================= */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-3 gap-4 h-[750px] xl:h-[820px]">
          {/* PHOTO 1: LARGE FEATURED PHOTO (Col 1-2, Rows 1-2) */}
          {editorialSlots[0] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[0])}
              className="lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-2xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="eager"
                src={editorialSlots[0].image_url}
                alt={editorialSlots[0].title}
                style={{ objectPosition: editorialSlots[0].objectPosition || 'center 32%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300 opacity-60 group-hover:opacity-90 pointer-events-none" />

              {/* Featured Badge */}
              <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#FF6A00] text-xs font-black tracking-wider uppercase shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                FEATURED HIGHLIGHT
              </div>

              {/* Expand Icon */}
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-white hover:scale-110">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Title & Caption */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[#FF6A00] text-xs font-bold uppercase tracking-wider block mb-1">
                  {editorialSlots[0].category}
                </span>
                <h3 className="text-white text-xl xl:text-2xl font-black uppercase tracking-tight line-clamp-1 drop-shadow-md">
                  {editorialSlots[0].title}
                </h3>
              </div>
            </div>
          )}

          {/* PHOTO 2: Top Middle (Col 3, Row 1) */}
          {editorialSlots[1] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[1])}
              className="lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[1].image_url}
                alt={editorialSlots[1].title}
                style={{ objectPosition: editorialSlots[1].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[1].category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[1].title}
                </p>
              </div>
            </div>
          )}

          {/* PHOTO 3: Top Right (Col 4, Row 1) */}
          {editorialSlots[2] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[2])}
              className="lg:col-start-4 lg:col-span-1 lg:row-start-1 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[2].image_url}
                alt={editorialSlots[2].title}
                style={{ objectPosition: editorialSlots[2].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[2].category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[2].title}
                </p>
              </div>
            </div>
          )}

          {/* PHOTO 4: Middle Center (Col 3, Row 2) */}
          {editorialSlots[3] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[3])}
              className="lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[3].image_url}
                alt={editorialSlots[3].title}
                style={{ objectPosition: editorialSlots[3].objectPosition || 'center 28%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[3].category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[3].title}
                </p>
              </div>
            </div>
          )}

          {/* PHOTO 5: Middle Right (Col 4, Row 2) */}
          {editorialSlots[4] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[4])}
              className="lg:col-start-4 lg:col-span-1 lg:row-start-2 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[4].image_url}
                alt={editorialSlots[4].title}
                style={{ objectPosition: editorialSlots[4].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[4].category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[4].title}
                </p>
              </div>
            </div>
          )}

          {/* PHOTO 6 / WIDE: Spans underneath Photo 1 and Photo 4 (Col 1-3, Row 3) */}
          {editorialSlots[5] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[5])}
              className="lg:col-start-1 lg:col-span-3 lg:row-start-3 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[5].image_url}
                alt={editorialSlots[5].title}
                style={{ objectPosition: editorialSlots[5].objectPosition || 'center 35%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                <div>
                  <span className="text-[#FF6A00] text-xs font-bold uppercase tracking-wider block mb-0.5">
                    {editorialSlots[5].category}
                  </span>
                  <h4 className="text-white text-lg font-black uppercase tracking-tight line-clamp-1">
                    {editorialSlots[5].title}
                  </h4>
                </div>
                <span className="text-white/60 text-xs font-mono tracking-widest hidden xl:block uppercase">
                  Panoramic View
                </span>
              </div>
            </div>
          )}

          {/* PHOTO 7: Bottom Right (Col 4, Row 3) */}
          {editorialSlots[6] && (
            <div
              onClick={() => openLightboxAt(editorialSlots[6])}
              className="lg:col-start-4 lg:col-span-1 lg:row-start-3 lg:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer bg-black/40 shadow-xl transition-all duration-300 border border-white/5"
            >
              <img
                loading="lazy"
                src={editorialSlots[6].image_url}
                alt={editorialSlots[6].title}
                style={{ objectPosition: editorialSlots[6].objectPosition || 'center 25%' }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                  {editorialSlots[6].category}
                </span>
                <p className="text-white text-sm font-bold uppercase tracking-tight line-clamp-1">
                  {editorialSlots[6].title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Photos Drawer / Expander if more than 7 photos exist */}
        {extraPhotos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
            {!showAllPhotos ? (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:border-[#FF6A00]/50 hover:text-[#FF6A00] cursor-pointer"
              >
                <span>View More Captures ({extraPhotos.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Extended Collection ({extraPhotos.length})
                  </h3>
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="text-white/60 hover:text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Collapse
                  </button>
                </div>
                {/* 2-column on mobile, 2 on tablet, 3 on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  {extraPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => openLightboxAt(photo)}
                      className="h-[190px] xs:h-[220px] sm:h-[240px] relative rounded-2xl overflow-hidden group cursor-pointer bg-black/40 shadow-md border border-white/5"
                    >
                      <img
                        loading="lazy"
                        src={photo.image_url}
                        alt={photo.title}
                        style={{ objectPosition: photo.objectPosition || 'center 25%' }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 active:scale-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[#FF6A00] text-[9px] font-bold uppercase tracking-wider block mb-0.5">
                          {photo.category}
                        </span>
                        <p className="text-white text-xs sm:text-sm font-bold uppercase tracking-tight line-clamp-1">
                          {photo.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          LIGHTBOX / FULLSCREEN IMAGE VIEWER
          - Touch swipe support on phones (left/right swipe)
          - Full keyboard navigation (ArrowLeft, ArrowRight, Escape)
          - Fully responsive controls that fit 320px screens perfectly
          ========================================================================= */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar Controls */}
            <div
              className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Counter and Category */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-mono font-bold tracking-wider">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(filteredPhotos.length).padStart(2, '0')}
                </span>
                <span className="text-[#FF6A00] text-[11px] sm:text-xs font-bold uppercase tracking-wider hidden xs:inline-block">
                  {filteredPhotos[lightboxIndex].category}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                aria-label="Close fullscreen view"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-[#FF6A00] text-white flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Left Nav Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
              }}
              aria-label="Previous image"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#FF6A00] text-white flex items-center justify-center transition-all duration-300 z-50 border border-white/10 hover:border-transparent cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Nav Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
              }}
              aria-label="Next image"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#FF6A00] text-white flex items-center justify-center transition-all duration-300 z-50 border border-white/10 hover:border-transparent cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Active Image Content */}
            <div
              className="relative max-w-5xl max-h-[82vh] flex flex-col items-center justify-center w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={filteredPhotos[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                src={filteredPhotos[lightboxIndex].image_url}
                alt={filteredPhotos[lightboxIndex].title}
                className="max-w-full max-h-[68vh] xs:max-h-[72vh] sm:max-h-[76vh] object-contain rounded-2xl shadow-2xl select-none"
              />

              {/* Bottom Caption */}
              <div className="mt-3 sm:mt-4 text-center px-4">
                <h4 className="text-white text-sm sm:text-lg font-black uppercase tracking-tight line-clamp-1">
                  {filteredPhotos[lightboxIndex].title}
                </h4>
                <p className="text-white/50 text-[10px] sm:text-xs font-mono mt-0.5">
                  Swipe or use arrows to navigate • Press Esc to close
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
