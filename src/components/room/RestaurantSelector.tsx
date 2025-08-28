import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantDeck, { RestaurantDeckRef } from './RestaurantDeck';

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

interface RestaurantSelectorProps {
  socket: any;
  userName: string;
  roomId: string;
  currentUserIndex: number;
  onVote: (restaurantName: string, vote: 'OUI' | 'NON') => void;
}

export default function RestaurantSelector({
  socket,
  userName,
  roomId,
  currentUserIndex,
  onVote,
}: RestaurantSelectorProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVotingAnimation, setIsVotingAnimation] = useState(false);
  const [playSwipeHint, setPlaySwipeHint] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minRating: 4.0,
    isOpen: true
  });

  // Load restaurants on component mount
  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          action: 'random',
          count: '10',
          ...(filters.category && { category: filters.category }),
          ...(filters.minRating && { minRating: filters.minRating.toString() }),
          ...(filters.isOpen && { isOpen: 'true' })
        });

        const response = await fetch(`/api/restaurants?${params}`);
        if (!response.ok) throw new Error('Failed to fetch restaurants');
        
        const data: Restaurant[] = await response.json();
        setRestaurants(data);
        
        if (data.length > 0) {
          setPlaySwipeHint(true);
          setTimeout(() => setPlaySwipeHint(false), 4000);
        }
      } catch (error) {
        console.error('Error loading restaurants:', error);
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, [filters]);

  // Update current restaurant index based on user progress
  useEffect(() => {
    setCurrentIndex(currentUserIndex);
  }, [currentUserIndex]);

  const deckRef = useRef<RestaurantDeckRef>(null);

  const handleVote = (vote: 'OUI' | 'NON') => {
    if (currentIndex >= restaurants.length) return;
    const currentRestaurant = restaurants[currentIndex];
    setIsVotingAnimation(true);

    // Kick off deck feedback (non-blocking)
    deckRef.current?.triggerSwipeAnimation(vote === 'OUI' ? 'right' : 'left');

    // Immediately advance to render next card; AnimatePresence will exit the old one
    setCurrentIndex(prev => prev + 1);

    // Emit the vote without delaying UI flow
    onVote(currentRestaurant.name, vote);

    // Unlock quickly
    setIsVotingAnimation(false);
  };

  const handleRefreshRestaurants = async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    
    try {
      const params = new URLSearchParams({
        action: 'random',
        count: '10',
        ...(filters.category && { category: filters.category }),
        ...(filters.minRating && { minRating: filters.minRating.toString() }),
        ...(filters.isOpen && { isOpen: 'true' })
      });

      const response = await fetch(`/api/restaurants?${params}`);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      
      const data: Restaurant[] = await response.json();
      setRestaurants(data);
      
      if (data.length > 0) {
        setPlaySwipeHint(true);
        setTimeout(() => setPlaySwipeHint(false), 4000);
      }
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Chargement des restaurants...</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun restaurant trouvé</h3>
        <p className="text-gray-600 mb-4">Essayez de modifier vos filtres</p>
        <button
          onClick={handleRefreshRestaurants}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold px-6 py-3 shadow hover:opacity-95 transition"
        >
          Recharger
        </button>
      </div>
    );
  }

  if (currentIndex >= restaurants.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Tous les restaurants votés!</h3>
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
