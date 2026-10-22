import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onNavigateDetail: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onNavigateDetail,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const inWish = isInWishlist(product.id);

  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const displayImage =
    isHovered && product.images && product.images.length > 1
      ? product.images[1]
      : product.image;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {product.isDemo && (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-neutral-900/90 text-white backdrop-blur-xs">
            DEMO PRODUCT
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 text-[11px] font-extrabold tracking-tight rounded-md bg-rose-600 text-white shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-amber-500 text-white shadow-xs">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          inWish
            ? 'bg-rose-50 text-rose-600 shadow-sm'
            : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-black shadow-sm'
        }`}
        title={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-600' : ''}`} />
      </button>

      {/* Product Image Box */}
      <div
        onClick={() => onNavigateDetail(product.id)}
        className="relative w-full pt-[100%] bg-neutral-50 overflow-hidden cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="capitalize font-medium text-neutral-400">{product.category}</span>
            <div className="flex items-center gap-1 font-semibold text-neutral-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[11px] text-neutral-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            onClick={() => onNavigateDetail(product.id)}
            className="text-sm font-semibold text-neutral-900 line-clamp-2 hover:text-neutral-700 cursor-pointer min-h-[40px] leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base sm:text-lg font-black text-neutral-950">
              {formatINR(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>

          {/* Stock state */}
          <div className="flex items-center justify-between text-[11px] mb-2.5">
            {product.stock <= 0 ? (
              <span className="text-rose-600 font-semibold">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 font-medium">Only {product.stock} left in stock!</span>
            ) : (
              <span className="text-emerald-600 font-medium">In Stock</span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product, 1, product.sizes?.[0], product.colors?.[0])}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              product.stock <= 0
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99] shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock <= 0 ? 'Unavailable' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
