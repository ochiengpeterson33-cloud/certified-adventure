import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() || '';
const HCAPTCHA_SITE_KEY = (import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined)?.trim() || '';

export const isCaptchaConfigured = Boolean(TURNSTILE_SITE_KEY || HCAPTCHA_SITE_KEY);

interface CaptchaFieldProps {
  onTokenChange: (token: string | null) => void;
  resetSignal?: number;
  forceTheme?: 'light' | 'dark';
}

export const CaptchaField: React.FC<CaptchaFieldProps> = ({
  onTokenChange,
  resetSignal = 0,
  forceTheme,
}) => {
  const { isDark } = useTheme();
  const effectiveTheme: 'light' | 'dark' = forceTheme ?? (isDark ? 'dark' : 'light');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [loadFailed, setLoadFailed] = useState(false);

  onTokenChangeRef.current = onTokenChange;

  const provider: 'turnstile' | 'hcaptcha' | null = TURNSTILE_SITE_KEY
    ? 'turnstile'
    : HCAPTCHA_SITE_KEY
    ? 'hcaptcha'
    : null;
  const siteKey = TURNSTILE_SITE_KEY || HCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!provider || !siteKey) return;

    let cancelled = false;
    setLoadFailed(false);

    const scriptId = provider === 'turnstile' ? 'cf-turnstile-script' : 'hcaptcha-script';
    const scriptSrc =
      provider === 'turnstile'
        ? 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        : 'https://js.hcaptcha.com/1/api.js?render=explicit';

    const renderWidget = () => {
      if (cancelled || !containerRef.current) return;
      const api = provider === 'turnstile' ? window.turnstile : window.hcaptcha;
      if (!api) return;

      // Clear previous widget if re-rendering on theme change
      if (widgetIdRef.current) {
        try {
          if (provider === 'turnstile' && window.turnstile) {
            window.turnstile.remove(widgetIdRef.current);
          } else if (provider === 'hcaptcha' && window.hcaptcha?.remove) {
            window.hcaptcha.remove(widgetIdRef.current);
          }
        } catch {
          // Ignore cleanup errors
        }
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';

      try {
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          theme: effectiveTheme,
          callback: (token: string) => {
            onTokenChangeRef.current(token);
          },
          'expired-callback': () => {
            onTokenChangeRef.current(null);
          },
          'error-callback': () => {
            onTokenChangeRef.current(null);
          },
        });
      } catch {
        setLoadFailed(true);
      }
    };

    const existingApi = provider === 'turnstile' ? window.turnstile : window.hcaptcha;
    if (existingApi) {
      renderWidget();
    } else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptSrc;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const pollInterval = window.setInterval(() => {
        const api = provider === 'turnstile' ? window.turnstile : window.hcaptcha;
        if (api) {
          window.clearInterval(pollInterval);
          renderWidget();
        }
      }, 150);

      const handleError = () => {
        window.clearInterval(pollInterval);
        if (!cancelled) setLoadFailed(true);
      };

      script.addEventListener('error', handleError);

      return () => {
        cancelled = true;
        window.clearInterval(pollInterval);
        script?.removeEventListener('error', handleError);
        if (widgetIdRef.current) {
          try {
            if (provider === 'turnstile' && window.turnstile) {
              window.turnstile.remove(widgetIdRef.current);
            } else if (provider === 'hcaptcha' && window.hcaptcha?.remove) {
              window.hcaptcha.remove(widgetIdRef.current);
            }
          } catch {
            // Ignore cleanup errors
          }
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current) {
        try {
          if (provider === 'turnstile' && window.turnstile) {
            window.turnstile.remove(widgetIdRef.current);
          } else if (provider === 'hcaptcha' && window.hcaptcha?.remove) {
            window.hcaptcha.remove(widgetIdRef.current);
          }
        } catch {
          // Ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [provider, siteKey, effectiveTheme]);

  // Reset single-use token whenever parent increments resetSignal
  useEffect(() => {
    if (resetSignal === 0 || !provider || !widgetIdRef.current) return;
    onTokenChangeRef.current(null);
    try {
      const api = provider === 'turnstile' ? window.turnstile : window.hcaptcha;
      api?.reset(widgetIdRef.current);
    } catch {
      // Ignore reset errors
    }
  }, [resetSignal, provider]);

  if (!provider || !siteKey) return null;

  return (
    <div className="pt-1">
      <div
        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${
          effectiveTheme === 'dark' ? 'text-white/70' : 'text-slate-600'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
        <span>Security Verification</span>
      </div>
      {loadFailed ? (
        <div
          className={`p-3 rounded-xl border text-xs ${
            effectiveTheme === 'dark'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          Unable to load the verification widget. Please refresh the page or disable browser content blockers.
        </div>
      ) : (
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center sm:justify-start" />
      )}
    </div>
  );
};
