import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  Truck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';

interface CartDrawerProps {
  onNavigateCheckout: () => void;
  onNavigateShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateCheckout,
  onNavigateShop,
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    deliveryCharge,
    finalTotal,
  } = useCart();

  const { settings, coupons } = useStore();
  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const ok = applyCoupon(couponInput.trim());
      if (ok) setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">
                Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-rose-600 transition-colors mr-2"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Meter */}
          {cart.length > 0 && settings.shippingFee > 0 && settings.freeShippingEnabled !== false && (
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Truck className="w-4 h-4 text-neutral-600" />
                  {amountNeededForFreeShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">
                      🎉 Congratulations! You unlocked FREE DELIVERY.
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatINR(amountNeededForFreeShipping)}</strong> more to unlock <strong className="text-emerald-600">FREE DELIVERY.</strong>
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-neutral-500">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}
          {cart.length > 0 && (settings.shippingFee === 0 || settings.freeShippingEnabled === false) && (
            <div className="px-6 py-2.5 bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-neutral-500" />
                {settings.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">Unconditional Free Shipping on All Orders</span>
                ) : (
                  <span>Standard Shipping Fee: <strong>{formatINR(settings.shippingFee)}</strong></span>
                )}
              </span>
            </div>
          )}

          {/* Drawer Body: Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore our fresh arrivals in fashion, jewellery, electronics, and home essentials.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateShop();
                  }}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-18 h-18 object-cover rounded-xl bg-neutral-50 border border-neutral-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500 mt-0.5">
                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        {item.color && <span>Color: <strong>{item.color}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2.5 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-neutral-900">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[10px] text-neutral-400">
                            {formatINR(item.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {cart.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 space-y-4">
              {/* Coupon Section */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Coupon <strong>{appliedCoupon.code}</strong> applied ({formatINR(discount)} saved!)
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 hover:text-rose-600 transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Have a coupon? (e.g. DSMART10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-xs text-neutral-900 uppercase font-medium placeholder-neutral-400 focus:outline-none focus:border-black"
                        />
                        <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {/* Quick coupon suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coupons.slice(0, 2).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCoupon(c.code)}
                          className="text-[10px] bg-white border border-dashed border-neutral-300 hover:border-black px-2 py-0.5 rounded text-neutral-700 font-semibold"
                        >
                          Use {c.code}
                        </button>
                      ))}
                    </div>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-neutral-900">{formatINR(deliveryCharge)}</span>
                  )}
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-extrabold text-neutral-950">
                  <span>Estimated Total</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigateCheckout();
                }}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
