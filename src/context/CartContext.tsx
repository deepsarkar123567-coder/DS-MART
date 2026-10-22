import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CartItem, Product, Coupon } from '../types';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  taxAmount: number;
  finalTotal: number;
  totalCartCount: number;
  freeShippingRemaining: number;
  isEligibleForFreeShipping: boolean;
  isMinOrderMet: boolean;
  minOrderRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART = 'dssmart_cart';
const LOCAL_STORAGE_WISHLIST = 'dssmart_wishlist';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { products, coupons, settings } = useStore();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;

    const loadUserCartAndWishlist = async () => {
      try {
        // Load cart
        const cartSnap = await getDoc(doc(db, 'carts', currentUser.uid));
        if (cartSnap.exists()) {
          const remoteItems = cartSnap.data().items as CartItem[];
          // Merge local guest cart if any
          if (cart.length > 0) {
            const mergedMap = new Map<string, CartItem>();
            remoteItems.forEach((item) => mergedMap.set(item.id, item));
            cart.forEach((item) => {
              if (mergedMap.has(item.id)) {
                const existing = mergedMap.get(item.id)!;
                mergedMap.set(item.id, {
                  ...existing,
                  quantity: Math.min(existing.quantity + item.quantity, item.maxStock),
                });
              } else {
                mergedMap.set(item.id, item);
              }
            });
            const mergedList = Array.from(mergedMap.values());
            setCart(mergedList);
            await setDoc(doc(db, 'carts', currentUser.uid), {
              userId: currentUser.uid,
              items: mergedList,
              updatedAt: new Date().toISOString(),
            });
          } else {
            setCart(remoteItems);
          }
        } else if (cart.length > 0) {
          // Save local cart to user's new remote cart
          await setDoc(doc(db, 'carts', currentUser.uid), {
            userId: currentUser.uid,
            items: cart,
            updatedAt: new Date().toISOString(),
          });
        }

        // Load wishlist
        const wishSnap = await getDoc(doc(db, 'wishlists', currentUser.uid));
        if (wishSnap.exists()) {
          const remoteWishlist = (wishSnap.data().productIds as string[]) || [];
          const combined = Array.from(new Set([...wishlist, ...remoteWishlist]));
          setWishlist(combined);
        } else if (wishlist.length > 0) {
          await setDoc(doc(db, 'wishlists', currentUser.uid), {
            userId: currentUser.uid,
            productIds: wishlist,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Error syncing cart/wishlist with Firestore:', err);
      }
    };

    loadUserCartAndWishlist();
  }, [currentUser]);

  // Persist local cart & sync with firestore
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    if (currentUser) {
      setDoc(doc(db, 'carts', currentUser.uid), {
        userId: currentUser.uid,
        items: cart,
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Could not sync cart:', e));
    }
  }, [cart, currentUser]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_WISHLIST, JSON.stringify(wishlist));
    if (currentUser) {
      setDoc(doc(db, 'wishlists', currentUser.uid), {
        userId: currentUser.uid,
        productIds: wishlist,
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Could not sync wishlist:', e));
    }
  }, [wishlist, currentUser]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    const itemId = `${product.id}${size ? `-${size}` : ''}${color ? `-${color}` : ''}`;
    const priceToCharge = product.salePrice ?? product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQty, maxStock: product.stock } : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          title: product.title,
          price: priceToCharge,
          originalPrice: product.price,
          image: product.image,
          quantity: Math.min(quantity, product.stock),
          maxStock: product.stock,
          size,
          color,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;

    let d = 0;
    if (appliedCoupon.discountType === 'percentage') {
      d = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && d > appliedCoupon.maxDiscount) {
        d = appliedCoupon.maxDiscount;
      }
    } else {
      d = appliedCoupon.discountValue;
    }
    return Math.min(Math.round(d), subtotal);
  }, [subtotal, appliedCoupon]);

  const deliveryCharge = useMemo(() => {
    if (cart.length === 0) return 0;
    const fee = typeof settings.shippingFee === 'number' ? settings.shippingFee : 49;
    if (fee === 0) return 0; // Unconditional free shipping if set to 0
    const isFreeEnabled = settings.freeShippingEnabled !== false;
    const threshold = typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 999;
    if (isFreeEnabled && subtotal >= threshold) {
      return 0;
    }
    return fee;
  }, [cart, subtotal, settings]);

  const freeShippingThreshold = typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 999;
  const isFreeEnabled = settings.freeShippingEnabled !== false;

  const freeShippingRemaining = useMemo(() => {
    if (!isFreeEnabled) return 0;
    return Math.max(0, freeShippingThreshold - subtotal);
  }, [isFreeEnabled, freeShippingThreshold, subtotal]);

  const isEligibleForFreeShipping = useMemo(() => {
    if (!isFreeEnabled) return false;
    return subtotal >= freeShippingThreshold;
  }, [isFreeEnabled, freeShippingThreshold, subtotal]);

  const minOrderValue = typeof settings.minOrderValue === 'number' ? settings.minOrderValue : 0;
  const isMinOrderMet = useMemo(() => {
    return subtotal >= minOrderValue;
  }, [subtotal, minOrderValue]);

  const minOrderRemaining = useMemo(() => {
    return Math.max(0, minOrderValue - subtotal);
  }, [minOrderValue, subtotal]);

  const taxAmount = useMemo(() => {
    return Math.round(((subtotal - discount) * (settings.taxRate || 18)) / (100 + (settings.taxRate || 18)));
  }, [subtotal, discount, settings]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discount + deliveryCharge);
  }, [subtotal, discount, deliveryCharge]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const cleaned = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleaned && c.isActive);

    if (!found) {
      setCouponError('Invalid or expired coupon code');
      return false;
    }

    if (subtotal < found.minOrderValue) {
      setCouponError(`Coupon requires a minimum order value of ₹${found.minOrderValue}`);
      return false;
    }

    setAppliedCoupon(found);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        appliedCoupon,
        couponError,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        deliveryCharge,
        taxAmount,
        finalTotal,
        totalCartCount,
        freeShippingRemaining,
        isEligibleForFreeShipping,
        isMinOrderMet,
        minOrderRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
