const fs = require('fs');
const path = require('path');

// Read and parse the CSV file
function parseCSV(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  
  // Parse CSV with proper handling of quoted multiline fields
  const restaurants = [];
  const headers = ['place_id', 'name', 'description', 'is_spending_on_ads', 'reviews', 'rating', 'competitors', 'website', 'phone', 'can_claim', 'owner', 'featured_image', 'main_category', 'categories', 'workday_timing', 'is_temporarily_closed', 'is_permanently_closed', 'closed_on', 'address', 'review_keywords', 'link', 'status', 'price_range', 'reviews_per_rating', 'featured_question', 'reviews_link', 'coordinates', 'plus_code', 'detailed_address', 'time_zone', 'cid', 'data_id', 'about', 'images', 'hours', 'most_popular_times', 'popular_times', 'menu', 'reservations', 'order_online_links', 'featured_reviews', 'detailed_reviews', 'query'];
  
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;
  let fieldIndex = 0;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRecord[fieldIndex] = currentField.trim();
      currentField = '';
      fieldIndex++;
    } else if (char === '\n' && !inQuotes) {
      // End of record
      currentRecord[fieldIndex] = currentField.trim();
      
      if (currentRecord.length >= headers.length && currentRecord[1]) { // Skip header and empty records
        const restaurant = {};
        headers.forEach((header, index) => {
          restaurant[header] = currentRecord[index] || '';
        });
        
        // Clean and enhance the data
        const cleanRestaurant = {
          id: restaurant.place_id,
          name: restaurant.name,
          description: restaurant.description,
          rating: parseFloat(restaurant.rating) || 0,
          reviewCount: parseInt(restaurant.reviews) || 0,
          categories: parseCategories(restaurant.categories),
          mainCategory: restaurant.main_category,
          address: restaurant.address,
          phone: restaurant.phone,
          website: restaurant.website,
          featuredImage: restaurant.featured_image,
          workdayTiming: restaurant.workday_timing,
          closedOn: parseClosedDays(restaurant.closed_on),
          isTemporarilyClosed: restaurant.is_temporarily_closed === 'True',
          reviewKeywords: parseKeywords(restaurant.review_keywords),
          googleMapsLink: restaurant.link,
          competitors: parseCompetitorsJSON(restaurant.competitors),
          isSpendingOnAds: restaurant.is_spending_on_ads === 'True',
          priceRange: restaurant.price_range || '',
          coordinates: parseCoordinates(restaurant.coordinates)
        };
        
        // Only add restaurants with valid data
        if (cleanRestaurant.name && cleanRestaurant.rating > 0) {
          restaurants.push(cleanRestaurant);
        }
      }
      
      // Reset for next record
      currentRecord = [];
      currentField = '';
      fieldIndex = 0;
    } else {
      currentField += char;
    }
  }
  
  return restaurants;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

function parseCompetitors(competitorsText) {
  if (!competitorsText) return [];
  
  const competitors = [];
  const lines = competitorsText.split('\n');
  
  for (let i = 0; i < lines.length; i += 4) {
    if (lines[i] && lines[i].startsWith('Name: ')) {
      const competitor = {
        name: lines[i].replace('Name: ', ''),
        link: lines[i + 1] ? lines[i + 1].replace('Link: ', '') : '',
        reviews: lines[i + 2] ? lines[i + 2].replace('Reviews: ', '') : ''
      };
      competitors.push(competitor);
    }
  }
  
  return competitors;
}

// New parsing functions for the updated CSV format
function parseCompetitorsJSON(competitorsText) {
  if (!competitorsText) return [];
  
  try {
    const competitors = JSON.parse(competitorsText);
    return competitors.map(comp => ({
      name: comp.name || '',
      link: comp.link || '',
      reviews: comp.reviews || '',
      rating: comp.rating || 0,
      mainCategory: comp.main_category || ''
    }));
  } catch (error) {
    return [];
  }
}

function parseCategories(categoriesText) {
  if (!categoriesText) return [];
  
  try {
    const categories = JSON.parse(categoriesText);
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    return categoriesText ? categoriesText.split(', ') : [];
  }
}

function parseKeywords(keywordsText) {
  if (!keywordsText) return [];
  
  try {
    const keywords = JSON.parse(keywordsText);
    return keywords.map(kw => kw.keyword || kw).slice(0, 5);
  } catch (error) {
    return keywordsText ? keywordsText.split(', ').slice(0, 5) : [];
  }
}

function parseClosedDays(closedText) {
  if (!closedText) return [];
  
  try {
    const closed = JSON.parse(closedText);
    return Array.isArray(closed) ? closed : [];
  } catch (error) {
    return closedText ? closedText.split(', ') : [];
  }
}

function parseCoordinates(coordText) {
  if (!coordText) return null;
  
  try {
    const coords = JSON.parse(coordText);
    return {
      latitude: coords.latitude || 0,
      longitude: coords.longitude || 0
    };
  } catch (error) {
    return null;
  }
}

// Main execution
const csvPath = path.join(__dirname, '../public/data/near-galilee.csv');
const outputPath = path.join(__dirname, '../public/data/restaurants.json');

try {
  console.log('Parsing restaurant data...');
  const restaurants = parseCSV(csvPath);
  
  // Sort by rating and review count
  restaurants.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });
  
  console.log(`Parsed ${restaurants.length} restaurants`);
  
  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));
  console.log(`Restaurant data saved to ${outputPath}`);
  
  // Generate some stats
  const stats = {
    totalRestaurants: restaurants.length,
    averageRating: restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length,
    topCategories: getTopCategories(restaurants),
    ratingDistribution: getRatingDistribution(restaurants)
  };
  
  console.log('\nStats:');
  console.log(`Total restaurants: ${stats.totalRestaurants}`);
  console.log(`Average rating: ${stats.averageRating.toFixed(2)}`);
  console.log('Top categories:', stats.topCategories.slice(0, 5));
  
} catch (error) {
  console.error('Error parsing restaurant data:', error);
}

function getTopCategories(restaurants) {
  const categoryCount = {};
  restaurants.forEach(r => {
    r.categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .map(([cat, count]) => ({ category: cat, count }));
}

function getRatingDistribution(restaurants) {
  const distribution = {};
  restaurants.forEach(r => {
    const rating = Math.floor(r.rating);
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  return distribution;
}
