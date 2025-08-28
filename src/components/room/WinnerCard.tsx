import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface WinnerCardProps {
  name: string;
  votes: number;
}

// Mirror the RestaurantCard fields we need to display
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
  closedOn: string[] | string;
  isTemporarilyClosed: boolean;
  reviewKeywords: string[];
  googleMapsLink: string;
  isSpendingOnAds?: boolean;
  priceRange?: string;
}

const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F97316', '#D946EF'];

function ConfettiBurst({ count = 28 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const dx = (Math.random() * 2 - 1) * 180;
        const dy = -80 - Math.random() * 180;
        const rot = Math.random() * 540;
        const delay = Math.random() * 0.12;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: dx, y: dy, opacity: 0, rotate: rot }}
            transition={{ duration: 1.15, ease: 'easeOut', delay }}
          />
        );
      })}
    </div>
  );
}

export default function WinnerCard({ name, votes }: WinnerCardProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Fetch full details by name so we can mirror RestaurantCard info
  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/restaurants?action=search&query=${encodeURIComponent(name)}`);
        if (!res.ok) return;
        const list: Restaurant[] = await res.json();
        const best = list.find(r => r.name.toLowerCase() === name.toLowerCase()) || list[0] || null;
        if (!cancelled) setRestaurant(best);
      } catch (e) {
        // ignore
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [name]);

  // Detect if the description is visually truncated by the line clamp
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [restaurant?.description]);

  const mapsUrl = restaurant?.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'On mange où ?', text: `On a choisi ${name} !`, url: mapsUrl });
      } else {
        await navigator.clipboard.writeText(mapsUrl);
        alert('Lien copié dans le presse-papiers');
      }
    } catch {}
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-6 md:p-8 w-full max-w-sm text-black text-center"
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 -z-10 opacity-70" style={{
        background: 'radial-gradient(120px 120px at 50% 10%, rgba(255,255,255,0.9), transparent 70%), radial-gradient(800px 200px at 50% 110%, rgba(255,255,255,0.6), transparent 60%)'
      }} />

      {/* Confetti */}
      <ConfettiBurst />

      {/* Trophy */}
      <motion.div
        className="mx-auto mb-3 md:mb-4 text-6xl md:text-7xl"
        initial={{ scale: 0, rotate: -20, y: -10 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        🏆
      </motion.div>

      <motion.h2
        className="text-sm font-semibold text-rose-700/90 bg-rose-50/80 inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ring-rose-200 mb-2"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
        <span>Le vote est terminé</span>
        <span>•</span>
        <span>Gagnant</span>
      </motion.h2>

      {/* Avatar / Image like RestaurantCard */}
      <div className="flex-shrink-0">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-4xl shadow-lg">
          {restaurant?.featuredImage ? (
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
          <div className={`w-full h-full rounded-full flex items-center justify-center text-white ${restaurant?.featuredImage ? 'hidden' : 'flex'}`}>
            🍽️
          </div>
        </div>
      </div>

      <motion.h3
        className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35 }}
      >
        {name}
      </motion.h3>

      <motion.div
        className="text-black/70 font-semibold mb-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16, duration: 0.35 }}
      >
        {votes} vote{votes > 1 ? 's' : ''}
      </motion.div>

      {/* Rating & reviews */}
      {restaurant && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-bold text-gray-800 ml-1 text-lg">{restaurant.rating?.toFixed ? restaurant.rating.toFixed(1) : restaurant.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-700 font-medium">{restaurant.reviewCount} avis</span>
        </div>
      )}

      {/* Category + Price Range */}
      {restaurant && (
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
      )}

      {/* Keywords */}
      {restaurant && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {restaurant.reviewKeywords && restaurant.reviewKeywords.length > 0 ? (
            restaurant.reviewKeywords.slice(0, 2).map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {keyword}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
              Restaurant
            </span>
          )}
        </div>
      )}

      {/* Description (clamped with optional modal) */}
      {restaurant?.description && (
        <div
          className="bg-gray-50 rounded-xl p-3 mb-4 text-left"
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

      {/* Actions */}
      <motion.div
        className="flex items-center justify-center gap-2 md:gap-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.35 }}
      >
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-4 py-2 shadow hover:from-orange-600 hover:to-rose-600 transition-colors"
        >
          📍 Itinéraire
        </a>
        {restaurant?.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-4 py-2 shadow hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            🌐 Site web
          </a>
        )}
        <button
          onClick={handleShare}
          className="rounded-xl bg-white/80 hover:bg-white transition-colors ring-1 ring-black/10 px-4 py-2 shadow font-semibold"
        >
          🔗 Partager
        </button>
      </motion.div>

      {/* Description Modal (portal) */}
      {typeof window !== 'undefined' && createPortal(
        (
          <AnimatePresence>
            {isModalOpen && restaurant?.description && (
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
                    <h3 className="text-lg font-bold text-gray-900">{restaurant?.name || name}</h3>
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
                    {restaurant && (
                      <>
                        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-bold text-gray-800 ml-1">{restaurant.rating?.toFixed ? restaurant.rating.toFixed(1) : restaurant.rating}</span>
                        </div>
                        <span className="text-gray-600">{restaurant.reviewCount} avis</span>
                        {restaurant.priceRange && (
                          <div className="text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full">
                            💰 {restaurant.priceRange}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {restaurant && (
                    <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block mb-4">
                      {restaurant.mainCategory}
                    </div>
                  )}

                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {restaurant?.description}
                  </p>

                  {restaurant?.address && (
                    <p className="text-gray-600 text-xs mb-4">{restaurant.address}</p>
                  )}

                  {restaurant?.reviewKeywords && restaurant.reviewKeywords.length > 0 && (
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
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-4 py-3 text-center hover:from-orange-600 hover:to-rose-600 transition-all duration-200"
                    >
                      📍 Itinéraire
                    </a>
                    {restaurant?.website && (
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

      {/* QR on large screens */}
      <motion.div
        className="hidden lg:flex flex-col items-center gap-3 mt-6 pt-6 border-t border-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.4 }}
      >
        <h4 className="font-semibold text-sm">Scanne pour y aller</h4>
        <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/10 p-3 shadow">
          <QRCodeSVG value={mapsUrl} size={128} bgColor={"#ffffff"} />
        </div>
      </motion.div>

    </motion.div>
  );
}
