import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Image as ImageIcon, Map, Compass, MapPin, 
  Camera, MessageSquare, FileText, Calendar, FolderOpen, 
  Settings, Users, ShoppingBag, Mail, LogOut
} from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter',sans-serif]">
      {/* Sidebar */}
      <div className="w-64 bg-[#08121B] text-white flex flex-col shadow-2xl z-10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#E67A3A] tracking-wide uppercase text-sm">Certified Admin</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center space-x-3 p-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-[#E67A3A]/20 text-[#E67A3A]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-[#E67A3A]' : 'text-gray-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center space-x-3 p-2.5 w-full rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
}
