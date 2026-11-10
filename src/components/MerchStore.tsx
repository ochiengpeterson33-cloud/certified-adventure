import React, { useState } from 'react';
import { ShoppingCart, Heart, ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useMerch } from '../hooks/useSupabaseData';
import { useCart } from '../contexts/CartContext';

interface ProductItem {
  id: string;
  name: string;
  price: string;
  image_url: string;
  is_active?: boolean;
  category?: string;
  sizes?: string[];
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'merch-hoodie-1',
    name: 'Certified Signature Safari Hoodie',
    price: 'KES 4,500',
    category: 'Apparel',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'merch-cap-2',
    name: 'Wilderness Explorer Camp Cap',
    price: 'KES 2,200',
    category: 'Headwear',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    sizes: ['One Size'],
  },
  {
    id: 'merch-bottle-3',
    name: 'Certified Stainless Thermal Bottle',
    price: 'KES 2,800',
    category: 'Gear',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    sizes: ['1000ml'],
  },
  {
    id: 'merch-tee-4',
    name: 'Savannah Sunset Graphic Tee',
    price: 'KES 2,500',
    category: 'Apparel',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

const formatPriceToKES = (priceStr: string | number): string => {
  if (typeof priceStr === 'number') return `KES ${Math.round(priceStr).toLocaleString()}`;
  if (!priceStr) return 'KES 3,500';
  if (priceStr.toUpperCase().includes('KES') || priceStr.toUpperCase().includes('KSH')) return priceStr;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return priceStr;
  if (priceStr.includes('$') || num < 500) {
    return `KES ${Math.round(num * 130).toLocaleString()}`;
  }
  return `KES ${Math.round(num).toLocaleString()}`;
};

export const MerchStore: React.FC = () => {
  const { data: dbProducts, isLoading } = useMerch();
  const { addToCart } = useCart();

  const [selectedSizes, setSelectedSizes] = useState<{ [id: string]: string }>({});
  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({});
  const [likedIds, setLikedIds] = useState<{ [id: string]: boolean }>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // If database products exist, use them; otherwise use default products
  const products: ProductItem[] = 
    dbProducts && dbProducts.length > 0 
      ? dbProducts.filter((p: any) => p.is_active !== false).map((p: any) => ({
          ...p,
          price: formatPriceToKES(p.price),
          sizes: p.sizes || (p.name.toLowerCase().includes('bottle') || p.name.toLowerCase().includes('cap') ? ['Standard'] : ['S', 'M', 'L', 'XL']),
        }))
      : DEFAULT_PRODUCTS;

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: ProductItem) => {
    const defaultSize = product.sizes?.[0] || 'Standard';
    const chosenSize = selectedSizes[product.id] || defaultSize;

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        size: chosenSize,
      },
      1
    );

    // Visual button confirmation
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const toggleLike = (productId: string) => {
    setLikedIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const categories = ['All'];
  const filteredProducts = products;

  if (isLoading) {
    return (
      <section className="py-24 bg-[#0B0F15] relative border-t border-white/5 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section id="merch" className="py-20 sm:py-28 bg-[#0B0F15] relative border-t border-white/5 font-['Poppins',sans-serif]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Merch Store</span>
            </div>
            <h2 className="font-['Poppins'] font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight leading-none mb-3">
              Rep The <span className="text-[#FF6A00]">Vibe</span>
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Premium Certified Adventures gear designed for mountain trails, game drives, and street culture.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-[#FF6A00] text-black shadow-md shadow-[#FF6A00]/25'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((prod, idx) => {
            const isAdded = addedIds[prod.id];
            const isLiked = likedIds[prod.id];
            const availableSizes = prod.sizes || ['Standard'];
            const currentSize = selectedSizes[prod.id] || availableSizes[0];

            return (
              <motion.div
                key={prod.id || idx.toString()}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-3xl overflow-hidden bg-[#121721] border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-black/40">
                  <img
                    loading="lazy"
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(prod.id)}
                    aria-label="Save to Wishlist"
                    className={`absolute top-3.5 right-3.5 w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center transition-all z-10 active:scale-90 ${
                      isLiked
                        ? 'bg-red-500 text-white'
                        : 'bg-black/50 text-white/70 hover:text-white border border-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Desktop Hover Quick Overlay */}
                  <div className="hidden lg:flex absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                        isAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-[#FF6A00] text-black hover:bg-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Quick Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-white font-bold text-sm tracking-wide group-hover:text-[#FF6A00] transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                      <span className="font-bold text-[#FF6A00] text-sm whitespace-nowrap">
                        {prod.price}
                      </span>
                    </div>

                    {/* Sizes Selection */}
                    {availableSizes.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-2.5 mb-3">
                        <span className="text-[10px] uppercase font-bold text-white/40 mr-1">
                          Size:
                        </span>
                        {availableSizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSizeChange(prod.id, s)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              currentSize === s
                                ? 'bg-[#FF6A00] text-black ring-1 ring-[#FF6A00]'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile & Tablet Visible Add to Cart Button */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex lg:hidden">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                        isAdded
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                          : 'bg-[#FF6A00] text-black shadow-md shadow-[#FF6A00]/25'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
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
