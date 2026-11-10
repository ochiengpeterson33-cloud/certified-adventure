import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Compass
} from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end validations with immediate tactile feedback
    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("Please accept the Terms of Service & Privacy Policy to continue");
      return;
    }

    setLoading(true);

    try {
      const trimmedName = fullName.trim();
      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: trimmedName,
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim(),
          }
        }
      });

      if (authError) throw authError;

      // Direct profile creation/sync fallback in case remote trigger isn't instantaneous
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim(),
            role: 'Viewer',
          });
        } catch (profileErr) {
          console.warn('Profile sync fallback caught:', profileErr);
        }
      }

      const activeSession = !!data.session;
      setHasSession(activeSession);
      setSuccess(true);

      // If already logged in with active session, redirect to profile or home after a friendly delay
      if (activeSession) {
        setTimeout(() => navigate('/profile'), 2500);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to create account. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-['Poppins',sans-serif]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header & Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex justify-center mb-6 active:scale-95 transition-transform">
          <Logo variant="full" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Create Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/60">
          Already an adventurer with us?{' '}
          <Link to="/login" className="font-bold text-[#FF6A00] hover:text-white transition-colors underline decoration-[#FF6A00]/40">
            Sign in here
          </Link>
        </p>
      </div>

      {/* Registration Card */}
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111111]/90 backdrop-blur-xl py-7 px-4 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-white/10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#FF6A00]/20 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              {hasSession ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Welcome to Certified Adventures!</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Your account has been created and you are now signed in as <strong>{fullName || email}</strong>.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-black bg-[#FF6A00] hover:bg-white transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      <span>Go to My Profile</span>
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore Adventures</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    We've sent a verification link to <strong>{email}</strong>. Please check your inbox or spam folder to complete registration.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-black bg-[#FF6A00] hover:bg-white transition-colors"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister} noValidate>
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#FF6A00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                    placeholder="e.g. Brian Kipkorir"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[#FF6A00]">*</span>
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

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Password <span className="text-[#FF6A00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                    placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-[#FF6A00]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              {/* Terms Checkbox - High-affordance mobile touch area */}
              <div 
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.1] border border-white/5 cursor-pointer select-none transition-colors mt-2"
              >
                <div className="pt-0.5">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    agreedToTerms ? 'bg-[#FF6A00] border-[#FF6A00] text-black shadow-sm shadow-[#FF6A00]/40' : 'border-white/30 bg-black/60'
                  }`}>
                    {agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="text-xs text-white/80 leading-relaxed flex-1">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    className="font-bold text-[#FF6A00] hover:underline underline-offset-2"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    className="font-bold text-[#FF6A00] hover:underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[50px] flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-[#FF6A00]/25 text-xs sm:text-sm font-bold uppercase tracking-wider text-black bg-[#FF6A00] hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 mt-4 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Terms & Privacy Info Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121720] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-lg text-white">Terms & Privacy</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-white/70 leading-relaxed">
              <p>
                <strong>Welcome to Certified Adventures.</strong> By registering an account, you gain access to booking luxury safaris, community events, road trips, and personalized adventure itineraries.
              </p>
              <p>
                <strong>Data Protection:</strong> Your personal contact information is securely stored and used exclusively for your bookings, confirmations, and account security. We never sell your personal data.
              </p>
              <p>
                <strong>Account Guidelines:</strong> You are responsible for maintaining the confidentiality of your account password and all activities under your profile.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FF6A00] text-black font-bold text-xs uppercase tracking-wider"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
