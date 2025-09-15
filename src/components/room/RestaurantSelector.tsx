import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantDeck, { RestaurantDeckRef } from './RestaurantDeck';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  socket: any;
  userName: string;
  roomId: string;
  currentUserIndex: number;
  onVote: (restaurantName: string, vote: 'OUI' | 'NON') => void;
}

export default function RestaurantSelector({
  restaurants,
  socket,
  userName,
  roomId,
  currentUserIndex,
  onVote,
}: RestaurantSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVotingAnimation, setIsVotingAnimation] = useState(false);
  const [playSwipeHint, setPlaySwipeHint] = useState(false);

  useEffect(() => {
    setCurrentIndex(currentUserIndex);
  }, [currentUserIndex]);

  useEffect(() => {
    if (restaurants.length > 0) {
      setPlaySwipeHint(true);
      const timer = setTimeout(() => setPlaySwipeHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [restaurants]);

  const deckRef = useRef<RestaurantDeckRef>(null);

  const handleVote = (vote: 'OUI' | 'NON') => {
    if (currentIndex >= restaurants.length) return;
    const currentRestaurant = restaurants[currentIndex];
    setIsVotingAnimation(true);

    deckRef.current?.triggerSwipeAnimation(vote === 'OUI' ? 'right' : 'left');

    setCurrentIndex(prev => prev + 1);

    onVote(currentRestaurant.name, vote);

    setIsVotingAnimation(false);
  };

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 md:h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Chargement des restaurants...</p>
      </div>
    );
  }


  if (currentIndex >= restaurants.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Tous les restaurants ont été votés!</h3>
        <p className="text-gray-600 mb-4">Attendez que les autres terminent leur vote</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Restaurant Deck */}
      <RestaurantDeck
        ref={deckRef}
        restaurants={restaurants}
        currentIndex={currentIndex}
        isVotingAnimation={isVotingAnimation}
        playSwipeHint={playSwipeHint}
        onVote={handleVote}
      />

      {/* Voting Buttons for Desktop */}
      <div className="hidden lg:flex justify-center gap-6 mt-8">
        <button
          onClick={() => handleVote('NON')}
          disabled={isVotingAnimation}
          className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:shadow-xl hover:scale-110 hover:from-red-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 transform"
        >
          ✕
        </button>
        <button
          onClick={() => handleVote('OUI')}
          disabled={isVotingAnimation}
          className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:shadow-xl hover:scale-110 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 transform"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
