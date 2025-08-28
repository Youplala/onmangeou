import { NextRequest, NextResponse } from 'next/server';
import { searchRestaurants, getRandomRestaurants, getTopRatedRestaurants, getCategories } from '@/server/restaurants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'search': {
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category') || '';
        const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
        const maxRating = searchParams.get('maxRating') ? parseFloat(searchParams.get('maxRating')!) : undefined;
        const minReviews = searchParams.get('minReviews') ? parseInt(searchParams.get('minReviews')!) : undefined;
        const isOpen = searchParams.get('isOpen') === 'true';

        const results = searchRestaurants({
          query,
          category,
          minRating,
          maxRating,
          minReviews,
          isOpen
        });

        return NextResponse.json(results);
      }

      case 'random': {
        const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 10;
        const category = searchParams.get('category') || '';
        const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
        const isOpen = searchParams.get('isOpen') === 'true';

        const results = getRandomRestaurants(count, {
          category,
          minRating,
          isOpen
        });

        return NextResponse.json(results);
      }

      case 'top': {
        const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 10;
        const category = searchParams.get('category') || '';
        const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
        const isOpen = searchParams.get('isOpen') === 'true';

        const results = getTopRatedRestaurants(count, {
          category,
          minRating,
          isOpen
        });

        return NextResponse.json(results);
      }

      case 'categories': {
        const categories = getCategories();
        return NextResponse.json(categories);
      }

      default: {
        // Default to random restaurants
        const results = getRandomRestaurants(10, { minRating: 4.0 });
        return NextResponse.json(results);
      }
    }
  } catch (error) {
    console.error('Restaurant API error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}
