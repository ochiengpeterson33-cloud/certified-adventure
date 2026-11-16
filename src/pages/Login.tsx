import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { CaptchaField, isCaptchaConfigured } from '../components/CaptchaField';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus, AlertCircle, Sun, Moon } from 'lucide-react';

function formatAuthErrorMessage(message?: string): string {
  if (!message) return 'Invalid email or password. Please try again.';
  if (/captcha/i.test(message)) {
    return isCaptchaConfigured
      ? 'Security verification failed or expired. Please complete the CAPTCHA challenge and try again.'
      : 'Supabase CAPTCHA protection is enabled on the authentication server, but no CAPTCHA site key is configured. Disable CAPTCHA protection in Supabase Dashboard (Authentication → Attack Protection) or set VITE_TURNSTILE_SITE_KEY / VITE_HCAPTCHA_SITE_KEY.';
  }
  return message;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const { isDark, isLight, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both email and password");
      return;
    }

    if (isCaptchaConfigured && !captchaToken) {
      setError("Please complete the security verification before signing in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
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

      // Check user role
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#070707] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-['Poppins',sans-serif] transition-colors duration-300">
      {/* Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-[#FF6A00]/10 dark:bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-700 dark:text-white hover:border-[#FF6A00] transition-colors cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4 text-[#FF6A00]" /> : <Moon className="w-4 h-4 text-slate-700" />}
      </button>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex justify-center mb-6 active:scale-95 transition-transform">
          <Logo variant="full" darkText={isLight} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-white/60">
          Ready for your next adventure? Sign in to your account.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#111111]/90 backdrop-blur-xl py-7 px-4 sm:px-10 shadow-xl dark:shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10">
          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Password
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); setError("Please contact support at hello@certified.com to reset your password."); }} className="text-[11px] font-bold text-[#FF6A00] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white p-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <CaptchaField
              onTokenChange={setCaptchaToken}
              resetSignal={captchaResetSignal}
            />

            <button
              type="submit"
              disabled={loading || (isCaptchaConfigured && !captchaToken)}
              className="w-full min-h-[50px] flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-[#FF6A00]/25 text-xs sm:text-sm font-bold uppercase tracking-wider text-white dark:text-black bg-[#FF6A00] hover:bg-slate-900 dark:hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Section */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-xs text-slate-600 dark:text-white/60 mb-3">
              Don't have an account yet?
            </p>
            <Link
              to="/register"
              className="w-full min-h-[46px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#FF6A00]/40 bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FF6A00] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
