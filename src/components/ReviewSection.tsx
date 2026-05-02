import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Star, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

interface Review {
  id: string;
  placeId: string;
  name: string;
  rating: number;
  review: string;
  images?: { url: string; public_id: string }[];
  createdAt: number;
}

export default function ReviewSection({ placeId }: { placeId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([]);

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('placeId', '==', placeId),
        // Note: Firestore requires an index for multiple fields, so we sort in client if no index
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      // Sort descending by createdAt
      data.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || !reviewText.trim()) {
      toast.error('Please fill all required fields and select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        placeId,
        name: name.trim(),
        rating,
        review: reviewText.trim(),
        images,
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), payload);
      setReviews(prev => [{ id: docRef.id, ...payload }, ...prev]);
      
      // Reset form
      setName('');
      setRating(0);
      setReviewText('');
      setImages([]);
      setShowForm(false);
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-brand-ink mb-2 tracking-tight">Traveler Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-brand-yellow">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-bold text-lg">{averageRating} out of 5</span>
            <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="hidden md:flex px-6 py-3 bg-brand-ink text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Write a Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-brand-ink/5">
              <h3 className="text-xl font-bold mb-6">Share your experience</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
                    placeholder="John Doe"
                    maxLength={64}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2 h-[50px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-all hover:scale-110 focus:outline-none`}
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all min-h-[120px] resize-y"
                  placeholder="Tell us what you loved about this place..."
                  maxLength={1000}
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos (Optional)</label>
                <div className="max-w-md">
                  <ImageUpload 
                    images={images}
                    onImagesChange={setImages}
                    folder="reviews"
                    maxFiles={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-8 py-3 bg-brand-green text-white rounded-xl font-bold flex items-center gap-2 hover:bg-brand-green/90 transition-all disabled:opacity-70"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Submit Review
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setShowForm(true)}
        className={`md:hidden w-full mb-8 px-6 py-4 bg-brand-ink text-white rounded-xl font-bold shadow-lg transition-all ${showForm ? 'hidden' : 'block'}`}
      >
        Write a Review
      </button>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-500 mb-2">No reviews yet</p>
          <p className="text-gray-400">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg">{review.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex text-brand-yellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{review.review}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                  {review.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img.url} 
                      alt="Review attachment" 
                      className="w-24 h-24 object-cover rounded-xl shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
