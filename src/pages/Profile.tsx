import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ArrowLeft, 
  Save, 
  LogOut, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShoppingBag
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { openCart, totalCount, orders } = useCart();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
    } else if (user?.user_metadata) {
      const meta = user.user_metadata;
      setFirstName(meta.first_name || meta.full_name?.split(' ')[0] || '');
      setLastName(meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '');
      setPhone(meta.phone || '');
    }
  }, [profile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 2. Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim(),
        }
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setSaveError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'Adventurer';
  const userInitials = (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '') || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#FF6A00] selection:text-white pb-16 font-['Poppins',sans-serif]">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[#FF6A00]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F15]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-[#FF6A00] group-hover:border-[#FF6A00]/40 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/80 group-hover:text-white hidden xs:inline transition-colors">
              Back to Site
            </span>
          </Link>

          <Link to="/">
            <Logo variant="compact" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 hover:bg-[#FF6A00]/25 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 relative z-10">
        {/* User Hero Banner Card */}
        <div className="bg-gradient-to-br from-[#121820] to-[#0A0D12] rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 shadow-2xl relative overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FF9800] p-0.5 shadow-xl shadow-[#FF6A00]/20">
                <div className="w-full h-full rounded-2xl bg-[#0F141C] flex items-center justify-center text-2xl sm:text-3xl font-black text-white">
                  {userInitials}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[#0B0F15] flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white break-words">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30">
                  {isAdmin ? 'Super Admin' : (profile?.role || 'Adventurer')}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/60 flex items-center justify-center sm:justify-start gap-1.5 break-all">
                <Mail className="w-3.5 h-3.5 text-[#FF6A00] flex-shrink-0" />
                <span>{user?.email}</span>
              </p>

              {user?.created_at && (
                <p className="text-[11px] sm:text-xs text-white/40 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </p>
              )}
            </div>

            {/* Actions on Mobile/Desktop */}
            {isAdmin && (
              <div className="w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9800] text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#FF6A00]/25 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <div className="bg-[#10151E]/90 rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 shadow-xl mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Personal Information
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Keep your adventure profile details accurate and up to date.
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6A00]">
              <User className="w-4 h-4" />
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/40 text-green-400 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-base sm:text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-base sm:text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-white/40" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-base sm:text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/30" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white/50 text-base sm:text-sm cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-white/40 mt-1.5 block">
                Email is tied to your primary authentication provider.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-white/50 order-2 sm:order-1">
                All changes save directly to your account.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-xl bg-[#FF6A00] hover:bg-[#FF8526] text-black font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#FF6A00]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 order-1 sm:order-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Adventures & Merch Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/#packages"
            className="p-5 rounded-2xl bg-[#10151E]/70 hover:bg-[#10151E] border border-white/10 hover:border-[#FF6A00]/40 transition-all group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-[#FF6A00] transition-colors">
                Browse Experiences
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Explore packages, road trips, and safari tours.
              </p>
            </div>
          </Link>

          <Link
            to="/#events"
            className="p-5 rounded-2xl bg-[#10151E]/70 hover:bg-[#10151E] border border-white/10 hover:border-[#FF6A00]/40 transition-all group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-[#FF6A00] transition-colors">
                Live Events & Tickets
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Book your seats for upcoming adventure gatherings.
              </p>
            </div>
          </Link>

          <button
            onClick={openCart}
            className="p-5 rounded-2xl bg-[#10151E]/70 hover:bg-[#10151E] border border-white/10 hover:border-[#FF6A00]/40 transition-all group flex items-center gap-4 text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 relative">
              <ShoppingBag className="w-6 h-6" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6A00] text-black font-bold text-[10px] flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-[#FF6A00] transition-colors">
                Your Shopping Cart
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                {totalCount > 0 ? `${totalCount} item(s) ready for checkout` : 'Browse official adventure merchandise'}
              </p>
            </div>
          </button>
        </div>

        {/* Recent Purchases & Orders */}
        {orders && orders.length > 0 && (
          <div className="bg-[#10151E]/90 rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Recent Direct Purchases
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Track your official Certified Adventures gear deliveries.
                </p>
              </div>
              <span className="text-xs font-bold text-[#FF6A00] px-2.5 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.orderId} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#FF6A00] font-bold">{ord.orderId}</span>
                    <span className="text-green-400 font-bold capitalize bg-green-500/10 px-2 py-0.5 rounded-full text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-white/80">
                    {ord.items.map((it, i) => (
                      <span key={i} className="mr-3">
                        {it.quantity}x {it.name} ({it.size || 'STD'})
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between text-white/50 text-[11px]">
                    <span>{new Date(ord.date).toLocaleDateString()} • {ord.paymentMethod}</span>
                    <strong className="text-white">KES {ord.total.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
