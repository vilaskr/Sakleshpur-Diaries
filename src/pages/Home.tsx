import Hero from '../components/Hero';
import Card from '../components/Card';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Example interfaces
interface Place { 
  id: string; 
  name: string; 
  description: string; 
  images?: { url: string; public_id: string }[]; 
  imageUrl?: string; 
  category?: string; 
}
interface Stay { 
  id: string; 
  name: string; 
  description: string; 
  images?: { url: string; public_id: string }[]; 
  imageUrl?: string; 
  priceRange?: string; 
}

export default function Home() {
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [featuredStays, setFeaturedStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick load from Firebase for featured section (simulating featured)
    const fetchFeatured = async () => {
      try {
        const placesQuery = query(collection(db, 'places'), where('createdBy', '==', 'admin'));
        const placesSnap = await getDocs(placesQuery);
        const placesData = placesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place)).slice(0, 3);
        setFeaturedPlaces(placesData);

        const staysQuery = query(collection(db, 'stays'), where('createdBy', '==', 'admin'));
        const staysSnap = await getDocs(staysQuery);
        const staysData = staysSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stay)).slice(0, 3);
        setFeaturedStays(staysData);
      } catch (error) {
         console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      <Hero />
      
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-brand-ink mb-4 tracking-tight">Must Visit Places</h2>
              <p className="text-gray-500 max-w-xl text-sm md:text-lg">From historical star-shaped forts to breathtaking viewpoints.</p>
            </div>
            <a href="/places" className="hidden md:inline-flex items-center font-bold text-brand-green hover:underline">View All →</a>
          </div>
          
          {!loading && featuredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No places added yet.</p>
              <p className="text-sm text-gray-400 mt-1">Admin will add content soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {featuredPlaces.map((place, i) => {
                const displayImage = place.images?.[0]?.url || place.imageUrl || '';
                return (
                  <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card id={place.id} title={place.name} description={place.description} imageUrl={displayImage} linkTo={`/places/${place.id}`} badge={place.category} />
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="md:hidden text-center mt-8">
            <a href="/places" className="inline-flex items-center justify-center w-full px-8 py-4 bg-gray-50 text-brand-green font-black rounded-2xl border-2 border-gray-100 active:scale-95 transition-all">
              View All Places
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-color-paper">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-brand-ink mb-4 tracking-tight">Curated Stays</h2>
              <p className="text-gray-500 max-w-xl text-sm md:text-lg">Retreat into nature with our handpicked luxury eco-resorts.</p>
            </div>
            <a href="/stays" className="hidden md:inline-flex items-center font-bold text-brand-green hover:underline">View All →</a>
          </div>
          
          {!loading && featuredStays.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No stays added yet.</p>
              <p className="text-sm text-gray-400 mt-1">Admin will add content soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {featuredStays.map((stay, i) => {
                const displayImage = stay.images?.[0]?.url || stay.imageUrl || '';
                return (
                  <motion.div key={stay.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card id={stay.id} title={stay.name} description={stay.description} imageUrl={displayImage} linkTo="/stays" badge={stay.priceRange} />
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="md:hidden text-center mt-8">
            <a href="/stays" className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-brand-green font-black rounded-2xl border-2 border-gray-100 active:scale-95 transition-all">
              Explore All Stays
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
