"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRestaurants = loadRestaurants;
exports.searchRestaurants = searchRestaurants;
exports.getRandomRestaurants = getRandomRestaurants;
exports.getTopRatedRestaurants = getTopRatedRestaurants;
exports.getRestaurantById = getRestaurantById;
exports.getCategories = getCategories;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let restaurantsCache = null;
function loadRestaurants() {
    if (restaurantsCache) {
        return restaurantsCache;
    }
    try {
        const restaurantsPath = path_1.default.join(process.cwd(), 'public/data/restaurants.json');
        const restaurantsData = fs_1.default.readFileSync(restaurantsPath, 'utf-8');
        restaurantsCache = JSON.parse(restaurantsData);
        return restaurantsCache || [];
    }
    catch (error) {
        console.error('Error loading restaurants:', error);
        return [];
    }
}
function searchRestaurants(filters = {}) {
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
            if (!restaurant.categories.some(cat => cat.toLowerCase().includes(filters.category.toLowerCase()))) {
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
function getRandomRestaurants(count = 10, filters = {}) {
    const filteredRestaurants = searchRestaurants(filters);
    const shuffled = [...filteredRestaurants].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
function getTopRatedRestaurants(count = 10, filters = {}) {
    const filteredRestaurants = searchRestaurants(filters);
    return filteredRestaurants
        .sort((a, b) => {
        if (b.rating !== a.rating)
            return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
    })
        .slice(0, count);
}
function getRestaurantById(id) {
    const restaurants = loadRestaurants();
    return restaurants.find(r => r.id === id) || null;
}
function getCategories() {
    const restaurants = loadRestaurants();
    const categoryCount = {};
    restaurants.forEach(restaurant => {
        restaurant.categories.forEach(category => {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
    });
    return Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}
