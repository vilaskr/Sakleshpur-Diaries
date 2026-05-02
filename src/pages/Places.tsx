import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Card from '../components/Card';

interface Place { 
  id: string; 
  name: string; 
  description: string; 
  images?: { url: string; public_id: string }[]; 
  imageUrl?: string; // Fallback for old data
  category?: string; 
  locationLink?: string;
}

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const placesQuery = query(collection(db, 'places'), where('createdBy', '==', 'admin'));
        const snap = await getDocs(placesQuery);
        const placesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
        setPlaces(placesData);
      } catch (error) {
        console.error('Error fetching places', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen bg-color-paper">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-brand-ink mb-4 tracking-tight">Explore Places</h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl">Discover the scenic beauty, historical forts, and cascading waterfalls of Sakleshpur.</p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-green mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Cloud...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 font-medium">No places added yet.</p>
             <p className="text-sm text-gray-400 mt-1">Admin will add content soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place, i) => {
              const displayImage = place.images?.[0]?.url || place.imageUrl || '';
              return (
                <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card id={place.id} title={place.name} description={place.description} imageUrl={displayImage} linkTo={`/places/${place.id}`} badge={place.category} locationLink={place.locationLink} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
