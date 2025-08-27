import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import RestaurantCard from './RestaurantCard';

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

interface RestaurantDeckProps {
  restaurants: Restaurant[];
  currentIndex: number;
  isVotingAnimation: boolean;
  playSwipeHint: boolean;
  onVote: (vote: 'OUI' | 'NON') => void;
}

// --- COMPONENT ---
export default function RestaurantDeck({
  restaurants,
  currentIndex,
  isVotingAnimation,
  playSwipeHint,
  onVote,
}: RestaurantDeckProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const overlayGreen = useTransform(x, [0, 60, 200], [0, 0.15, 0.35]);
  const overlayRed = useTransform(x, [-200, -60, 0], [0.35, 0.15, 0]);
  const crossOpacity = useTransform(x, [-200, -60, 0], [1, 0.6, 0]);
  const checkOpacity = useTransform(x, [0, 60, 200], [0, 0.6, 1]);

  // Animated swipe hint demonstration
  useEffect(() => {
    if (playSwipeHint) {
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Initial delay
        
        // Swipe right
        await animate(x, 80, { 
          type: 'spring', 
          stiffness: 200, 
          damping: 25,
          duration: 0.6 
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Back to center
        await animate(x, 0, { 
          type: 'spring', 
          stiffness: 200, 
          damping: 25,
          duration: 0.4 
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Swipe left
        await animate(x, -80, { 
          type: 'spring', 
          stiffness: 200, 
          damping: 25,
          duration: 0.6 
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Back to center
        await animate(x, 0, { 
          type: 'spring', 
          stiffness: 200, 
          damping: 25,
          duration: 0.4 
        });
      };
      
      sequence();
    }
  }, [playSwipeHint, x]);

  const handleDragEnd = (e: any, { offset }: any) => {
    if (offset.x > 100) {
      onVote('OUI');
    } else if (offset.x < -100) {
      onVote('NON');
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: '520px' }}>
      {/* Enhanced Swipe Hint */}
      {playSwipeHint && (
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 1000 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white/95 backdrop-blur text-gray-800 ring-1 ring-black/10 px-4 py-2 text-sm font-semibold rounded-full select-none shadow-lg whitespace-nowrap">
            Glisse pour voter
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-green-600">←</span>
              <span>Allez</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span>Pas chaud</span>
              <span className="text-red-600">→</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stack of Cards - Show 3 cards max */}
      {restaurants.slice(currentIndex, currentIndex + 3).map((restaurant, i) => {
        const isTop = i === 0;
        const zIndex = 10 - i;
        const scale = 1 - i * 0.04;
        const yOffset = i * 8;
        const opacity = 1 - i * 0.1;

        return (
          <motion.div
            key={`${restaurant.id}-${currentIndex}`}
            className="absolute w-full h-full"
            style={{
              zIndex,
              x: isTop ? x : 0,
              rotate: isTop ? rotate : 0,
              pointerEvents: isTop ? 'auto' : 'none',
            }}
            drag={isTop && !isVotingAnimation && !playSwipeHint ? 'x' : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={isTop ? handleDragEnd : undefined}
            initial={i === 0 ? false : { scale: 0.9, y: 20, opacity: 0.8 }}
            animate={{
              scale,
              y: yOffset,
              opacity,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
              duration: 0.6,
            }}
          >
            <RestaurantCard
              restaurant={restaurant}
              overlayGreen={isTop ? overlayGreen : undefined}
              overlayRed={isTop ? overlayRed : undefined}
              crossOpacity={isTop ? crossOpacity : undefined}
              checkOpacity={isTop ? checkOpacity : undefined}
            />
          </motion.div>
        );
      })}

      {/* Card Counter */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-gray-800 ring-1 ring-black/10 px-4 py-2 text-sm font-semibold rounded-full shadow-lg"
        style={{ zIndex: 1000, pointerEvents: 'none' }}
      >
        {currentIndex + 1} / {restaurants.length}
      </div>
    </div>
  );
}
