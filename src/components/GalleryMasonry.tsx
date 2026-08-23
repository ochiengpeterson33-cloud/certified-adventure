import React, { useState, useMemo } from 'react';
import { Play, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGallery } from '../hooks/useSupabaseData';

export const GalleryMasonry: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const { data: dbGallery, isLoading } = useGallery();

  const media = useMemo(() => {
    if (dbGallery && dbGallery.length > 0) {
      return dbGallery.map((item, idx) => {
        // Create a masonry effect by alternating spans
        let span = 'col-span-1 row-span-1';
        if (idx % 5 === 0) span = 'col-span-2 row-span-2';
        else if (idx % 7 === 0) span = 'col-span-2 row-span-1';
        else if (idx % 3 === 0) span = 'col-span-1 row-span-2';

        return {
          id: item.id,
          type: 'image', // Always image for gallery table for now unless we add a type field
          src: item.image_url,
          span: span,
          title: item.title,
        };
      });
    }

    // Fallback if empty
    return [];
  }, [dbGallery]);

  if (isLoading || media.length === 0) return null;

  return (
    <section id="gallery" className="py-24 bg-[#070707] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-white uppercase tracking-tight leading-none mb-4">
              The <span className="text-[#FF6A00]">Gallery</span>
            </h2>
            <p className="text-white/60 text-lg">Epic moments captured across our global adventures.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
            <span>Follow Our Journey</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[200px] gap-4">
          {media.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 1) }}
              className={`relative rounded-3xl overflow-hidden group cursor-pointer ${item.span}`}
              onClick={() => setSelectedMedia(item.src)}
            >
              <img loading="lazy" 
                src={item.src} 
                alt={item.title || "Gallery Item"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 group-hover:bg-[#FF6A00] group-hover:border-transparent transition-all">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#FF6A00] transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedMedia}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
