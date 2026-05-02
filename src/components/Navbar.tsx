import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Places', path: '/places' },
    { name: 'Stays', path: '/stays' },
    { name: 'Food', path: '/food-spots' },
    { name: 'Itineraries', path: '/itineraries' },
  ];

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-brand-green/90 backdrop-blur-md shadow-sm py-4" : "bg-gradient-to-b from-black/60 to-transparent py-8 px-6 lg:px-12"
    )}>
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <span className={cn("text-2xl font-extrabold tracking-tight italic", scrolled ? "text-white" : "text-white")}>Sakleshpur <span className="text-brand-yellow not-italic">Diaries</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-white hover:text-brand-yellow transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <button className="bg-brand-yellow text-brand-green font-bold px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(244,180,0,0.4)] transition-all">Plan My Trip</button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white transition-all active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
             <X className="w-6 h-6" />
          ) : (
             <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-brand-ink/60 backdrop-blur-sm z-[-1]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white/95 backdrop-blur-md shadow-2xl absolute top-full left-4 right-4 mt-4 rounded-[2rem] overflow-hidden border border-white/20"
            >
              <nav className="flex flex-col p-8 space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-black text-brand-ink hover:text-brand-green flex items-center justify-between group"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-green transition-colors" />
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full bg-brand-green text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-green/20">
                    Plan My Trip
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
