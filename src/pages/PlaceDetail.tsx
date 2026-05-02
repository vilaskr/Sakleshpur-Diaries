import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';

interface Place { 
  id: string; 
  name: string; 
  description: string; 
  images?: { url: string; public_id: string }[]; 
  imageUrl?: string; 
  category?: string; 
}

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'places', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlace({ id: docSnap.id, ...docSnap.data() } as Place);
        }
      } catch (error) {
        console.error("Error fetching place", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading) return <div className="min-h-screen pt-32 text-center text-brand-green font-black flex flex-col items-center gap-4">
    <Loader2 className="w-10 h-10 animate-spin" />
    INITIALIZING...
  </div>;
  if (!place) return <div className="min-h-screen pt-32 text-center text-xl">Place not found.</div>;

  const displayImage = place.images?.[0]?.url || place.imageUrl || '';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[60vh] w-full bg-gray-100">
        {displayImage && (
          <img src={displayImage} alt={place.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent" />
        <Link to="/places" className="absolute top-32 left-6 md:left-12 text-white flex items-center bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
             {place.category && (
               <span className="inline-block bg-brand-yellow text-brand-ink text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                 {place.category}
               </span>
             )}
             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{place.name}</h1>
             <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Sakleshpur, Karnataka, India</span>
             </div>
           </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-brand-ink mb-6">About this place</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="leading-relaxed">{place.description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
