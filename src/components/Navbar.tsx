import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { 
  MapPin, Phone, Mail, 
  Facebook, Instagram, MessageCircle, Twitter,
  Search, User, Heart, ShoppingCart, 
  Menu, X, ArrowRight, ChevronDown, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
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
  const navigate = useNavigate();
  const location = useLocation();

  const { data: packages } = usePackages();
  const featuredPackages = packages?.filter(p => p.active !== false).slice(0, 4) || [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      
      const sections = ['home', 'packages', 'gallery', 'events', 'merch', 'about', 'contact'];
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

  const navLinks = [
    { name: 'HOME', id: 'home' },
    { name: 'ADVENTURES', id: 'packages', hasMegaMenu: true },
    { name: 'DESTINATIONS', id: 'destinations' },
    { name: 'GALLERY', id: 'gallery' },
    { name: 'EVENTS', id: 'events' },
    { name: 'MERCH', id: 'merch' },
    { name: 'ABOUT', id: 'about' },
    { name: 'CONTACT', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      onNavigateSection(id);
    }
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleUserClick = () => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      }
    } else {
      navigate('/login');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
  className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 font-['Poppins'] ${
    isScrolled || mobileMenuOpen
      ? 'bg-white/90 backdrop-blur-2xl border-b border-slate-200 shadow-md'
      : 'bg-white/80 backdrop-blur-md'
  }`} 
>
      {/* Top Bar - #111111 */}
      <div className={`w-full bg-slate-900 text-slate-200 text-[10px] sm:text-[11px] px-4 sm:px-8 transition-all duration-500 overflow-hidden ${
  isScrolled
    ? 'h-0 opacity-0'
    : 'h-[34px] flex items-center'
}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer hidden md:flex">
              <Phone className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>+254 707630535</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#FF7A00] transition-colors cursor-pointer hidden sm:flex">
              <Mail className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>hello@certified.com</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="hover:text-[#FF7A00] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors"><MessageCircle className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className={`max-w-[1400px] mx-auto px-6 transition-all duration-500 ${isScrolled ? 'h-[80px]' : 'h-[72px]'}`}>
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div onClick={() => handleLinkClick('home')} className="cursor-pointer flex items-center mr-14 shrink-0">
             <Logo variant="full" darkText={true} showTagline={true} />
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-12 h-full">
            {navLinks.map((link) => (
              <div 
                key={link.id}
                className="h-full flex items-center relative"
                onMouseEnter={() => link.hasMegaMenu && setMegaMenuOpen(true)}
                onMouseLeave={() => link.hasMegaMenu && setMegaMenuOpen(false)}
              >
                <button
                  onClick={() => link.hasMegaMenu ? setMegaMenuOpen(!megaMenuOpen) : handleLinkClick(link.id)}
                  className={`relative font-medium text-[15px] text-slate-700 hover:text-[#F97316] transition-all duration-300 flex items-center gap-1 group ${
                    activeSection === link.id ? 'text-[#FF7A00]' : 'text-gray-800 hover:text-[#FF7A00]'
                  }`}
                >
                  {link.name}
                  {link.hasMegaMenu && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} />}
                  
                  {/* Underline animation */}
                  <span className={`absolute -bottom-1 left-0 h-[3px] rounded-full bg-[#FF7A00] transition-all duration-300 ${
                    activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
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
                        className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[95vw] lg:w-[900px] bg-white rounded-3xl shadow-xl border border-slate-200 p-6 overflow-hidden z-50 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Featured Adventures</h3>
                          <button onClick={() => { handleLinkClick('packages'); setMegaMenuOpen(false); }} className="text-[#FF7A00] font-semibold text-sm hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {featuredPackages.map((pkg: any, idx: number) => (
                            <div key={idx} onClick={() => { onOpenBookingModal(pkg.title); setMegaMenuOpen(false); }} className="group cursor-pointer rounded-xl overflow-hidden bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                              <div className="aspect-[4/3] overflow-hidden relative">
                                <img loading="lazy" src={pkg.image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801'} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-[#FF7A00] transition-colors">{pkg.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{pkg.description || 'Explore this amazing destination with us.'}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#FF7A00] text-sm">${pkg.price || '999'}</span>
                                  <button className="text-xs font-bold text-gray-900 bg-gray-200 px-3 py-1.5 rounded-lg group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Right Icons & CTA */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <div className="flex items-center gap-2 xl:gap-3">
              {[
                { icon: Search, onClick: () => {} },
                { icon: User, onClick: handleUserClick },
                { icon: Heart, onClick: () => {} },
                { icon: ShoppingCart, onClick: () => {} }
              ].map((Action, i) => (
                <button key={i} onClick={Action.onClick} className="w-11 h-11 rounded-full bg-transparent flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-[#F97316] transition-all duration-200 group relative">
                  <Action.icon className="w-5 h-5 transition-transform group-active:scale-95" />
                  {i === 3 && (
                     <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">0</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenBookingModal()}
              className="h-[48px] px-6 rounded-2xl font-['Poppins'] text-sm font-bold uppercase tracking-wider text-white bg-[#F97316] to-[#FF9800] hover:from-[#ff8c20] hover:to-[#ffaa33] transition-all duration-300 shadow-lg shadow-[#FF7A00]/30 hover:shadow-[#FF7A00]/50 hover:-translate-y-1 hover:scale-105 active:translate-y-0 flex items-center gap-2 relative overflow-hidden group"
            >
              <span className="relative z-10">book your seat</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex lg:hidden items-center gap-4 relative z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-12 h-12 rounded-x1 bg-gray-100 flex items-center justify-center text-gray-900 border border-gray-200 shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col h-screen overflow-y-auto"
            style={{ paddingTop: '100px' }}
          >
            <div className="flex flex-col px-6 py-8 gap-6 flex-1">
              {navLinks.map((link, idx) => (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="text-left text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 hover:text-[#FF7A00] transition-colors border-b border-gray-100 pb-4"
                >
                  {link.name}
                </motion.button>
              ))}

              <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { icon: Search, onClick: () => {} },
                  { icon: User, onClick: handleUserClick },
                  { icon: Heart, onClick: () => {} },
                  { icon: ShoppingCart, onClick: () => {} }
                ].map((Action, i) => (
                  <button key={i} onClick={Action.onClick} className="aspect-square rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-200">
                    <Action.icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Fixed Button */}
            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => { onOpenBookingModal(); setMobileMenuOpen(false); }}
                className="w-full h-[60px] rounded-2xl font-['Poppins'] text-lg font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#FF7A00] to-[#FF9800] flex items-center justify-center gap-3 shadow-xl shadow-[#FF7A00]/30"
              >
                <span>book Now</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
