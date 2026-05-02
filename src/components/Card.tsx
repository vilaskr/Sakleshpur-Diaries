import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkTo: string;
  badge?: string;
  locationLink?: string;
}

export default function Card({ title, description, imageUrl, linkTo, badge, locationLink }: CardProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative"
      onClick={() => navigate(linkTo)}
      role="button"
    >
      <div className="relative h-64 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
             <MapPin className="w-12 h-12" />
          </div>
        )}
        {badge && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-brand-ink pointer-events-none">
            {badge}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-ink mb-2">{title}</h3>
        <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-brand-green text-sm font-medium">
            <span>Explore</span>
            <MapPin className="w-4 h-4 ml-1" />
          </div>
          {locationLink && (
            <a 
              href={locationLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="z-10 p-2 bg-gray-50 rounded-full hover:bg-brand-green hover:text-white transition-colors text-brand-green"
              onClick={(e) => e.stopPropagation()}
              title="View on Google Maps"
            >
              <Navigation className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
