import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08121B] text-[#F4E8D2] px-5 sm:px-6 overflow-hidden min-h-[100dvh]"
        >
          {/* Animated Background Mountain & Sun Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tr from-[#E67A3A] via-[#29492F] to-transparent blur-3xl animate-pulse" />
          </div>

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center z-10 w-full max-w-sm sm:max-w-md mx-auto"
          >
            {/* Fully responsive centered brand logo & typography */}
            <Logo variant="large" className="mb-4 sm:mb-6" />

            {/* Centered progress indicator */}
            <div className="w-36 sm:w-48 h-1 sm:h-1.5 bg-[#12212F] rounded-full overflow-hidden mt-3 sm:mt-4 relative mx-auto">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-[#29492F] via-[#E67A3A] to-[#F4E8D2] rounded-full"
              />
            </div>

            {/* Adventure Begins Here */}
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.3em] text-[#F4E8D2]/60 mt-3 sm:mt-4 font-mono text-center">
              Adventure Begins Here...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
