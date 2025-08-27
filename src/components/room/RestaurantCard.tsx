import { motion } from 'framer-motion';

// --- TYPES ---
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
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden select-none border border-white/50">
      {/* Card Content */}
      <div className="w-full h-full flex flex-col items-center justify-between text-center p-6">
                <div className="w-full">
          <div className="text-8xl mb-4">{restaurant.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-800">{restaurant.name}</h2>
          <div className="text-md text-gray-500 mt-2">
            {restaurant.foodType} • {restaurant.price} • {restaurant.walkTime}
          </div>
          <p className="text-gray-600 mt-4 text-base leading-relaxed max-w-xs mx-auto">{restaurant.description}</p>
        </div>

        <div className="w-full flex justify-center gap-4 font-bold">
          <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-5 py-3 hover:bg-white transition-colors cursor-pointer shadow-lg text-base">
            📍 Itinéraire
          </a>
          <a href={restaurant.menuUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-5 py-3 hover:bg-white transition-colors cursor-pointer shadow-lg text-base">
            📖 Menu
          </a>
        </div>
      </div>

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
