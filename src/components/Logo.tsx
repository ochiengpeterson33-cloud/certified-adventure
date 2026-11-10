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

  if (isLarge) {
    return (
      <div className={`flex flex-col items-center text-center select-none group cursor-pointer max-w-full ${className}`}>
        {/* Official Certified Adventures Logo Image */}
        <div className="relative shrink-0 flex items-center justify-center rounded-2xl bg-[#08121B] border border-[#FF6A00]/40 shadow-xl group-hover:border-[#FF6A00] group-hover:shadow-[#FF6A00]/25 transition-all duration-300 overflow-hidden w-16 h-16 sm:w-20 sm:h-20 p-1.5 mb-3 sm:mb-4">
          <img
            src={officialLogo}
            alt="Certified Adventures Official Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#FF6A00]/0 via-[#FF6A00]/20 to-[#29492F]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Brand Typography Header - Centered & Fluid */}
        <div className="flex flex-col items-center text-center max-w-full">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 leading-none text-center">
            <span className={`font-['Poppins'] font-black tracking-tight ${darkText ? 'text-gray-900' : 'text-[#F4E8D2]'} leading-none group-hover:text-white transition-colors text-[clamp(1.5rem,5.5vw,2.25rem)] sm:text-3xl lg:text-4xl`}>
              CERTIFIED
            </span>
            <span className="font-['Poppins'] font-black tracking-tight text-[#FF6A00] leading-none text-[clamp(1.5rem,5.5vw,2.25rem)] sm:text-3xl lg:text-4xl">
              ADVENTURES
            </span>
          </div>
          {showTagline && (
            <span className="uppercase tracking-[0.16em] sm:tracking-[0.22em] font-bold text-[#FF6A00] mt-2 sm:mt-2.5 transition-colors text-[10px] sm:text-xs text-center max-w-full block">
              travel in comfort and style
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none group cursor-pointer min-w-0 ${className}`}>
      {/* Official Certified Adventures Logo Image */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-[#08121B] border border-[#FF6A00]/40 shadow-lg group-hover:border-[#FF6A00] group-hover:shadow-[#FF6A00]/20 transition-all duration-300 overflow-hidden ${
        isCompact ? 'w-9 h-9 sm:w-10 sm:h-10 p-1' : 'w-10 h-10 sm:w-12 sm:h-12 p-1'
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
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 leading-tight flex-nowrap">
            <span className={`font-['Poppins'] font-black tracking-tight ${darkText ? 'text-gray-900' : 'text-[#F4E8D2]'} leading-none group-hover:text-white transition-colors text-xs xs:text-sm sm:text-lg lg:text-xl whitespace-nowrap`}>
              CERTIFIED
            </span>
            <span className="font-['Poppins'] font-black tracking-tight text-[#FF6A00] leading-none text-xs xs:text-sm sm:text-lg lg:text-xl whitespace-nowrap">
              ADVENTURES
            </span>
          </div>
          {showTagline && (
            <span className="block uppercase tracking-[0.10em] sm:tracking-[0.16em] font-bold text-[#FF6A00] mt-0.5 sm:mt-1 transition-colors text-[8px] xs:text-[9px] sm:text-[10px] leading-tight truncate">
              travel in comfort and style
            </span>
          )}
        </div>
      )}
    </div>
  );
};

