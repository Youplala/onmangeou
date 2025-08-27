import { motion, useMotionValue, useTransform } from 'framer-motion';

interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  foodType: string;
  price: string;
  walkTime: string;
  description: string;
  googleMapsUrl: string;
  menuUrl: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  isVotingAnimation: boolean;
  playSwipeHint: boolean;
  onDragEnd: (e: any, info: { offset: { x: number; y: number } }) => void;
  x: any;
  rotate: any;
  overlayGreen: any;
  overlayRed: any;
  crossOpacity: any;
  checkOpacity: any;
}

export default function RestaurantCard({
  restaurant,
  isVotingAnimation,
  playSwipeHint,
  onDragEnd,
  x,
  rotate,
  overlayGreen,
  overlayRed,
  crossOpacity,
  checkOpacity,
}: RestaurantCardProps) {
  return (
    <motion.div
      key={restaurant.id}
      drag={isVotingAnimation ? false : 'x'}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      style={{ x, rotate }}
      animate={playSwipeHint ? { x: [0, 35, -35, 0] } : undefined}
      transition={playSwipeHint ? { duration: 1.2, ease: 'easeInOut' } : undefined}
      className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-6 w-full max-w-sm text-black cursor-grab active:cursor-grabbing"
    >
      {/* Color overlays for swipe feedback */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ backgroundColor: 'rgba(34,197,94,0.28)', opacity: overlayGreen }}
      />
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ backgroundColor: 'rgba(239,68,68,0.28)', opacity: overlayRed }}
      />
      {/* Red cross for NO swipe */}
      <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ opacity: crossOpacity }}
      >
        <span className="text-red-600 text-8xl font-black select-none">✕</span>
      </motion.div>
      {/* Green check for YES swipe */}
      <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ opacity: checkOpacity }}
      >
        <span className="text-8xl select-none">✅</span>
      </motion.div>
      {playSwipeHint && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur text-gray-800 ring-1 ring-black/10 px-3 py-1 text-xs font-semibold rounded-full select-none shadow">
          Glisse ← → pour voter
        </div>
      )}
      <div className="relative z-10 text-center pointer-events-none">
        <span className="text-6xl" role="img">{restaurant.emoji}</span>
        <h3 className="text-3xl font-extrabold my-3">{restaurant.name}</h3>
        <p className="text-lg font-semibold text-gray-600 mb-4">{restaurant.foodType}</p>
        <div className="flex justify-center gap-4 mb-4">
          <span className="bg-emerald-100/80 text-emerald-800 rounded-full px-3 py-1 font-semibold text-sm ring-1 ring-emerald-700/20">{restaurant.price}</span>
          <span className="bg-amber-100/80 text-amber-800 rounded-full px-3 py-1 font-semibold text-sm ring-1 ring-amber-700/20">🚶 {restaurant.walkTime}</span>
        </div>
        <p className="text-base font-medium text-gray-700 mb-6">{restaurant.description}</p>
        <div className="flex justify-center gap-4 font-bold">
          <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-4 py-2 hover:bg-white transition-colors cursor-pointer shadow">
            📍 Ouvrir l’itinéraire
          </a>
          <a href={restaurant.menuUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-4 py-2 hover:bg-white transition-colors cursor-pointer shadow">
            📖 Voir le menu
          </a>
        </div>
      </div>
    </motion.div>
  );
}
