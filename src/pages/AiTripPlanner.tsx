import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sparkles, Send, Loader2, Map as MapIcon, Coffee, Home as HomeIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AIPlanItem {
  time: string;
  activity: string;
  description: string;
  type: string; // 'Place' | 'Food' | 'Stay' | 'Travel'
}

interface AIDayPlan {
  day: number;
  plan: AIPlanItem[];
}

interface AIResponse {
  days: AIDayPlan[];
  overallAdvice: string;
}

export default function AiTripPlanner() {
  const [prompt, setPrompt] = useState('Plan a 2-day trip to Sakleshpur focusing on nature and good food.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [contextData, setContextData] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all places, stays, food spots to feed into Gemini context
    const fetchContext = async () => {
      try {
        const [placesSnap, staysSnap, foodSnap] = await Promise.all([
          getDocs(collection(db, 'places')),
          getDocs(collection(db, 'stays')),
          getDocs(collection(db, 'food_spots')),
        ]);

        const places = placesSnap.docs.map(d => ({ name: d.data().name, category: d.data().category, description: d.data().description }));
        const stays = staysSnap.docs.map(d => ({ name: d.data().name, price: d.data().priceRange, description: d.data().description }));
        const food = foodSnap.docs.map(d => ({ name: d.data().name, cuisine: d.data().cuisine, description: d.data().description }));

        const context = JSON.stringify({ places, stays, foodSpots: food });
        setContextData(context);
      } catch (err) {
        console.error("Error fetching context for AI:", err);
      }
    };
    fetchContext();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contextData })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch AI response');
      }

      const parsed: AIResponse = await response.json();
      setResult(parsed);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while planning the trip.");
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'place': return <MapIcon className="w-5 h-5 text-brand-green" />;
      case 'food': return <Coffee className="w-5 h-5 text-brand-yellow" />;
      case 'stay': return <HomeIcon className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-brand-ink rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-green rounded-full blur-3xl opacity-50 pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-brand-yellow" />
            AI Trip Assistant
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Let our intelligent guide craft the perfect Sakleshpur itinerary for you. Tell us what you love, and we'll handle the rest.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12 flex flex-col md:flex-row focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Plan a 3-day family trip with a mix of nature and history..."
            className="flex-1 px-8 py-6 text-lg outline-none bg-transparent placeholder:text-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="m-2 px-8 py-4 bg-brand-green text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-green/90 transition-all disabled:opacity-50 disabled:hover:bg-brand-green"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            {loading ? 'Planning...' : 'Generate Plan'}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-brand-green/5 border border-brand-green/20 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-brand-ink mb-3">Guide's Note</h3>
                <p className="text-gray-700 leading-relaxed">{result.overallAdvice}</p>
              </div>

              {result.days.map((dayPlan) => (
                <div key={dayPlan.day} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 md:px-8 py-4">
                    <h2 className="text-2xl font-black text-brand-ink">Day {dayPlan.day}</h2>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    {dayPlan.plan.map((item, idx) => (
                      <div key={idx} className="flex gap-4 md:gap-6 relative">
                        {idx !== dayPlan.plan.length - 1 && (
                          <div className="absolute left-6 md:left-[38px] top-12 bottom-[-2rem] w-0.5 bg-gray-100" />
                        )}
                        <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-gray-50 rounded-2xl border-2 border-gray-100 flex flex-col items-center justify-center z-10 relative">
                          <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-tighter">{item.time}</span>
                        </div>
                        <div className="flex-1 pt-1 md:pt-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getIconForType(item.type)}
                            <h4 className="text-lg font-bold text-brand-ink">{item.activity}</h4>
                          </div>
                          <p className="text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
