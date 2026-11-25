import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CaptchaField, isCaptchaConfigured } from '../components/CaptchaField';
import { AuthSpotlightShell } from '../components/AuthSpotlightShell';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import {
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';

function formatRegisterAuthError(message?: string): string {
  if (!message) return 'Failed to create account. Please check your details and try again.';
  if (/captcha/i.test(message)) {
    return isCaptchaConfigured
      ? 'Security verification failed or expired. Please complete the CAPTCHA challenge and try again.'
      : 'Supabase CAPTCHA protection is enabled on the authentication server, but no CAPTCHA site key is configured. Disable CAPTCHA protection in Supabase Dashboard (Authentication -> Attack Protection) or set VITE_TURNSTILE_SITE_KEY / VITE_HCAPTCHA_SITE_KEY.';
  }
  return message;
}

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst) {
      setError('Please enter your first name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please accept the Terms and Privacy Policy to continue.');
      return;
    }

    if (isCaptchaConfigured && !captchaToken) {
      setError('Please complete the security verification before creating your account.');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${cleanFirst} ${cleanLast}`.trim();

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          ...(captchaToken ? { captchaToken } : {}),
          data: {
            full_name: fullName,
            first_name: cleanFirst,
            last_name: cleanLast,
            phone: phone.trim(),
          },
        },
      });

      if (authError) {
        setError(formatRegisterAuthError(authError.message));
        if (isCaptchaConfigured) {
          setCaptchaResetSignal((prev) => prev + 1);
        }
        return;
      }

      if (data.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              first_name: cleanFirst,
              last_name: cleanLast,
              phone: phone.trim(),
              role: 'Viewer',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
        } catch (profileErr) {
          console.warn('Profile sync fallback caught:', profileErr);
        }
      }

      const activeSession = !!data.session;
      setHasSession(activeSession);
      setSuccess(true);

      if (activeSession) {
        setTimeout(() => navigate('/profile'), 2500);
      }
    } catch (err: any) {
      setError(formatRegisterAuthError(err?.message));
      if (isCaptchaConfigured) {
        setCaptchaResetSignal((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (oauthError) {
        setError(oauthError.message || 'Unable to continue with Google right now.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

  return (
    <>
      <AuthSpotlightShell
        leftTitle="Don't Have An Account?"
        leftDescription="Register to access all the features of Certified Adventures. Book safaris, manage itineraries, and join events in one place."
        formTitle={success ? (hasSession ? 'Welcome Aboard' : 'Check Your Email') : 'Sign Up'}
      >
        {success ? (
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border bg-[#FF6A00]/20 text-[#FF9E64] border-[#FF6A00]/40">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>

            {hasSession ? (
              <>
                <p className="text-sm mb-6 leading-relaxed text-white/85">
                  Your account has been created and you are now signed in as{' '}
                  <strong>{displayName || email}</strong>.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full min-h-[46px] rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#FF6A00] hover:bg-[#E67A3A] text-white"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span>Go to My Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full min-h-[46px] rounded-full font-medium text-sm border border-white/30 hover:border-white/60 transition-colors flex items-center justify-center gap-2 cursor-pointer text-white bg-white/5 hover:bg-white/10"
                  >
                    <Compass className="w-4 h-4" aria-hidden="true" />
                    <span>Explore Adventures</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-6 leading-relaxed text-white/85">
                  We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your
                  inbox or spam folder to complete registration.
                </p>
                <Link
                  to="/login"
                  className="inline-flex w-full min-h-[46px] rounded-full items-center justify-center gap-2 font-medium text-sm transition-colors border border-white/75 hover:border-[#FF6A00] hover:bg-[#FF6A00] text-white"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        ) : (
          <form className="space-y-3.5" onSubmit={handleRegister} noValidate>
            {error && (
              <div
                role="alert"
                className="px-3.5 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border bg-red-950/70 border-red-400/40 text-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-300" aria-hidden="true" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <GoogleAuthButton
              onClick={handleGoogleSignUp}
              loading={googleLoading}
              disabled={loading}
              label="Continue with Google"
            />

            {/* Email Underline Input */}
            <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
              <label htmlFor="register-email" className="sr-only">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full min-h-[44px] bg-transparent pr-10 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-white/75">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            {/* First & Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors min-w-0">
                <label htmlFor="register-firstname" className="sr-only">
                  First Name
                </label>
                <input
                  id="register-firstname"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full min-w-0 min-h-[44px] bg-transparent pr-7 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-white/75">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors min-w-0">
                <label htmlFor="register-lastname" className="sr-only">
                  Last Name
                </label>
                <input
                  id="register-lastname"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full min-w-0 min-h-[44px] bg-transparent pr-2 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone (Optional) Underline Input */}
            <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
              <label htmlFor="register-phone" className="sr-only">
                Phone Number (Optional)
              </label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="w-full min-h-[44px] bg-transparent pr-10 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-white/75">
                <Phone className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            {/* Password Underline Input */}
            <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
              <label htmlFor="register-password" className="sr-only">
                Password
              </label>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full min-h-[44px] bg-transparent pr-11 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
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

            {/* Confirm Password Underline Input */}
            <div className="relative border-b border-white/45 focus-within:border-[#FF6A00] transition-colors">
              <label htmlFor="register-confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full min-h-[44px] bg-transparent pr-10 py-2 text-base sm:text-[15px] text-white placeholder-white/65 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-white/75">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-2 text-xs leading-relaxed text-white/80">
              <input
                id="register-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-sm cursor-pointer shrink-0 accent-[#FF6A00]"
              />
              <label htmlFor="register-terms" className="cursor-pointer select-none">
                I Agree To{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-semibold text-white hover:text-[#FF9E64] underline underline-offset-2 cursor-pointer"
                >
                  Terms
                </button>{' '}
                And{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-semibold text-white hover:text-[#FF9E64] underline underline-offset-2 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <CaptchaField
              onTokenChange={setCaptchaToken}
              resetSignal={captchaResetSignal}
              forceTheme="dark"
            />

            {/* Bottom Action Row: Outlined Glass Pill + Sign In Link */}
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
                    <span>Sign Up</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="min-h-[36px] inline-flex items-center text-xs sm:text-sm text-white/85 hover:text-[#FF9E64] underline underline-offset-4 transition-colors whitespace-nowrap"
              >
                Have An Account?
              </Link>
            </div>
          </form>
        )}
      </AuthSpotlightShell>

      {/* Terms & Privacy Info Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1A26] border border-white/15 rounded-2xl max-w-lg w-full p-6 text-white max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-lg">Terms &amp; Privacy</h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close terms modal"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
              <p>
                <strong>Welcome to Certified Adventures.</strong> By registering an account, you gain
                access to booking luxury safaris, community events, road trips, and personalized
                adventure itineraries.
              </p>
              <p>
                <strong>Data Protection:</strong> Your personal contact information is securely stored
                and used exclusively for your bookings, confirmations, and account security. We never
                sell your personal data.
              </p>
              <p>
                <strong>Account Guidelines:</strong> You are responsible for maintaining the
                confidentiality of your account password and all activities under your profile.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-6 min-h-[44px] rounded-full bg-[#FF6A00] hover:bg-[#E67A3A] text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
