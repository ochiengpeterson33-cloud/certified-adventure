import React from 'react';
import officialLogo from '../assets/images/certified_logo_1785596043136.png';

interface LogoProps {
  darkText?: boolean;
  variant?: 'full' | 'compact' | 'light' | 'large';
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', showTagline = true, darkText = false }) => {
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* Official Certified Adventures Logo Image */}
      <div className={`relative flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#08121B] border border-[#FF6A00]/40 shadow-lg group-hover:border-[#FF6A00] group-hover:shadow-[#FF6A00]/20 transition-all duration-300 overflow-hidden ${
        isLarge ? 'w-20 h-20 p-1.5' : isCompact ? 'w-10 h-10 p-1' : 'w-12 h-12 p-1'
      }`}>
        <img
          src={officialLogo}
          alt="Certified Adventures Official Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#FF6A00]/0 via-[#FF6A00]/20 to-[#29492F]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Brand Typography Header */}
      {!isCompact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`font-['Poppins'] font-black tracking-tight ${darkText ? 'text-gray-900' : 'text-[#F4E8D2]'} leading-none group-hover:text-white transition-colors ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
            }`}>
              CERTIFIED
            </span>
            <span className={`font-['Poppins'] font-black tracking-tight text-[#FF6A00] leading-none ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
            }`}>
              ADVENTURES
            </span>
          </div>
          {showTagline && (
            <span className={`uppercase tracking-[0.22em] font-bold text-[#FF6A00] mt-1 transition-colors ${
              isLarge ? 'text-xs' : 'text-[9px]'
            }`}>
              Travel in Comfort and style
            </span>
          )}
        </div>
      )}
    </div>
  );
};

