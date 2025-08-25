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
      className="relative bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-sm text-black cursor-grab active:cursor-grabbing"
    >
      {/* Color overlays for swipe feedback */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ backgroundColor: 'rgba(34,197,94,0.35)', opacity: overlayGreen }}
      />
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ backgroundColor: 'rgba(239,68,68,0.35)', opacity: overlayRed }}
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white border-4 border-white px-2 py-1 text-xs font-black rounded-full select-none">
          Glisse ← →
        </div>
      )}
      <div className="relative z-10 text-center pointer-events-none">
        <span className="text-6xl" role="img">{restaurant.emoji}</span>
        <h3 className="text-3xl font-black my-4">{restaurant.name}</h3>
        <p className="text-lg font-bold text-gray-500 mb-4">{restaurant.foodType}</p>
        <div className="flex justify-center gap-4 mb-4">
          <span className="bg-green-200 border-2 border-black px-3 py-1 font-bold text-sm">{restaurant.price}</span>
          <span className="bg-yellow-200 border-2 border-black px-3 py-1 font-bold text-sm">🚶 {restaurant.walkTime}</span>
        </div>
        <p className="text-base font-bold text-gray-700 mb-6">{restaurant.description}</p>
        <div className="flex justify-center gap-4 font-bold">
          <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-black px-4 py-2 hover:bg-gray-100 transition-colors">📍 Maps</a>
          <a href={restaurant.menuUrl} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-black px-4 py-2 hover:bg-gray-100 transition-colors">📖 Menu</a>
        </div>
      </div>
    </motion.div>
  );
}
