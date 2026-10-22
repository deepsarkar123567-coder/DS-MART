import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, isValidIndianPinCode, formatDate } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onNavigateDetail?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onNavigateDetail,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { products, getProductReviews, addReview } = useStore();
  const { currentUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [pinCodeInput, setPinCodeInput] = useState<string>('');
  const [pinCheckStatus, setPinCheckStatus] = useState<string | null>(null);

  // Review state
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newReviewerName, setNewReviewerName] = useState<string>(currentUser?.displayName || '');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const reviews = getProductReviews(product.id);
  const inWish = isInWishlist(product.id);
  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidIndianPinCode(pinCodeInput)) {
      setPinCheckStatus(`Express delivery available to PIN ${pinCodeInput.trim()} by within 2–3 business days! Free shipping eligible.`);
    } else {
      setPinCheckStatus('Please enter a valid 6-digit Indian PIN code (e.g. 110001, 400001, 700001).');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addReview({
      productId: product.id,
      customerId: currentUser?.uid || `guest-${Date.now()}`,
      customerName: newReviewerName.trim() || 'Verified Shopper',
      rating: newRating,
      comment: newComment.trim(),
      verifiedPurchase: true,
    });

    setReviewSubmitted(true);
    setNewComment('');
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 transition-colors shadow-sm"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-neutral-50 border-r border-neutral-100 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Primary Image */}
              <div className="relative w-full pt-[90%] bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                {product.isDemo && (
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md bg-black/85 text-white backdrop-blur-xs">
                    DEMO PRODUCT
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs font-black tracking-tight rounded-md bg-rose-600 text-white shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>

              {/* Thumbnail strip */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === imgUrl
                          ? 'border-black ring-2 ring-black/10'
                          : 'border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick trust strip */}
            <div className="mt-6 pt-6 border-t border-neutral-200/80 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-neutral-800" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-neutral-800" />
                <span>7-Day Return</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-neutral-800" />
                <span>Verified Quality</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product details, variants, purchase actions (7 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category, Rating, SKU */}
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-1.5">
                  <span className="uppercase tracking-wider font-semibold text-neutral-400">
                    {product.category}
                  </span>
                  <span className="font-mono text-neutral-400">SKU: {product.sku}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Rating & Reviews */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 text-white text-xs font-bold">
                    <span>{product.rating}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs text-neutral-500">
                    {product.reviewCount} Ratings & {reviews.length} Reviews
                  </span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Verified Product
                  </span>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                    {formatINR(product.salePrice ?? product.price)}
                  </span>
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatINR(product.price)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-extrabold text-rose-600">
                      Save {formatINR(product.price - product.salePrice!)} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Inclusive of all taxes. Free shipping on orders above ₹999.
                </p>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-2">
                    <span>Selected Color:</span>
                    <span className="text-neutral-500 font-normal">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedColor === c
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-2">
                    <span>Select Size:</span>
                    <span className="text-neutral-500 font-normal">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-10 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedSize === s
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Stock status */}
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-xs font-semibold text-neutral-800 mb-1.5">Quantity:</span>
                  <div className="inline-flex items-center rounded-xl border border-neutral-300 bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3.5 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-neutral-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3.5 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="block font-semibold text-neutral-800 mb-1.5">Availability:</span>
                  {product.stock <= 0 ? (
                    <span className="text-rose-600 font-bold">Out of Stock</span>
                  ) : product.stock <= 5 ? (
                    <span className="text-amber-600 font-semibold">Only {product.stock} items left!</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">In Stock ({product.stock} units)</span>
                  )}
                </div>
              </div>

              {/* PIN Code Delivery Checker */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Check Delivery to Your PIN Code:
                </label>
                <form onSubmit={handlePinCheck} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Indian PIN (e.g. 110001)"
                    value={pinCodeInput}
                    onChange={(e) => setPinCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Check
                  </button>
                </form>
                {pinCheckStatus && (
                  <p
                    className={`mt-1.5 text-xs ${
                      pinCheckStatus.includes('available') ? 'text-emerald-600 font-medium' : 'text-rose-600'
                    }`}
                  >
                    {pinCheckStatus}
                  </p>
                )}
              </div>

              {/* Actions: Add to Cart & Wishlist */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    addToCart(product, quantity, selectedSize, selectedColor);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-black text-white hover:bg-neutral-800 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center transition-all ${
                    inWish
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-black'
                  }`}
                  title={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Tabs: Description, Specs, Reviews */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="flex border-b border-neutral-200 gap-6 text-xs font-bold uppercase tracking-wider mb-4">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2 transition-all ${
                    activeTab === 'desc'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 transition-all ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <span>Reviews ({reviews.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'desc' && (
                <div className="text-xs text-neutral-600 leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  {product.weight && <p><strong>Product Weight:</strong> {product.weight}</p>}
                  {product.dimensions && <p><strong>Dimensions:</strong> {product.dimensions}</p>}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-1.5 text-xs">
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500 font-medium">{key}</span>
                        <span className="text-neutral-900 font-semibold">{val}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500">Standard manufacturer specifications apply.</p>
                  )}
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500 font-medium">SKU</span>
                    <span className="text-neutral-900 font-mono font-semibold">{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500 font-medium">Category</span>
                    <span className="text-neutral-900 capitalize font-semibold">{product.category}</span>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {/* Review form */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Write a Customer Review
                    </h4>
                    {reviewSubmitted ? (
                      <p className="text-xs text-emerald-600 font-semibold">
                        Thank you! Your verified review has been recorded.
                      </p>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600">Your Rating:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="p-0.5 text-neutral-300 hover:text-amber-400"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= newRating ? 'fill-amber-400 text-amber-400' : ''
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Your Name (e.g. Rahul S.)"
                          value={newReviewerName}
                          onChange={(e) => setNewReviewerName(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                        />

                        <textarea
                          required
                          rows={2}
                          placeholder="Share your experience with this item..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                        />

                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
                        >
                          Submit Review
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Reviews list */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-white rounded-xl border border-neutral-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-neutral-900">{rev.customerName}</span>
                            <span className="text-[10px] text-neutral-400">{formatDate(rev.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                            {rev.verifiedPurchase && (
                              <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-700">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400 text-center py-2">
                        No customer reviews yet. Be the first to review this product!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
