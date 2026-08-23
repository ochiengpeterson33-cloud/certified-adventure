const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Add import
if (!content.includes("import { supabase } from '../lib/supabase';")) {
  content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { supabase } from '../lib/supabase';");
}

// Add state
const stateHook = `const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { data: slides, isLoading } = useHeroSlides();
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [badge, setBadge] = useState({ rating: '4.9/5', text: '10,000+ Adventurers' });

  useEffect(() => {
    async function fetchBadge() {
      const { data } = await supabase.from('categories').select('description').eq('slug', 'homepage-hero-badge').single();
      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed) setBadge(parsed);
        } catch(e) {}
      }
    }
    fetchBadge();
  }, []);
`;
content = content.replace(/const \[currentSlideIndex, setCurrentSlideIndex\] = useState\(0\);\s+const { data: slides, isLoading } = useHeroSlides\(\);\s+const \[isAutoPlaying, setIsAutoPlaying\] = useState\(true\);/, stateHook);

// Replace badge markup
content = content.replace(
  `<div className="font-['Poppins'] font-bold text-white text-lg">4.9/5</div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wider">10,000+ Adventurers</div>`,
  `<div className="font-['Poppins'] font-bold text-white text-lg">{badge.rating}</div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wider">{badge.text}</div>`
);

fs.writeFileSync('src/components/Hero.tsx', content);
