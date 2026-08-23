import React from 'react';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenBookingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onOpenBookingModal }) => {
  return (
    <footer className="bg-[#070707] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[800px] h-[300px] sm:h-[400px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6"><Logo variant="full" /></div>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed mb-8">
              Certified Adventures provides world-class, premium adventure experiences. We turn ordinary trips into extraordinary lifestyle memories.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-bold text-white uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigateSection('packages')} className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">Adventures</button></li>
              <li><button onClick={() => onNavigateSection('about')} className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigateSection('contact')} className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">Contact</button></li>
              <li><button onClick={() => onNavigateSection('contact')} className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">Support</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-bold text-white uppercase tracking-wider mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/60 hover:text-[#FF6A00] text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="py-12 border-y border-white/10 text-center mb-12">
          <h2 className="font-['Poppins'] font-black text-3xl sm:text-5xl md:text-6xl lg:text-8xl text-white uppercase tracking-tighter opacity-80">
            WHEREVER YOU ROAM,<br/>
            <span className="text-[#FF6A00]">I AM CERTIFIED.</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Certified Adventures. All rights reserved.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1">
            Made for Adventurers
          </p>
        </div>
      </div>
    </footer>
  );
};
