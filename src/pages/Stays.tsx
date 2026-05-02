import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Card from '../components/Card';

interface Stay {
  id: string;
  name: string;
  description: string;
  images?: { url: string; public_id: string }[];
  priceRange: string;
  locationLink?: string;
}

export default function Stays() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStays = async () => {
      try {
        const staysQuery = query(collection(db, 'stays'), where('createdBy', '==', 'admin'));
        const snap = await getDocs(staysQuery);
        const staysData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stay));
        setStays(staysData);
      } catch (error) {
        console.error('Error fetching stays', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, []);

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen bg-color-paper">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-brand-ink mb-4 tracking-tight">Curated Stays</h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl">From luxury eco-resorts to authentic plantation homestays, find your perfect retreat.</p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-green mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Havens...</p>
          </div>
        ) : stays.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 font-medium">No stays added yet.</p>
             <p className="text-sm text-gray-400 mt-1">Admin will add content soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stays.map((stay, i) => {
              const displayImage = stay.images?.[0]?.url || '';
              return (
                <motion.div key={stay.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card id={stay.id} title={stay.name} description={stay.description} imageUrl={displayImage} linkTo={`/stays`} badge={stay.priceRange} locationLink={stay.locationLink} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

