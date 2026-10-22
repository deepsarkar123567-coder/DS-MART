import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, Coupon, StoreSettings, Review, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS, fetchDemoProductsFromApi } from '../data/seedData';
import { useAuth } from './AuthContext';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  reviews: Review[];
  loadingProducts: boolean;
  loadingOrders: boolean;
  isSeeding: boolean;
  seedDemoProducts: (forceReset?: boolean) => Promise<number>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, trackingNumber?: string, courierName?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  requestReturn: (orderId: string, reason: string) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  getProductReviews: (productId: string) => Review[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // 1. Listen to Products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setProducts(list);
        } else {
          // If Firestore is empty initially, fall back to initial dataset
          setProducts(INITIAL_PRODUCTS);
        }
        setLoadingProducts(false);
      },
      (error) => {
        console.warn('Products onSnapshot error, using local fallback:', error.message);
        setProducts(INITIAL_PRODUCTS);
        setLoadingProducts(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Listen to Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({ ...INITIAL_SETTINGS, ...(docSnap.data() as StoreSettings) });
        }
      },
      (error) => {
        console.warn('Settings onSnapshot error:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 3. Listen to Coupons
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Coupon[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              code: data.code || docSnap.id,
              discountType: data.discountType || 'percentage',
              discountValue: Number(data.discountValue) || 10,
              minOrderValue: Number(data.minOrderValue) || 0,
              maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
              expiryDate: data.expiryDate || '2026-12-31',
              isActive: data.isActive !== false,
              usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
              usedCount: Number(data.usedCount) || 0,
            });
          });
          setCoupons(list);
        }
      },
      (error) => {
        console.warn('Coupons onSnapshot error:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 4. Listen to Orders (with local resilience)
  useEffect(() => {
    setLoadingOrders(true);

    const getSavedLocalOrders = (): Order[] => {
      try {
        const raw = localStorage.getItem('dsmart_orders');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const localList = getSavedLocalOrders();

    const unsub = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const remoteList: Order[] = [];
        snapshot.forEach((docSnap) => {
          remoteList.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        // Merge remote with local orders
        const map = new Map<string, Order>();
        localList.forEach((o) => map.set(o.id, o));
        remoteList.forEach((o) => map.set(o.id, o));

        let merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (!isAdmin && currentUser) {
          const userUid = currentUser.uid;
          const userEmail = (currentUser.email || '').toLowerCase();
          merged = merged.filter(
            (o) =>
              o.customerId === userUid ||
              (o.customerEmail && o.customerEmail.toLowerCase() === userEmail)
          );
        }

        setOrders(merged);
        setLoadingOrders(false);
      },
      (error) => {
        console.warn('Orders onSnapshot error, using local fallback:', error.message);
        if (!isAdmin && currentUser) {
          setOrders(
            localList.filter(
              (o) =>
                o.customerId === currentUser.uid ||
                (o.customerEmail && o.customerEmail.toLowerCase() === (currentUser.email || '').toLowerCase())
            )
          );
        } else {
          setOrders(localList);
        }
        setLoadingOrders(false);
      }
    );

    return () => unsub();
  }, [currentUser, isAdmin]);

  // 5. Listen to Reviews
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setReviews(list);
      },
      (error) => {
        console.warn('Reviews onSnapshot error:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // Seed / Sync Demo Products to Firestore
  const seedDemoProducts = async (forceReset: boolean = false): Promise<number> => {
    setIsSeeding(true);
    try {
      // First, fetch 20+ items from API or fallback
      const demoItems = await fetchDemoProductsFromApi();

      // Check existing in Firestore if not forceReset
      if (!forceReset) {
        const existingSnap = await getDocs(collection(db, 'products'));
        if (!existingSnap.empty) {
          setIsSeeding(false);
          return existingSnap.size;
        }
      }

      // Write products
      let count = 0;
      for (const item of demoItems) {
        await setDoc(doc(db, 'products', item.id), {
          ...item,
          isDemo: true,
          updatedAt: new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
        });
        count++;
      }

      // Seed initial coupons
      for (const c of INITIAL_COUPONS) {
        await setDoc(doc(db, 'coupons', c.id), c);
      }

      // Seed initial settings
      await setDoc(doc(db, 'settings', 'general'), INITIAL_SETTINGS);

      setIsSeeding(false);
      return count;
    } catch (err) {
      console.error('Error seeding demo products:', err);
      setIsSeeding(false);
      throw err;
    }
  };

  // Product CRUD
  const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    const newId = `prod-${Date.now()}`;
    const fullProduct: Product = {
      ...product,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'products', newId), fullProduct);
    return newId;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  // Transactional & Resilient Order Creation
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<string> => {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${year}-${rand}`;
    const now = new Date().toISOString();

    const orderRecord: Order = {
      ...orderData,
      id: orderId,
      orderStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: now,
          note: orderData.paymentMethod === 'cod' ? 'Order placed via Cash on Delivery' : 'Order placed and payment authorized',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Helper to sanitize payload and remove any undefined fields that cause Firestore to reject
    const sanitize = (val: any): any => {
      if (val === undefined) return '';
      if (val === null) return '';
      if (Array.isArray(val)) {
        return val.map(sanitize);
      }
      if (typeof val === 'object') {
        const cleaned: Record<string, any> = {};
        for (const k of Object.keys(val)) {
          if (val[k] !== undefined) {
            cleaned[k] = sanitize(val[k]);
          }
        }
        return cleaned;
      }
      return val;
    };

    const sanitizedRecord = sanitize(orderRecord);

    // 1. Immediately store in local storage so user and admin never lose the order
    try {
      const savedRaw = localStorage.getItem('dsmart_orders');
      const existingList: Order[] = savedRaw ? JSON.parse(savedRaw) : [];
      localStorage.setItem('dsmart_orders', JSON.stringify([orderRecord, ...existingList]));
    } catch (e) {
      console.warn('Local storage order save error:', e);
    }

    // 2. Immediately update in-memory state
    setOrders((prev) => [orderRecord, ...prev.filter((o) => o.id !== orderId)]);

    // 3. Immediately decrement product inventory in memory
    setProducts((prev) =>
      prev.map((p) => {
        const item = orderRecord.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );

    // 4. Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'orders', orderId), sanitizedRecord);

      // Decrement stock in Firestore
      for (const item of orderRecord.items) {
        try {
          const prodRef = doc(db, 'products', item.productId);
          const p = products.find((pr) => pr.id === item.productId);
          if (p) {
            await updateDoc(prodRef, { stock: Math.max(0, (p.stock || 1) - item.quantity) });
          }
        } catch {
          // Non-fatal
        }
      }
    } catch (err) {
      console.warn('Firestore setDoc notice, order preserved locally and in state:', err);
    }

    return orderId;
  };

  // Order Status Updates
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string,
    trackingNumber?: string,
    courierName?: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();
    const newEntry = {
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
    };

    const updates: any = {
      orderStatus: status,
      statusHistory: [...(order?.statusHistory || []), newEntry],
      updatedAt: now,
    };

    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (courierName !== undefined) updates.courierName = courierName;
    if (status === 'Delivered') updates.paymentStatus = 'paid';

    await updateDoc(doc(db, 'orders', orderId), updates);
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();
    const newEntry = {
      status: 'Cancelled' as OrderStatus,
      timestamp: now,
      note: `Order cancelled by customer: ${reason}`,
    };

    // Update order
    await updateDoc(doc(db, 'orders', orderId), {
      orderStatus: 'Cancelled',
      cancellationReason: reason,
      statusHistory: [...(order?.statusHistory || []), newEntry],
      updatedAt: now,
    });

    // Restore stock if possible
    if (order) {
      for (const item of order.items) {
        try {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            await updateDoc(doc(db, 'products', item.productId), {
              stock: (prod.stock || 0) + item.quantity,
            });
          }
        } catch {
          // Ignore
        }
      }
    }
  };

  const requestReturn = async (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();
    const newEntry = {
      status: 'Returned' as OrderStatus,
      timestamp: now,
      note: `Return initiated by customer: ${reason}`,
    };

    await updateDoc(doc(db, 'orders', orderId), {
      orderStatus: 'Returned',
      returnReason: reason,
      statusHistory: [...(order?.statusHistory || []), newEntry],
      updatedAt: now,
    });
  };

  // Coupons
  const addCoupon = async (coupon: Coupon) => {
    await setDoc(doc(db, 'coupons', coupon.id), coupon);
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    await updateDoc(doc(db, 'coupons', id), updates);
  };

  const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id));
  };

  // Store Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    await setDoc(doc(db, 'settings', 'general'), {
      ...settings,
      ...newSettings,
    });
  };

  // Reviews
  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newId = `rev-${Date.now()}`;
    const fullReview: Review = {
      ...review,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'reviews', newId), fullReview);

    // Update product rating summary
    const prod = products.find((p) => p.id === review.productId);
    if (prod) {
      const allReviewsForProd = [...reviews.filter((r) => r.productId === review.productId), fullReview];
      const avg = allReviewsForProd.reduce((acc, r) => acc + r.rating, 0) / allReviewsForProd.length;
      await updateDoc(doc(db, 'products', prod.id), {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allReviewsForProd.length,
      });
    }
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        coupons,
        settings,
        reviews,
        loadingProducts,
        loadingOrders,
        isSeeding,
        seedDemoProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        requestReturn,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
        addReview,
        getProductReviews,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
