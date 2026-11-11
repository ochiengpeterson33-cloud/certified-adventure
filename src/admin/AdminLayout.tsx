import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Image as ImageIcon, Map, Compass, MapPin, 
  Camera, MessageSquare, FileText, Calendar, FolderOpen, 
  Settings, Users, ShoppingBag, Mail, LogOut, Menu, X, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import officialLogo from '../assets/images/certified_logo_1785596043136.png';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Hero Section', path: '/admin/hero', icon: ImageIcon },
    { name: 'Destinations', path: '/admin/destinations', icon: MapPin },
    { name: 'Travel Packages', path: '/admin/packages', icon: Compass },
    { name: 'Road Trips', path: '/admin/road-trips', icon: Map },
    { name: 'Gallery', path: '/admin/gallery', icon: Camera },
    { name: 'Merch Store', path: '/admin/merch', icon: ShoppingBag },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Blog', path: '/admin/blog', icon: FileText },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Media Library', path: '/admin/media', icon: FolderOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Bookings', path: '/admin/bookings', icon: ShoppingBag },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
    { name: 'Homepage Content', path: '/admin/homepage', icon: LayoutDashboard },
  ];

  // Auto-close mobile sidebar whenever route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const currentItem = navItems.find((item) => 
    item.path === '/admin' 
      ? location.pathname === '/admin' 
      : location.pathname.startsWith(item.path)
  );

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const adminName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : user?.email?.split('@')[0] || 'Admin';

  const adminInitial = (adminName[0] || 'A').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-['Inter',sans-serif] text-slate-800 antialiased overflow-x-hidden">
      {/* =========================================================================
          MOBILE TOP NAVBAR (Sticky header on phones & tablets < 1024px)
         ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#08121B] text-white px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open Admin Menu"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white cursor-pointer shrink-0 transition-all"
          >
            <Menu className="w-5 h-5 text-[#E67A3A]" />
          </button>
          
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0d1c29] border border-[#E67A3A]/40 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img src={officialLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white tracking-wide uppercase truncate">
                Certified Admin
              </span>
              <span className="text-[10px] text-[#E67A3A] font-semibold truncate leading-tight">
                {currentItem?.name || 'Dashboard'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            title="View Live Website"
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E67A3A]" />
            <span className="hidden xs:inline text-[11px]">Site</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E67A3A] to-[#FF9800] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {adminInitial}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE DRAWER BACKDROP (for < 1024px)
         ========================================================================= */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          SIDEBAR NAVIGATION (Fixed Drawer on Mobile, Static Sidebar on Desktop)
         ========================================================================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#08121B] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0d1c29] border border-[#E67A3A]/40 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-sm">
              <img src={officialLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase truncate">
                Certified Admin
              </h2>
              <span className="text-[10px] text-[#E67A3A] font-semibold uppercase tracking-wider">
                Management Portal
              </span>
            </div>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                  isActive 
                    ? 'bg-[#E67A3A] text-white shadow-md shadow-[#E67A3A]/25 font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white shrink-0' : 'text-gray-400 shrink-0'} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 space-y-2 bg-[#060e15]">
          {/* Admin user quick info */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E67A3A] to-[#FF9800] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminName}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <ShieldCheck className="w-3 h-3 text-[#E67A3A]" />
                <span className="truncate">{profile?.role || 'Super Admin'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              <ExternalLink size={14} className="text-[#E67A3A]" />
              <span className="truncate">View Site</span>
            </Link>

            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (Fluid & horizontally contained)
         ========================================================================= */}
      <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden bg-gray-50 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
