import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CaptchaField, isCaptchaConfigured } from '../components/CaptchaField';
import { AuthSpotlightShell } from '../components/AuthSpotlightShell';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'ca_remembered_email';

function formatAuthErrorMessage(message?: string): string {
  if (!message) return 'Invalid email or password. Please try again.';
  if (/captcha/i.test(message)) {
    return isCaptchaConfigured
      ? 'Security verification failed or expired. Please complete the CAPTCHA challenge and try again.'
      : 'Supabase CAPTCHA protection is enabled on the authentication server, but no CAPTCHA site key is configured. Disable CAPTCHA protection in Supabase Dashboard (Authentication -> Attack Protection) or set VITE_TURNSTILE_SITE_KEY / VITE_HCAPTCHA_SITE_KEY.';
  }
  return message;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError('Enter your email address above first so we can send a password reset link.');
      return;
    }

    setResetSending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalized, {
        redirectTo: `${window.location.origin}/#/login`,
      });
      if (resetError) {
        setError(resetError.message || 'Unable to send password reset email right now.');
      } else {
        setNotice(`Password reset instructions sent to ${normalized}. Check your inbox.`);
      }
    } catch {
      setError('Unable to send password reset email. Please try again.');
    } finally {
      setResetSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (isCaptchaConfigured && !captchaToken) {
      setError('Please complete the security verification before signing in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      try {
        if (rememberMe) {
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
        } else {
          window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // Ignore storage access errors
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (authError) {
        setError(formatAuthErrorMessage(authError.message));
        if (isCaptchaConfigured) {
          setCaptchaResetSignal((prev) => prev + 1);
        }
        return;
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const isAdmin = profileData?.role === 'Admin' || profileData?.role === 'Super Admin';

        setTimeout(() => {
          if (from !== '/') {
            navigate(from, { replace: true });
          } else if (isAdmin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/profile', { replace: true });
          }
        }, 150);
      } else {
        setTimeout(() => navigate(from, { replace: true }), 150);
      }
    } catch (err: any) {
      setError(formatAuthErrorMessage(err?.message));
      if (isCaptchaConfigured) {
        setCaptchaResetSignal((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (oauthError) {
        setError(oauthError.message || 'Unable to sign in with Google right now.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthSpotlightShell
      leftTitle="Welcome Back"
      leftDescription="Sign in to access your adventure bookings, saved itineraries, and community events across East Africa."
      formTitle="Sign In"
    >
      <form className="space-y-4" onSubmit={handleLogin} noValidate>
        {error && (
          <div
            role="alert"
            className="px-3.5 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border bg-red-950/70 border-red-400/40 text-red-100"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-300" aria-hidden="true" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="px-3.5 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border bg-emerald-950/70 border-emerald-400/40 text-emerald-100"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" aria-hidden="true" />
            <span className="leading-snug">{notice}</span>
          </div>
        )}

        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
          label="Continue with Google"
        />

        {/* Email Underline Input */}
        <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full min-h-[44px] bg-transparent pr-10 py-2.5 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-white/75">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        {/* Password Underline Input */}
        <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full min-h-[44px] bg-transparent pr-11 py-2.5 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 min-w-[40px] flex items-center justify-end text-white/75 hover:text-[#FF9E64] transition-colors cursor-pointer focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Lock className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm text-white/80">
          <label className="min-h-[36px] inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-sm cursor-pointer accent-[#FF6A00]"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetSending}
            className="min-h-[36px] underline underline-offset-4 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap text-white/85 hover:text-[#FF9E64]"
          >
            {resetSending ? 'Sending...' : 'Forgot Password?'}
          </button>
        </div>

        <CaptchaField
          onTokenChange={setCaptchaToken}
          resetSignal={captchaResetSignal}
          forceTheme="dark"
        />

        {/* Bottom Action Row: Outlined Glass Pill + Register Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
          <button
            type="submit"
            disabled={loading || (isCaptchaConfigured && !captchaToken)}
            className="min-h-[44px] px-7 rounded-full border border-white/75 hover:border-[#FF6A00] hover:bg-[#FF6A00] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-all active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9E64] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>

          <Link
            to="/register"
            className="min-h-[36px] inline-flex items-center text-xs sm:text-sm text-white/85 hover:text-[#FF9E64] underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Don&apos;t Have An Account?
          </Link>
        </div>
      </form>
    </AuthSpotlightShell>
  );
};
