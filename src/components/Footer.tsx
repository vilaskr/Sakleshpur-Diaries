import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white/70 py-12 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 italic">Sakleshpur<span className="text-brand-yellow not-italic">Diaries</span></h3>
          <p className="text-sm max-w-sm">
            Curated experiences, luxury stays, and hidden gems in the heart of the Western Ghats.
          </p>
        </div>
        
        <div className="flex gap-6 text-sm font-semibold tracking-wide">
          <Link to="/places" className="hover:text-brand-yellow transition-colors">Places</Link>
          <Link to="/stays" className="hover:text-brand-yellow transition-colors">Stays</Link>
          <Link to="/food-spots" className="hover:text-brand-yellow transition-colors">Food</Link>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest opacity-50 pt-4 md:pt-0">
          <Link to="/admin/login" className="hover:text-brand-yellow transition-colors">Admin Access</Link>
          <div className="w-px h-3 bg-white/30"></div>
          <span>© {new Date().getFullYear()} SAKLESHPUR DIARIES</span>
        </div>
      </div>
    </footer>
  );
}
