import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback } from 'react';
import RestaurantCard from './RestaurantCard';
import type { Restaurant } from '@/types/restaurant';

// --- TYPES ---

interface RestaurantDeckProps {
  restaurants: Restaurant[];
  currentIndex: number;
  isVotingAnimation: boolean;
  playSwipeHint: boolean;
  onVote: (vote: 'OUI' | 'NON') => void;
}

export interface RestaurantDeckRef {
  triggerSwipeAnimation: (direction: 'left' | 'right') => void;
}

// --- COMPONENT ---
const RestaurantDeck = forwardRef<RestaurantDeckRef, RestaurantDeckProps>(function RestaurantDeck({
  restaurants,
  currentIndex,
  isVotingAnimation,
  playSwipeHint,
  onVote,
}, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const overlayGreen = useTransform(x, [0, 60, 200], [0, 0.15, 0.35]);
  const overlayRed = useTransform(x, [-200, -60, 0], [0.35, 0.15, 0]);
  const crossOpacity = useTransform(x, [-200, -60, 0], [1, 0.6, 0]);
  const checkOpacity = useTransform(x, [0, 60, 200], [0, 0.6, 1]);

  // Leaving overlay state and motion values (decoupled from shared x)
  const [leaving, setLeaving] = useState<{ restaurant: Restaurant; direction: 'left' | 'right' } | null>(null);
  const leavingX = useMotionValue(0);
  const leavingRotate = useTransform(leavingX, [-200, 200], [-15, 15]);

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

  // Ensure the new top card starts centered after the index advances
  useEffect(() => {
    x.set(0);
  }, [currentIndex]);

  const handleDragEnd = (e: any, { offset }: any) => {
    if (offset.x > 100) {
      onVote('OUI');
    } else if (offset.x < -100) {
      onVote('NON');
    } else {
      x.set(0);
    }
  };

  const triggerSwipeAnimation = useCallback(async (direction: 'left' | 'right') => {
    if (leaving) return;
    const current = restaurants[currentIndex];
    if (!current) return;
    // Start overlay from current drag position
    setLeaving({ restaurant: current, direction });
    leavingX.set(x.get());
    const targetX = direction === 'right' ? 420 : -420;
    await animate(leavingX, targetX, { ease: 'easeOut', duration: 0.26 });
    setLeaving(null);
    leavingX.set(0);
  }, [leaving, restaurants, currentIndex, leavingX, x]);

  useImperativeHandle(ref, () => ({
    triggerSwipeAnimation,
  }), [triggerSwipeAnimation]);

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: '560px' }}>
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
              <span className="text-red-600">←</span>
              <span>Pas chaud</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span>Allez</span>
              <span className="text-green-600">→</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stack of Cards - Show 3 cards max */}
      {restaurants.slice(currentIndex, currentIndex + 3).map((restaurant, i) => {
        const isTop = i === 0;
        const zIndex = 10 - i;
        const scale = 1 - i * 0.05;
        const yOffset = i * 12;
        const opacity = i === 0 ? 1 : 0.8 - i * 0.3;

        return (
          <motion.div
            key={restaurant.id}
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

      {/* Leaving overlay card */}
      {leaving && (
        <motion.div
          className="absolute w-full h-full"
          style={{ zIndex: 20, x: leavingX, rotate: leavingRotate }}
        >
          <RestaurantCard restaurant={leaving.restaurant} />
        </motion.div>
      )}

      {/* Card Counter - Moved to bottom */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur text-gray-800 ring-1 ring-black/10 px-4 py-2 text-sm font-bold rounded-full shadow-lg"
        style={{ zIndex: 1000, pointerEvents: 'none' }}
      >
        {currentIndex + 1} / {restaurants.length}
      </div>
    </div>
  );
});

export default RestaurantDeck;
