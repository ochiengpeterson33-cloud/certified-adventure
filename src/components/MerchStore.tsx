import React from 'react';
import { ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useMerch } from '../hooks/useSupabaseData';

export const MerchStore: React.FC = () => {
  const { data: dbProducts, isLoading } = useMerch();

  if (isLoading) {
    return (
      <section className="py-24 bg-[#111111] relative border-t border-white/5 flex justify-center items-center">
         <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const products = dbProducts && dbProducts.length > 0 ? dbProducts : [];

  return (
    <section id="merch" className="py-24 bg-[#111111] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,3.75rem)] text-white uppercase tracking-tight leading-none mb-4">
              Rep The <span className="text-[#FF6A00]">Vibe</span>
            </h2>
            <p className="text-white/60 text-lg">Official Certified Adventures gear for your next journey.</p>
          </div>
          <button className="min-h-[44px] min-w-[44px] hidden md:flex items-center gap-2 text-white hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
            <span>View All Merch</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.filter((p: any) => p.is_active !== false).map((prod: any, idx: number) => (
            <motion.div
              key={prod.id || idx.toString()}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative rounded-3xl overflow-hidden glass-panel bg-black/40 hover:bg-black/80 transition-all duration-500 border border-white/5 hover:border-[#FF6A00]/30"
            >
              {/* Image */}
              <div className="relative h-72 overflow-hidden bg-white/5">
                <img loading="lazy" 
                  src={prod.image_url} 
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-[#FF6A00] transition-colors border border-white/10 z-10">
                  <Heart className="w-5 h-5" />
                </button>
                
                {/* Add to Cart Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full bg-[#FF6A00] text-black font-bold uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-white font-bold uppercase tracking-wide mb-1 group-hover:text-[#FF6A00] transition-colors">{prod.name}</h3>
                <p className="text-white/60 font-['Poppins']">{prod.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-white/60">New merch dropping soon. Stay tuned!</p>
          </div>
        )}
        
        <button className="w-full mt-12 md:hidden flex items-center justify-center gap-2 text-white border border-white/10 py-4 rounded-xl hover:border-[#FF6A00] hover:text-[#FF6A00] font-bold uppercase tracking-wider transition-colors">
          <span>View All Merch</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </section>
  );
};
