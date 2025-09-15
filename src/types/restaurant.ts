export interface Restaurant {
    id: string;
    name: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    categories: string[];
    mainCategory?: string;
    address?: string;
    phone?: string;
    website?: string;
    featuredImage?: string;
    workdayTiming?: string;
    closedOn?: string | string[];
    isTemporarilyClosed?: boolean;
    reviewKeywords?: string[];
    googleMapsLink?: string;
    competitors?: Array<{
      name: string;
      link: string;
      reviews: string;
      rating?: number;
      mainCategory?: string;
    }>;
    isSpendingOnAds?: boolean;
    priceRange?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }