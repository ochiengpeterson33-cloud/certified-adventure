import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { 
  MapPin, Phone, Mail, 
  Facebook, Instagram, MessageCircle, Twitter,
  Search, User, Heart, ShoppingCart, 
  Menu, X, ArrowRight, ChevronDown, LogOut, Shield, UserPlus,
  Sun, Moon, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePackages } from '../hooks/useSupabaseData';

interface NavbarProps {
  onOpenBookingModal: (destination?: string) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookingModal, onNavigateSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { openCart, totalCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: packages } = usePackages();
  const featuredPackages = packages?.filter(p => p.active !== false).slice(0, 4) || [];
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      
      const sections = ['home', 'experiences', 'packages', 'gallery', 'events', 'merch', 'about', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scrolling, handle Escape key, and manage focus for the drawer
  useEffect(() => {
    if (mobileMenuOpen) {
      wasOpenRef.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusTimer = window.setTimeout(() => {
        drawerCloseButtonRef.current?.focus();
      }, 60);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      hamburgerButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  // Close drawer automatically on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'HOME', id: 'home' },
    { name: 'EXPERIENCES', id: 'experiences' },
    { name: 'ADVENTURES', id: 'packages', hasMegaMenu: true },
    { name: 'DESTINATIONS', id: 'destinations' },
    { name: 'GALLERY', id: 'gallery' },
    { name: 'EVENTS', id: 'events' },
    { name: 'MERCH', id: 'merch' },
    { name: 'ABOUT', id: 'about' },
    { name: 'CONTACT', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    const isPublicSection = location.pathname === '/' || ['home', 'experiences', 'packages', 'adventures', 'destinations', 'gallery', 'events', 'merch', 'about', 'contact'].includes(location.pathname.replace(/^\//, ''));
    if (!isPublicSection) {
      navigate(`/${id}`);
    } else {
      onNavigateSection(id);
    }
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleUserClick = () => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 font-['Poppins'] ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-md'
          : 'bg-white/85 backdrop-blur-md'
      }`}
    >
      {/* Top Bar */}
      <div
        className={`w-full bg-slate-900 text-slate-200 text-[10px] sm:text-[11px] px-4 sm:px-6 xl:px-8 transition-all duration-500 overflow-hidden ${
          isScrolled ? 'h-0 opacity-0' : 'h-[34px] flex items-center'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
              <span className="whitespace-nowrap">Nairobi, Kenya</span>
            </div>
            <div className="hidden md:flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer shrink-0">
              <Phone className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
              <span className="whitespace-nowrap">+254 707630535</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer shrink-0">
              <Mail className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
              <span className="whitespace-nowrap">hello@certified.com</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a href="#" aria-label="Facebook" className="hover:text-[#FF7A00] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-[#FF7A00] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Messages" className="hover:text-[#FF7A00] transition-colors"><MessageCircle className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-[#FF7A00] transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className={`w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 2xl:px-8 transition-all duration-500 ${isScrolled ? 'h-[72px] sm:h-[78px]' : 'h-[66px] sm:h-[74px]'}`}>
        <div className="flex items-center justify-between gap-3 sm:gap-4 xl:gap-3 min-[1400px]:gap-5 2xl:gap-8 h-full w-full">
          {/* 1. Dedicated Logo Flex Container */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center min-w-0 flex-1 sm:flex-initial sm:shrink-0 cursor-pointer"
          >
            <Logo variant="full" darkText={true} showTagline={true} compactHeader={true} />
          </div>

          {/* 2. Dedicated Center Navigation Links Container */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center justify-center flex-1 min-w-0 h-full"
          >
            <div className="flex items-center justify-center gap-2.5 min-[1400px]:gap-4 2xl:gap-5 h-full">
              {navLinks.map((link) => (
                <div
                  key={link.id}
                  className="h-full flex items-center relative shrink-0"
                  onMouseEnter={() => link.hasMegaMenu && setMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMegaMenu && setMegaMenuOpen(false)}
                >
                  <button
                    onClick={() => link.hasMegaMenu ? setMegaMenuOpen(!megaMenuOpen) : handleLinkClick(link.id)}
                    className={`relative font-medium text-[11.5px] min-[1400px]:text-[13px] 2xl:text-[13.5px] min-[1400px]:tracking-wide whitespace-nowrap transition-all duration-300 flex items-center gap-1 py-1.5 group cursor-pointer ${
                      activeSection === link.id ? 'text-[#FF7A00]' : 'text-gray-800 hover:text-[#FF7A00]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasMegaMenu && <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} />}

                    {/* Underline animation */}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#FF7A00] transition-all duration-300 ${
                        activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </button>

                  {/* Mega Menu Dropdown */}
                  {link.hasMegaMenu && (
                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 w-[90vw] max-w-[880px] bg-white rounded-3xl shadow-xl border border-slate-200 p-6 overflow-hidden z-50 cursor-default"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Featured Adventures</h3>
                            <button onClick={() => { handleLinkClick('packages'); setMegaMenuOpen(false); }} className="text-[#FF7A00] font-semibold text-sm hover:underline flex items-center gap-1">
                              View All <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                          {featuredPackages.length > 0 ? (
                            <div className="grid grid-cols-4 gap-4">
                              {featuredPackages.map((pkg: any, idx: number) => (
                                <div key={idx} onClick={() => { onOpenBookingModal(pkg.title); setMegaMenuOpen(false); }} className="group cursor-pointer rounded-xl overflow-hidden bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                                  <div className="aspect-[4/3] overflow-hidden relative bg-[#08121B]">
                                    {(pkg.featured_image || pkg.image_url || pkg.image) ? (
                                      <img loading="lazy" src={pkg.featured_image || pkg.image_url || pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#08121B] to-[#13293d] text-[#FF7A00]/45">
                                        <Compass className="w-8 h-8" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  </div>
                                  <div className="p-4">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-[#FF7A00] transition-colors">{pkg.title}</h4>
                                    {pkg.description && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{pkg.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[#FF7A00] text-sm">{pkg.price ? `$${pkg.price}` : 'Custom Quote'}</span>
                                      <button className="text-xs font-bold text-gray-900 bg-gray-200 px-3 py-1.5 rounded-lg group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                                        View
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-sm text-gray-500">
                              No featured packages published yet. Add packages from the admin panel.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* 3. Dedicated Right Action Icons & CTA Container (Desktop xl+) */}
          <div className="hidden xl:flex items-center gap-2 min-[1400px]:gap-3 2xl:gap-4 shrink-0">
            <div className="flex items-center gap-0.5 min-[1400px]:gap-1 2xl:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-8 h-8 min-[1400px]:w-9 min-[1400px]:h-9 2xl:w-10 2xl:h-10 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#F97316] flex items-center justify-center transition-all duration-200 group relative shrink-0 cursor-pointer border border-slate-200/80"
              >
                {isDark ? (
                  <Sun className="w-[16px] h-[16px] min-[1400px]:w-[17px] min-[1400px]:h-[17px] 2xl:w-[18px] 2xl:h-[18px] text-[#FF7A00] transition-transform group-hover:rotate-45" />
                ) : (
                  <Moon className="w-[16px] h-[16px] min-[1400px]:w-[17px] min-[1400px]:h-[17px] 2xl:w-[18px] 2xl:h-[18px] text-slate-700 transition-transform group-hover:-rotate-12" />
                )}
              </button>
              {[
                { icon: Search, label: 'Search', onClick: () => {} },
                { icon: User, label: 'User Profile', onClick: handleUserClick },
                { icon: Heart, label: 'Wishlist', onClick: () => {} },
                { icon: ShoppingCart, label: 'Shopping Cart', onClick: openCart, badge: totalCount }
              ].map((Action, i) => (
                <button
                  key={i}
                  onClick={Action.onClick}
                  aria-label={Action.label}
                  className="w-8 h-8 min-[1400px]:w-9 min-[1400px]:h-9 2xl:w-10 2xl:h-10 rounded-full bg-transparent flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-[#F97316] transition-all duration-200 group relative shrink-0 cursor-pointer"
                >
                  <Action.icon className="w-[17px] h-[17px] min-[1400px]:w-[18px] min-[1400px]:h-[18px] 2xl:w-5 2xl:h-5 transition-transform group-active:scale-95" />
                  {i === 3 && totalCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#FF7A00] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-sm shadow-[#FF7A00]/50 animate-pulse">
                      {totalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenBookingModal()}
              className="h-[38px] min-[1400px]:h-[42px] 2xl:h-[46px] px-3.5 min-[1400px]:px-4 2xl:px-5 rounded-2xl font-['Poppins'] text-[11px] min-[1400px]:text-[12px] 2xl:text-[13px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#F97316] to-[#FF9800] hover:from-[#ff8c20] hover:to-[#ffaa33] transition-all duration-300 shadow-lg shadow-[#FF7A00]/30 hover:shadow-[#FF7A00]/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 2xl:gap-2 relative overflow-hidden group whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="relative z-10">book your seat</span>
              <ArrowRight className="w-3.5 h-3.5 min-[1400px]:w-4 min-[1400px]:h-4 2xl:w-5 2xl:h-5 relative z-10 shrink-0 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Mobile & Tablet Actions (< xl):
              - Phones (< md): Only Hamburger by default; Cart appears when items are added
              - Tablets & Narrow Laptops (md to < xl): Action Icons + Book Your Seat + Hamburger */}
          <div className="flex xl:hidden items-center gap-2 sm:gap-3 relative z-50 shrink-0">
            {/* Tablet Action Icons (md to < xl) */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#F97316] flex items-center justify-center transition-all duration-200 group relative shrink-0 cursor-pointer border border-slate-200/80"
              >
                {isDark ? (
                  <Sun className="w-[17px] h-[17px] text-[#FF7A00]" />
                ) : (
                  <Moon className="w-[17px] h-[17px] text-slate-700" />
                )}
              </button>
              {[
                { icon: Search, label: 'Search', onClick: () => {} },
                { icon: User, label: 'User Profile', onClick: handleUserClick },
                { icon: Heart, label: 'Wishlist', onClick: () => {} },
                { icon: ShoppingCart, label: 'Shopping Cart', onClick: openCart, badge: totalCount }
              ].map((Action, i) => (
                <button
                  key={i}
                  onClick={Action.onClick}
                  aria-label={Action.label}
                  className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-[#F97316] transition-all duration-200 group relative shrink-0 cursor-pointer"
                >
                  <Action.icon className="w-[18px] h-[18px] transition-transform group-active:scale-95" />
                  {i === 3 && totalCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#FF7A00] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-sm shadow-[#FF7A00]/50 animate-pulse">
                      {totalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tablet Book Your Seat Button (md to < xl) */}
            <button
              onClick={() => onOpenBookingModal()}
              className="hidden md:flex h-[40px] px-4 rounded-2xl font-['Poppins'] text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#F97316] to-[#FF9800] hover:from-[#ff8c20] hover:to-[#ffaa33] transition-all duration-300 shadow-md shadow-[#FF7A00]/30 items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>book your seat</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Mobile-only Cart Button (< md): appears only when user has added items to cart */}
            {totalCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={openCart}
                aria-label="Shopping Cart"
                className="md:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 active:bg-orange-50 active:scale-95 flex items-center justify-center text-gray-800 hover:text-[#FF7A00] border border-gray-200 shadow-sm transition-all relative shrink-0 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                  {totalCount}
                </span>
              </motion.button>
            )}

            {/* Mobile & Tablet Hamburger Toggle */}
            <button
              ref={hamburgerButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 hover:bg-orange-50 active:scale-95 flex items-center justify-center text-gray-900 hover:text-[#FF7A00] border border-gray-200 shadow-sm transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Slide-In Right Navigation Drawer (Mobile & Tablet < xl) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-[70] font-['Poppins']" role="presentation">
            {/* Dark Semi-Transparent Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 bg-[#08121B]/65 backdrop-blur-[3px]"
            />

            {/* Right Slide-In Drawer Panel (88% width on phones, max 400px on tablet/desktop) */}
            <motion.aside
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed top-0 right-0 bottom-0 w-[88vw] max-w-[400px] flex flex-col shadow-[-24px_0_60px_rgba(8,18,27,0.28)] overflow-hidden ${
                isDark
                  ? 'bg-[#08121B] text-[#F4E8D2] border-l border-white/10'
                  : 'bg-white text-slate-900 border-l border-slate-200/90'
              }`}
            >
              {/* Drawer Header */}
              <div
                className={`px-5 py-4 flex items-center justify-between gap-3 border-b shrink-0 ${
                  isDark ? 'border-white/10' : 'border-slate-100'
                }`}
              >
                <div
                  onClick={() => handleLinkClick('home')}
                  className="cursor-pointer min-w-0"
                >
                  <Logo variant="full" darkText={!isDark} showTagline={false} compactHeader={true} />
                </div>

                <button
                  ref={drawerCloseButtonRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-[#F4E8D2] hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-orange-50 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]'
                  }`}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable Navigation & Account Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 flex flex-col gap-6">
                {/* Primary Navigation Links */}
                <nav aria-label="Mobile Navigation" className="flex flex-col">
                  <p
                    className={`px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      isDark ? 'text-white/45' : 'text-slate-400'
                    }`}
                  >
                    Explore
                  </p>
                  <ul
                    className={`divide-y ${
                      isDark ? 'divide-white/[0.07]' : 'divide-slate-100'
                    }`}
                  >
                    {navLinks.map((link, idx) => {
                      const isActive = activeSection === link.id;
                      return (
                        <motion.li
                          key={link.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: 0.05 + idx * 0.025,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleLinkClick(link.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`w-full min-h-[48px] px-3 py-3 my-0.5 rounded-xl flex items-center justify-between gap-3 text-left transition-colors duration-200 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${
                              isActive
                                ? isDark
                                  ? 'bg-[#FF7A00]/15 text-[#FF7A00]'
                                  : 'bg-orange-50/90 text-[#FF7A00]'
                                : isDark
                                ? 'text-[#F4E8D2] hover:bg-white/[0.05] hover:text-[#FF7A00] active:bg-white/[0.08]'
                                : 'text-slate-800 hover:bg-slate-50 hover:text-[#FF7A00] active:bg-orange-50/60'
                            }`}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <span
                                aria-hidden="true"
                                className={`w-1.5 h-1.5 rounded-full transition-colors shrink-0 ${
                                  isActive
                                    ? 'bg-[#FF7A00]'
                                    : isDark
                                    ? 'bg-white/20 group-hover:bg-[#FF7A00]'
                                    : 'bg-slate-300 group-hover:bg-[#FF7A00]'
                                }`}
                              />
                              <span className="text-[15px] font-semibold tracking-wide truncate">
                                {link.name}
                              </span>
                            </span>

                            <ArrowRight
                              aria-hidden="true"
                              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                                isActive
                                  ? 'text-[#FF7A00] translate-x-0.5'
                                  : isDark
                                  ? 'text-white/30 group-hover:text-[#FF7A00] group-hover:translate-x-1'
                                  : 'text-slate-300 group-hover:text-[#FF7A00] group-hover:translate-x-1'
                              }`}
                            />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Quick Utilities (Appearance & Cart) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-2.5"
                >
                  <p
                    className={`px-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      isDark ? 'text-white/45' : 'text-slate-400'
                    }`}
                  >
                    Preferences &amp; Bag
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-200 cursor-pointer active:scale-[0.98] ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-[#F4E8D2] hover:border-[#FF7A00]/60'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-[#FF7A00]/50 hover:bg-orange-50/40'
                      }`}
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 text-[#FF7A00] shrink-0" aria-hidden="true" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-[#FF7A00] shrink-0" aria-hidden="true" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCart();
                      }}
                      className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-200 cursor-pointer active:scale-[0.98] relative ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-[#F4E8D2] hover:border-[#FF7A00]/60'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-[#FF7A00]/50 hover:bg-orange-50/40'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-[#FF7A00] shrink-0" aria-hidden="true" />
                      <span>Cart</span>
                      {totalCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold inline-flex items-center justify-center tabular-nums">
                          {totalCount}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Account Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`p-4 rounded-2xl border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="flex items-center gap-3 text-left cursor-pointer group w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FF9800] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#FF7A00]/25 shrink-0">
                          {(profile?.first_name ? profile.first_name[0] : '') || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate group-hover:text-[#FF7A00] transition-colors ${
                              isDark ? 'text-[#F4E8D2]' : 'text-slate-900'
                            }`}
                          >
                            {profile?.first_name
                              ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                              : user.email?.split('@')[0]}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isDark ? 'text-white/55' : 'text-slate-500'
                            }`}
                          >
                            {user.email}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A00] shrink-0">
                          {isAdmin ? 'Admin' : 'Member'}
                        </span>
                      </button>

                      <div
                        className={`grid grid-cols-2 gap-2 pt-3 border-t ${
                          isDark ? 'border-white/10' : 'border-slate-200/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className={`min-h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-[#F4E8D2] hover:border-[#FF7A00]'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-[#FF7A00]/50 hover:text-[#FF7A00]'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 text-[#FF7A00]" aria-hidden="true" />
                          <span>My Profile</span>
                        </button>

                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigate('/admin');
                            }}
                            className="min-h-[42px] px-3 rounded-xl bg-[#FF7A00] hover:bg-[#e86d00] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                          >
                            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Admin Portal</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              signOut();
                              setMobileMenuOpen(false);
                            }}
                            className={`min-h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] ${
                              isDark
                                ? 'bg-red-950/40 border-red-400/25 text-red-300 hover:bg-red-950/70'
                                : 'bg-white border-slate-200 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Sign Out</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isDark ? 'text-[#F4E8D2]' : 'text-slate-800'
                          }`}
                        >
                          Member Access
                        </span>
                        <span
                          className={`text-[11px] ${
                            isDark ? 'text-white/55' : 'text-slate-500'
                          }`}
                        >
                          Bookings &amp; itineraries
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/login');
                          }}
                          className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98] ${
                            isDark
                              ? 'bg-white/5 border-white/15 text-[#F4E8D2] hover:border-[#FF7A00]'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-[#FF7A00]'
                          }`}
                        >
                          Sign In
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/register');
                          }}
                          className="min-h-[44px] px-3 rounded-xl bg-[#FF7A00] hover:bg-[#e86d00] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] shadow-sm shadow-[#FF7A00]/25"
                        >
                          <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Register</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Drawer Footer Primary CTA */}
              <div
                className={`p-5 border-t shrink-0 ${
                  isDark ? 'border-white/10 bg-[#08121B]' : 'border-slate-100 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenBookingModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[52px] rounded-2xl font-['Poppins'] text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#F97316] to-[#FF9800] hover:from-[#ff8c20] hover:to-[#ffaa33] flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF7A00]/30 transition-all active:scale-[0.985] cursor-pointer"
                >
                  <span>Book Your Seat</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
