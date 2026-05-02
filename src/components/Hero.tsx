import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero_sakleshpur_1777705987157.png';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-brand-green text-white pb-12">
      {/* Background Image */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroImage} 
          alt="Sakleshpur Hills" 
          className="w-full h-full object-cover brightness-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/80 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-transparent"></div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-6 lg:px-12 pt-40 md:pt-48 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-start md:justify-center">
        <div className="max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-10 border border-white/20 text-brand-yellow"
          >
            Explore the Western Ghats
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6 tracking-tighter"
          >
            Discover the <br/><span className="text-brand-yellow">Mist-Clad</span> Trails.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-xl text-gray-200 mb-10 max-w-lg leading-relaxed"
          >
            Immerse yourself in lush coffee plantations, hidden waterfalls, and historical fortresses. Your premium gateway to the Switzerland of Karnataka.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link 
              to="/places" 
              className="px-8 py-4 bg-brand-yellow text-brand-green font-bold rounded-2xl flex items-center gap-3 text-lg hover:bg-yellow-400 transition-shadow shadow-xl shadow-brand-yellow/20"
            >
              View Destinations
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-gray-300"></div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-gray-400"></div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-gray-500"></div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-green bg-brand-yellow text-[10px] font-bold text-brand-green">2k+</div>
              </div>
              <span className="text-sm text-gray-300 font-medium">Happy Explorers</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
