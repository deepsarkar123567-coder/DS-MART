import React, { useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Award, Clock, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { INITIAL_CATEGORIES } from '../data/seedData';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenQuickView: (product: Product) => void;
  onNavigateDetail: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenQuickView,
  onNavigateDetail,
}) => {
  const { products, settings } = useStore();
  const [activeTab, setActiveTab] = useState<'trending' | 'bestsellers' | 'new'>('trending');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const activeBanners = settings.banners.filter((b) => b.active);
  const currentBanner = activeBanners[currentBannerIndex] || settings.banners[0];

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);

  const displayProducts =
    activeTab === 'trending' ? featuredProducts : activeTab === 'bestsellers' ? bestSellers : newArrivals;

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[480px] sm:min-h-[540px] flex items-center shadow-2xl">
          {/* Background image with gradient overlay */}
          <img
            src={currentBanner?.image}
            alt={currentBanner?.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase text-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentBanner?.badge || 'LIMITED TIME OFFER'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {currentBanner?.title || 'DS MART — The Future of Shopping'}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-lg">
              {currentBanner?.subtitle ||
                'Explore premium apparel, fine jewellery, smart electronics, and designer home accents.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('shop', { category: currentBanner?.linkCategory || 'all' })}
                className="px-7 py-3.5 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-neutral-100 flex items-center gap-2 transition-all shadow-xl hover:gap-3"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop', { filter: 'best-sellers' })}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold text-sm transition-all"
              >
                Explore Best Sellers
              </button>
            </div>
          </div>

          {/* Banner navigation dots if multiple */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 right-8 z-10 flex gap-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentBannerIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
              Curated Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {INITIAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', { category: cat.slug })}
              className="group relative rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <div className="relative pt-[125%] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[11px] font-medium text-neutral-300 uppercase tracking-wider">
                    {cat.itemCount || 6}+ Products
                  </p>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Showcase Tabs: Trending / Best Sellers / New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
              Hand-Picked Selections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
              Popular in Store
            </h2>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl self-start md:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'trending'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Best Sellers</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'new'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh Arrivals</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenQuickView={onOpenQuickView}
              onNavigateDetail={onNavigateDetail}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('shop')}
            className="px-8 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-extrabold rounded-2xl transition-all inline-flex items-center gap-2"
          >
            <span>Explore Full Catalog ({products.length} Products)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Promotional Double Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-8 sm:p-10 bg-neutral-900 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
              alt="Jewellery"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 bg-amber-400 text-black rounded-md">
                FINE JEWELLERY SPOTLIGHT
              </span>
              <h3 className="text-2xl font-black text-white mt-3">925 Sterling Silver & Moissanite</h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-sm">
                Certified hallmarked jewellery crafted with precision cuts and lifetime shine.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <button
                onClick={() => onNavigate('shop', { category: 'jewellery' })}
                className="px-5 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-100 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Shop Jewellery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl p-8 sm:p-10 bg-neutral-900 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
              alt="Electronics"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 bg-white text-black rounded-md">
                SMART TECH AUDIO
              </span>
              <h3 className="text-2xl font-black text-white mt-3">High-Fidelity Wireless Gear</h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-sm">
                Hybrid active noise cancellation headphones and AMOLED smartwatches.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <button
                onClick={() => onNavigate('shop', { category: 'electronics' })}
                className="px-5 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-100 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Explore Tech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
