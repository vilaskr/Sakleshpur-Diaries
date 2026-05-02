import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { MapPin, Hotel, Utensils, Calendar, ArrowRight, Loader2, Database, Zap } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { seedInitialData } from '../../lib/seedData';

export default function Dashboard() {
  const { user, role } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const stats = [
    { id: 'places', title: 'Places', to: '/admin/places', icon: MapPin, color: 'bg-blue-500' },
    { id: 'stays', title: 'Stays', to: '/admin/stays', icon: Hotel, color: 'bg-purple-500' },
    { id: 'food_spots', title: 'Food Spots', to: '/admin/food_spots', icon: Utensils, color: 'bg-orange-500' },
    { id: 'itineraries', title: 'Itineraries', to: '/admin/itineraries', icon: Calendar, color: 'bg-brand-green' },
  ];

  const fetchCounts = async () => {
    try {
      const collections = ['places', 'stays', 'food_spots', 'itineraries'];
      const results = await Promise.all(
        collections.map(async (col) => {
          const snap = await getDocs(collection(db, col));
          return { [col]: snap.size };
        })
      );
      setCounts(Object.assign({}, ...results));
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm('This will populate the database with initial discovery data. Continue?')) return;
    setSeeding(true);
    try {
      await seedInitialData();
      await fetchCounts();
      alert('Database seeded successfully!');
    } catch (err) {
      console.error('Seeding failed:', err);
      alert('Seeding failed. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  const isEmpty = !loading && Object.values(counts).every(c => c === 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-brand-ink mb-2">Workspace</h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">Hello, {user?.displayName || user?.email?.split('@')[0]}! Here's what's happening.</p>
        </div>
        {isEmpty && role === 'owner' && (
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-brand-yellow text-brand-ink px-8 py-4 rounded-2xl font-black shadow-xl shadow-brand-yellow/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            Seed Initial Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map(item => (
          <Link 
            key={item.to} 
            to={item.to}
            className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-ink/5 transition-all flex flex-col justify-between h-40 md:h-44"
          >
            <div className="flex justify-between items-start">
              <div className={`${item.color} p-2.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg shadow-current/20`}>
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-ink transition-colors" />
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl md:text-2xl font-black text-brand-ink">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : (counts[item.id] || 0)}
                </span>
                <h3 className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">{item.title}</h3>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-brand-green transition-colors uppercase tracking-wider">Configure Assets →</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-black text-brand-ink mb-6 md:mb-8 flex items-center gap-3">
            <div className="w-2 h-6 md:w-2 md:h-8 bg-brand-yellow rounded-full" />
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Account Level</p>
              <p className="text-lg md:text-xl font-black text-brand-ink flex items-center gap-2">
                <span className="capitalize">{role || 'Fetching...'}</span>
                {role === 'owner' && <span className="bg-brand-yellow/30 text-brand-green text-[10px] px-2 py-0.5 rounded-md border border-brand-yellow/50">AUTHORITY</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Storage System</p>
              <p className="text-lg md:text-xl font-black text-brand-ink">Cloudinary + Firestore</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Global Region</p>
              <p className="text-lg md:text-xl font-black text-brand-ink">Asia Southeast 1</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background shape */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
