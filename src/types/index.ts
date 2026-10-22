export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isDemo?: boolean;
  purchaseCost?: number;
  sizes?: string[];
  colors?: string[];
  weight?: string;
  dimensions?: string;
  specifications?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  id: string; // usually productId or productId-size-color
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  maxStock: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  houseStreet: string;
  villageTown: string;
  district: string;
  state: string;
  pinCode: string;
  instructions?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentDetails?: {
    transactionId?: string;
    gateway?: string;
  };
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  statusHistory: StatusHistoryEntry[];
  cancellationReason?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface StoreBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  linkCategory: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  logoText: string;
  tagline: string;
  operatorName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
  minOrderValue: number;
  categoryShippingOverrides?: Record<string, number>;
  taxRate: number; // percentage, e.g. 18 for GST
  serviceablePinCodes: string[];
  announcement: string;
  returnPolicyDays: number;
  returnPolicyText: string;
  banners: StoreBanner[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses: ShippingAddress[];
  createdAt: string;
}
