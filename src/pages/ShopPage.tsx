import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Star,
  Check,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { INITIAL_CATEGORIES } from '../data/seedData';
import { formatINR } from '../utils/formatters';

interface ShopPageProps {
  initialCategory?: string;
  initialFilter?: string;
  initialSearch?: string;
  onOpenQuickView: (product: Product) => void;
  onNavigateDetail: (productId: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'all',
  initialFilter,
  initialSearch = '',
  onOpenQuickView,
  onNavigateDetail,
}) => {
  const { products } = useStore();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'all') {
        if (p.category !== selectedCategory) return false;
      }

      // Initial Filter presets (best-sellers, new-arrivals)
      if (initialFilter === 'best-sellers' && !p.isBestSeller) return false;
      if (initialFilter === 'new-arrivals' && !p.isNewArrival) return false;

      // Price
      const effectivePrice = p.salePrice ?? p.price;
      if (effectivePrice > priceRange) return false;

      // Rating
      if (selectedRating !== null && p.rating < selectedRating) return false;

      // In stock
      if (inStockOnly && p.stock <= 0) return false;

      // Discount
      if (minDiscount > 0) {
        if (!p.salePrice || p.salePrice >= p.price) return false;
        const discountPct = Math.round(((p.price - p.salePrice) / p.price) * 100);
        if (discountPct < minDiscount) return false;
      }

      return true;
    });
  }, [
    products,
    search,
    selectedCategory,
    initialFilter,
    priceRange,
    selectedRating,
    inStockOnly,
    minDiscount,
  ]);

  // Sort
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Newest
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }
    return list;
  }, [filteredProducts, sortBy]);

  const displayedList = sortedProducts.slice(0, visibleCount);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedRating(null);
    setPriceRange(10000);
    setInStockOnly(false);
    setMinDiscount(0);
    setSortBy('newest');
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== 'all' ||
    selectedRating !== null ||
    priceRange < 10000 ||
    inStockOnly ||
    minDiscount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Catalog Header */}
      <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {displayedList.length} of {sortedProducts.length} items
            {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
          </p>
        </div>

        {/* Top Controls: Mobile Filter Button & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-semibold flex items-center gap-2 hover:bg-neutral-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium hidden sm:inline">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-black appearance-none cursor-pointer"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-neutral-500 hover:text-black underline"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Search within catalog */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">Category</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                All Departments
              </button>
              {INITIAL_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-black text-white font-bold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-neutral-800">Max Price</label>
              <span className="text-xs font-extrabold text-neutral-900">
                {formatINR(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={200}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>₹500</span>
              <span>₹10,000</span>
            </div>
          </div>

          {/* Customer Rating */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">Minimum Rating</label>
            <div className="space-y-1.5 text-xs">
              {[4, 3].map((stars) => (
                <label key={stars} className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === stars}
                    onChange={() => setSelectedRating(selectedRating === stars ? null : stars)}
                    className="accent-black"
                  />
                  <div className="flex items-center gap-1">
                    <span>{stars} Stars & above</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === null}
                  onChange={() => setSelectedRating(null)}
                  className="accent-black"
                />
                <span>All Ratings</span>
              </label>
            </div>
          </div>

          {/* Discount Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">Special Discounts</label>
            <div className="space-y-1.5 text-xs">
              {[10, 20, 30].map((disc) => (
                <label key={disc} className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input
                    type="radio"
                    name="discount"
                    checked={minDiscount === disc}
                    onChange={() => setMinDiscount(minDiscount === disc ? 0 : disc)}
                    className="accent-black"
                  />
                  <span>{disc}% or more discount</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                <input
                  type="radio"
                  name="discount"
                  checked={minDiscount === 0}
                  onChange={() => setMinDiscount(0)}
                  className="accent-black"
                />
                <span>All Offers</span>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-black"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid Area (3 cols desktop) */}
        <main className="md:col-span-3">
          {displayedList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenQuickView={onOpenQuickView}
                    onNavigateDetail={onNavigateDetail}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {displayedList.length < sortedProducts.length && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="px-8 py-3 bg-white border border-neutral-300 hover:border-black text-xs font-bold rounded-2xl transition-colors shadow-xs"
                  >
                    Load More Products ({sortedProducts.length - displayedList.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-neutral-200">
              <p className="text-base font-bold text-neutral-900 mb-1">No products match your filters</p>
              <p className="text-xs text-neutral-500 mb-4">
                Try loosening your search terms or resetting your price and category filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="text-sm font-extrabold text-neutral-900">Filter Products</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      selectedCategory === 'all'
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-200'
                    }`}
                  >
                    All
                  </button>
                  {INITIAL_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        selectedCategory === c.slug
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-800">Max Price</label>
                  <span className="text-xs font-bold">{formatINR(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={200}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-black"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 flex gap-2">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
