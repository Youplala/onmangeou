import fs from 'fs';
import path from 'path';

export interface Restaurant {
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
  closedOn: string;
  isTemporarilyClosed: boolean;
  reviewKeywords: string[];
  googleMapsLink: string;
  competitors: Array<{
    name: string;
    link: string;
    reviews: string;
  }>;
  isSpendingOnAds: boolean;
}

let restaurantsCache: Restaurant[] | null = null;

export function loadRestaurants(): Restaurant[] {
  if (restaurantsCache) {
    return restaurantsCache;
  }

  try {
    const restaurantsPath = path.join(process.cwd(), 'public/data/restaurants.json');
    const restaurantsData = fs.readFileSync(restaurantsPath, 'utf-8');
    restaurantsCache = JSON.parse(restaurantsData);
    return restaurantsCache || [];
  } catch (error) {
    console.error('Error loading restaurants:', error);
    return [];
  }
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
  isOpen?: boolean;
}

export function searchRestaurants(filters: SearchFilters = {}): Restaurant[] {
  const restaurants = loadRestaurants();
  
  return restaurants.filter(restaurant => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchText = `${restaurant.name} ${restaurant.description} ${restaurant.categories.join(' ')} ${restaurant.reviewKeywords.join(' ')}`.toLowerCase();
      if (!searchText.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (filters.category) {
      if (!restaurant.categories.some(cat => 
        cat.toLowerCase().includes(filters.category!.toLowerCase())
      )) {
        return false;
      }
    }

    // Rating filters
    if (filters.minRating && restaurant.rating < filters.minRating) {
      return false;
    }
    if (filters.maxRating && restaurant.rating > filters.maxRating) {
      return false;
    }

    // Review count filter
    if (filters.minReviews && restaurant.reviewCount < filters.minReviews) {
      return false;
    }

    // Open status filter
    if (filters.isOpen !== undefined && filters.isOpen && restaurant.isTemporarilyClosed) {
      return false;
    }

    return true;
  });
}

export function getRandomRestaurants(count: number = 10, filters: SearchFilters = {}): Restaurant[] {
  const filteredRestaurants = searchRestaurants(filters);
  const shuffled = [...filteredRestaurants].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getTopRatedRestaurants(count: number = 10, filters: SearchFilters = {}): Restaurant[] {
  const filteredRestaurants = searchRestaurants(filters);
  return filteredRestaurants
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, count);
}

export function getRestaurantById(id: string): Restaurant | null {
  const restaurants = loadRestaurants();
  return restaurants.find(r => r.id === id) || null;
}

export function getCategories(): Array<{ category: string; count: number }> {
  const restaurants = loadRestaurants();
  const categoryCount: Record<string, number> = {};
  
  restaurants.forEach(restaurant => {
    restaurant.categories.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
