import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_AUTH_PAGE_THEME, useAuthPageBackground } from '../hooks/useSupabaseData';

interface AuthSpotlightShellProps {
  leftTitle: string;
  leftDescription: string;
  formTitle: string;
  children: React.ReactNode;
}

export const AuthSpotlightShell: React.FC<AuthSpotlightShellProps> = ({
  leftTitle,
  leftDescription,
  formTitle,
  children,
}) => {
  const { data: authTheme } = useAuthPageBackground();
  const theme = authTheme ?? DEFAULT_AUTH_PAGE_THEME;
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [theme.image_url]);

  const showImage = Boolean(theme.image_url && !imgFailed);
  const dimAlpha = Math.max(0, Math.min(0.8, theme.backdrop_dim / 100));
  const glassAlpha = Math.max(0, Math.min(0.85, theme.glass_opacity / 100));
  const blurPx = Math.max(0, Math.min(36, theme.glass_blur));

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden flex flex-col font-['Poppins',sans-serif] bg-[#08121B] text-white">
      {/* Full-Bleed Admin-Configured Background Image or Dark Fallback Gradient */}
      <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {showImage ? (
          <img
            src={theme.image_url}
            alt=""
            onError={() => setImgFailed(true)}
            style={{
              filter: `contrast(${theme.image_contrast}%) brightness(${theme.image_brightness}%)`,
            }}
            className="w-full h-full object-cover scale-[1.01] transition-[filter] duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_90%_80%_at_25%_35%,rgba(230,122,58,0.18)_0%,rgba(41,73,47,0.18)_42%,#08121B_85%)] bg-[#08121B]" />
        )}

        {/* Admin-Adjustable Contrast Scrim (Lighter on right so glass blur illuminates cleanly) */}
        <div
          style={{
            background: `linear-gradient(90deg, rgba(8,18,27,${Math.min(0.85, dimAlpha * 1.15).toFixed(2)}) 0%, rgba(8,18,27,${(dimAlpha * 0.65).toFixed(2)}) 52%, rgba(8,18,27,${(dimAlpha * 0.35).toFixed(2)}) 100%)`,
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Split Layout: Full-Bleed Photo + Left Copy | Right Full-Height Frosted Glass Panel */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-[1.08fr_0.92fr] lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Side: Navigation + Editorial Prompt */}
        <div className="flex flex-col justify-between px-5 sm:px-10 lg:px-14 pt-4 pb-6 md:py-10">
          <div>
            <Link
              to="/"
              className="min-h-[44px] inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 hover:text-[#FF9E64] transition-colors whitespace-nowrap drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="mt-4 mb-2 md:my-auto max-w-md">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight leading-[1.14] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] text-balance">
              {leftTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-[15px] text-white/85 leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
              {leftDescription}
            </p>
          </div>

          <div className="hidden md:block" aria-hidden="true" />
        </div>

        {/* Right Side: Adjustable Frosted Glassmorphism Form Pane */}
        <div className="flex flex-col justify-center px-4 pb-8 md:p-0">
          <div
            style={{
              backgroundColor: `rgba(12, 20, 30, ${glassAlpha.toFixed(2)})`,
              backdropFilter: `blur(${blurPx}px)`,
              WebkitBackdropFilter: `blur(${blurPx}px)`,
            }}
            className="w-full md:h-full rounded-2xl md:rounded-none border border-white/20 md:border-y-0 md:border-r-0 md:border-l md:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:shadow-none flex flex-col justify-center px-5 py-7 sm:px-9 sm:py-9 lg:px-14 xl:px-16"
          >
            <div className="w-full max-w-[390px] mx-auto">
              <h2 className="text-2xl sm:text-[28px] font-medium tracking-tight text-white mb-6 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
                {formTitle}
              </h2>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
