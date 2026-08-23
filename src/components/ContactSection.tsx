import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-24 bg-[#FF6A00] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="font-['Poppins'] font-black text-[clamp(2.25rem,4vw+1rem,4.5rem)] text-white uppercase tracking-tighter leading-none mb-6">
          Stay In The Loop
        </h2>
        <p className="text-white/90 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive drops, early bird tickets, and secret adventure routes.
        </p>
        
        <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL"
              className="w-full bg-black/40 border border-white/20 text-white placeholder-white/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white focus:bg-black/60 transition-all font-['Poppins'] font-bold tracking-widest text-base uppercase"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-[#FF6A00] bg-white hover:bg-black hover:text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-2 shrink-0"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  );
};
