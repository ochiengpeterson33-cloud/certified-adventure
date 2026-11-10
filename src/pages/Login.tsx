import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;
      
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
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-['Poppins',sans-serif]">
      {/* Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex justify-center mb-6 active:scale-95 transition-transform">
          <Logo variant="full" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/60">
          Ready for your next adventure? Sign in to your account.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111111]/90 backdrop-blur-xl py-7 px-4 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-white/10">
          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Password
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact support or request a password reset at hello@certified.com"); }} className="text-[11px] font-bold text-[#FF6A00] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white p-2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[50px] flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-[#FF6A00]/25 text-xs sm:text-sm font-bold uppercase tracking-wider text-black bg-[#FF6A00] hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Section */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-white/60 mb-3">
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
