import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// --- TYPES ---
interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  mainCategory: string;
  address: string;
  phone: string;
  website: string;
  featuredImage: string;
  workdayTiming: string;
  closedOn: string[];
  isTemporarilyClosed: boolean;
  reviewKeywords: string[];
  googleMapsLink: string;
  competitors: Array<{
    name: string;
    link: string;
    reviews: string;
    rating: number;
    mainCategory: string;
  }>;
  isSpendingOnAds: boolean;
  priceRange: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  overlayGreen?: any;
  overlayRed?: any;
  crossOpacity?: any;
  checkOpacity?: any;
}

// --- COMPONENT ---
export default function RestaurantCard({
  restaurant,
  overlayGreen,
  overlayRed,
  crossOpacity,
  checkOpacity,
}: RestaurantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Detect if the description is visually truncated by the line clamp
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const check = () => {
      // scrollHeight > clientHeight means overflow (i.e., clamped)
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [restaurant.description]);

  return (
    <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden select-none border border-gray-100">
      {/* Card Content */}
      <div className="w-full h-full flex flex-col text-center p-6 gap-3">
        {/* Top Section */}
        <div className="flex-shrink-0">
          {/* Restaurant Image or Category Icon */}
          <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-4xl shadow-lg">
            {restaurant.featuredImage ? (
              <img 
                src={restaurant.featuredImage} 
                alt={restaurant.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const sibling = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full rounded-full flex items-center justify-center text-white ${restaurant.featuredImage ? 'hidden' : 'flex'}`}>
              🍽️
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{restaurant.name}</h2>
          
          {/* Rating and Reviews */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
              <span className="text-yellow-500 text-lg">⭐</span>
              <span className="font-bold text-gray-800 ml-1 text-lg">{restaurant.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700 font-medium">{restaurant.reviewCount} avis</span>
          </div>
          
          {/* Category + Price Range on one line */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              {restaurant.mainCategory}
            </div>
            {restaurant.priceRange && (
              <div className="text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full shadow-md">
                💰 {restaurant.priceRange}
              </div>
            )}
          </div>
          
          {/* Keywords - limited to save space */}
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {restaurant.reviewKeywords.length > 0 ? (
              restaurant.reviewKeywords.slice(0, 2).map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                  {keyword}
                </span>
              ))
            ) : (
              // Default keywords if none available
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                Restaurant
              </span>
            )}
          </div>
        </div>

        {/* Middle Section - Description */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Description */}
          {restaurant.description && (
            <div
              className="bg-gray-50 rounded-xl p-3 mb-5"
              onClick={isTruncated ? () => setIsModalOpen(true) : undefined}
              style={{ cursor: isTruncated ? 'pointer' as const : 'default' }}
            >
              <p ref={descRef} className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-2">
                {restaurant.description}
              </p>
              {isTruncated && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-orange-600 hover:text-orange-700 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Lire la suite
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section - Action Buttons */}
        <div className="flex-shrink-0 w-full flex justify-center gap-3 mt-2">
          <a 
            href={restaurant.googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 max-w-[120px] rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-3 py-2 hover:from-orange-600 hover:to-rose-600 transition-all duration-200 cursor-pointer shadow-lg text-sm text-center transform hover:scale-105"
          >
            📍 Itinéraire
          </a>
          {restaurant.website && (
            <a 
              href={restaurant.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 max-w-[120px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-3 py-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 cursor-pointer shadow-lg text-sm text-center transform hover:scale-105"
            >
              🌐 Site web
            </a>
          )}
        </div>
      </div>

      {/* Description Modal (portal to avoid clipping/transform issues) */}
      {typeof window !== 'undefined' && createPortal(
        (
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-bold text-gray-800 ml-1">{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-600">{restaurant.reviewCount} avis</span>
                    {restaurant.priceRange && (
                      <div className="text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full">
                        💰 {restaurant.priceRange}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block mb-4">
                    {restaurant.mainCategory}
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {restaurant.description}
                  </p>
                  
                  <p className="text-gray-600 text-xs mb-4">{restaurant.address}</p>
                  
                  {restaurant.reviewKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.reviewKeywords.slice(0, 5).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <a 
                      href={restaurant.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-4 py-3 text-center hover:from-orange-600 hover:to-rose-600 transition-all duration-200"
                    >
                      📍 Itinéraire
                    </a>
                    {restaurant.website && (
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-4 py-3 text-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                      >
                        🌐 Site web
                      </a>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        ), document.body)
      }

      {/* Swipe Overlays (only shown on the top card) */}
      {overlayGreen && (
        <motion.div
          className="absolute inset-0 bg-green-500/80 flex items-center justify-center"
          style={{ opacity: overlayGreen, pointerEvents: 'none' }}
        >
          <motion.div style={{ opacity: checkOpacity }}>
            <svg
              className="w-32 h-32 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {overlayRed && (
        <motion.div
          className="absolute inset-0 bg-red-500/80 flex items-center justify-center"
          style={{ opacity: overlayRed, pointerEvents: 'none' }}
        >
          <motion.div style={{ opacity: crossOpacity }}>
            <svg
              className="w-32 h-32 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
