import React, { useEffect, useState } from 'react';
import { ShieldCheck, Compass, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

// Map icon names to components
const IconMap: Record<string, React.FC<any>> = {
  ShieldCheck, Compass, Users, CheckCircle2
};

export const FeatureBar: React.FC = () => {
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFeatures() {
      const { data } = await supabase.from('categories').select('description').eq('slug', 'homepage-features').single();
      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setFeatures(parsed);
            return;
          }
        } catch (e) {}
      }
      
      setFeatures([
        { name: 'KPSGA Certified Guides', desc: 'Expert naturalists and professional drivers.', icon: 'ShieldCheck' },
        { name: 'Custom 4x4 Cruisers', desc: 'Luxury safari vehicles with pop-up roofs.', icon: 'Compass' },
        { name: 'Small Group Focus', desc: 'Intimate experiences and personalized attention.', icon: 'Users' },
      ]);
    }
    fetchFeatures();
  }, []);

  if (features.length === 0) return null;

  return (
    <section className="bg-white py-12 relative z-20 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = IconMap[feature.icon] || CheckCircle2;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-bold text-gray-900 tracking-wide uppercase text-sm mb-1">{feature.name}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
