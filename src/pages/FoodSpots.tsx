import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Card from '../components/Card';

interface FoodSpot {
  id: string;
  name: string;
  description: string;
  images?: { url: string; public_id: string }[];
  cuisine: string;
  locationLink?: string;
}

export default function FoodSpots() {
  const [foodSpots, setFoodSpots] = useState<FoodSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodSpots = async () => {
      try {
        const spotsQuery = query(collection(db, 'food_spots'), where('createdBy', '==', 'admin'));
        const snap = await getDocs(spotsQuery);
        const foodsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodSpot));
        setFoodSpots(foodsData);
      } catch (error) {
        console.error('Error fetching food spots', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodSpots();
  }, []);

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen bg-color-paper">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-brand-ink mb-4 tracking-tight">Food Spots</h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl">Taste the rich culinary heritage of Malnad. Spices, fresh coffee, and authentic flavors.</p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-green mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Preparing Menu...</p>
          </div>
        ) : foodSpots.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 font-medium">No food spots added yet.</p>
             <p className="text-sm text-gray-400 mt-1">Admin will add content soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foodSpots.map((spot, i) => {
              const displayImage = spot.images?.[0]?.url || '';
              return (
                <motion.div key={spot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card id={spot.id} title={spot.name} description={spot.description} imageUrl={displayImage} linkTo={`/food-spots`} badge={spot.cuisine} locationLink={spot.locationLink} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
