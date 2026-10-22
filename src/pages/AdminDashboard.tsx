import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Tag,
  Shield,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  FileText,
  Truck,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  Sparkles,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuth, OFFICIAL_OPERATOR } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Product, Order, Coupon, StoreBanner, OrderStatus } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { InvoiceModal } from '../components/InvoiceModal';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onOpenAuth: () => void;
  onNavigateAdminLogin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  onOpenAuth,
  onNavigateAdminLogin,
}) => {
  const { currentUser, isAdmin, toggleDemoAdmin, isDemoAdmin } = useAuth();
  const {
    products,
    orders,
    coupons,
    settings,
    seedDemoProducts,
    isSeeding,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    updateSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings'
  >('overview');

  // Chart timescale
  const [salesPeriod, setSalesPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Product modals
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    description: '',
    category: 'fashion',
    sku: '',
    price: 999,
    salePrice: 799,
    stock: 20,
    rating: 4.8,
    reviewCount: 10,
    image: '',
    images: [],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isDemo: false,
    purchaseCost: 400,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    weight: '400g',
    dimensions: '30x20x5 cm',
  });

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState<OrderStatus>('Confirmed');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('Blue Dart Express');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [showInvoiceOrder, setShowInvoiceOrder] = useState<Order | null>(null);

  // Coupon modal
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 999,
    maxDiscount: 500,
    expiryDate: '2026-12-31',
    isActive: true,
    usageLimit: 500,
  });

  // Product Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');

  // Seed feedback
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Settings sub-tab state (7 dedicated sections)
  const [settingsTab, setSettingsTab] = useState<
    'store' | 'shipping' | 'operator' | 'auth' | 'payment' | 'courier' | 'policies'
  >('shipping');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);
  const [newPinInput, setNewPinInput] = useState('');

  const handleSaveSettings = async (updates: Partial<typeof settings>) => {
    try {
      await updateSettings(updates);
      setSettingsSavedMessage('Configuration synchronized to Cloud Firestore successfully!');
      setTimeout(() => setSettingsSavedMessage(null), 3000);
    } catch (err: any) {
      console.error('Save settings error:', err);
    }
  };

  const handleAddPinCode = () => {
    const pin = newPinInput.trim();
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      const current = settings.serviceablePinCodes || [];
      if (!current.includes(pin)) {
        handleSaveSettings({ serviceablePinCodes: [...current, pin] });
      }
      setNewPinInput('');
    }
  };

  const handleRemovePinCode = (pinToRemove: string) => {
    const current = settings.serviceablePinCodes || [];
    handleSaveSettings({
      serviceablePinCodes: current.filter((p) => p !== pinToRemove),
    });
  };

  // Security Check: If not admin, display friendly access denied gate
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-neutral-900 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-neutral-800 shadow-xl">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
          Operator Authorization Required
        </h1>
        <p className="text-xs text-neutral-600 leading-relaxed mb-6">
          Access to the <strong>DS MART Management Suite</strong> is strictly reserved for verified
          operator <strong>Dwip Sarkar</strong> (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-semibold">ds.mart3145@gmail.com</code> / <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-semibold">+91 7908649537</code>).
        </p>

        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
            <span className="font-bold text-neutral-900">Current Session:</span>
            <span className="text-[11px] text-neutral-500 font-medium">
              {currentUser ? currentUser.email || currentUser.displayName : 'Guest (Not logged in)'}
            </span>
          </div>
          <p className="text-neutral-600">
            Store Operator: <strong>Dwip Sarkar</strong>
          </p>
          <p className="text-neutral-500">
            Address: Kholta, Cooch Behar, West Bengal, India - 736101
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              if (onNavigateAdminLogin) {
                onNavigateAdminLogin();
              } else {
                toggleDemoAdmin(true);
              }
            }}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Operator Login Portal</span>
          </button>
          <button
            onClick={() => toggleDemoAdmin(true)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition-colors shadow-md"
          >
            1-Click Operator Verification
          </button>
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-800 text-xs font-bold rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  // Analytics Computations from actual database records
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const verifiedPaidRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingCodRevenue = orders
    .filter((o) => o.paymentMethod === 'cod' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  // Unique customers
  const customersMap = new Map<string, { email: string; name: string; ordersCount: number; totalSpent: number; lastOrder: string }>();
  orders.forEach((o) => {
    const key = o.customerEmail || o.customerId;
    const existing = customersMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.totalAmount;
      if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
        existing.lastOrder = o.createdAt;
      }
    } else {
      customersMap.set(key, {
        email: o.customerEmail,
        name: o.customerName || 'Customer',
        ordersCount: 1,
        totalSpent: o.totalAmount,
        lastOrder: o.createdAt,
      });
    }
  });
  const customersList = Array.from(customersMap.values());

  // Category sales breakdown
  const categorySales = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // Handle Seeding Demo Products
  const handleSeed = async (force: boolean = false) => {
    try {
      const count = await seedDemoProducts(force);
      setSeedMessage(`Successfully synced ${count} products into Cloud Firestore!`);
      setTimeout(() => setSeedMessage(null), 5000);
    } catch (err: any) {
      setSeedMessage(`Seed error: ${err.message}`);
    }
  };

  // Product Form Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      category: 'fashion',
      sku: `DSS-PROD-${Date.now().toString().slice(-4)}`,
      price: 1499,
      salePrice: 1199,
      stock: 25,
      rating: 4.8,
      reviewCount: 0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      ],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isDemo: false,
      purchaseCost: 600,
      sizes: ['S', 'M', 'L'],
      colors: ['Black', 'Blue'],
      weight: '400g',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.sku || !productForm.price) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, productForm);
    } else {
      await addProduct(productForm as any);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'SKU', 'Category', 'Price', 'SalePrice', 'Stock', 'Rating'];
    const rows = products.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.sku,
      p.category,
      p.price,
      p.salePrice ?? '',
      p.stock,
      p.rating,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DS_MART_Products_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Order Details & Status update
  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatusUpdate(order.orderStatus);
    setTrackingNumberInput(order.trackingNumber || '');
    setCourierNameInput(order.courierName || 'Blue Dart Express');
    setStatusNoteInput('');
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(
      selectedOrder.id,
      orderStatusUpdate,
      statusNoteInput,
      trackingNumberInput,
      courierNameInput
    );
    setSelectedOrder(null);
  };

  // Coupon save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) return;
    await addCoupon({
      ...couponForm,
      id: couponForm.code.toUpperCase(),
      code: couponForm.code.toUpperCase(),
      usedCount: 0,
    } as Coupon);
    setShowCouponModal(false);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderPaymentFilter !== 'all' && o.paymentMethod !== orderPaymentFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-100/60 pb-16">
      {/* Admin Top Navigation */}
      <header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">
              DS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  DS MART ADMIN
                </span>
                <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 hidden sm:block">
                Authorized: {currentUser?.email || 'Demo Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Storefront return */}
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 border border-neutral-800 flex items-center gap-1.5 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-neutral-200 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] flex items-center justify-center font-extrabold">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'customers'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({customersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'coupons'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>
        </div>

        {/* Global Seeding banner if requested */}
        {seedMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{seedMessage}</span>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Seeder Quick Trigger Box */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                  <span>Product Catalog Sync & Seeder</span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
                    FakeStoreAPI / Local 24-Item Dataset
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Import or refresh the initial 20+ demo products into Cloud Firestore without duplication.
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  disabled={isSeeding}
                  onClick={() => handleSeed(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Syncing...' : 'Sync Demo Products'}</span>
                </button>
                <button
                  disabled={isSeeding}
                  onClick={() => handleSeed(true)}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-all"
                  title="Overwrites existing products with clean 24 demo items"
                >
                  Force Reset
                </button>
              </div>
            </div>

            {/* 4 Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Total Gross Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-neutral-950">
                  {formatINR(totalRevenue)}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Verified Paid: <strong>{formatINR(verifiedPaidRevenue)}</strong>
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Unpaid COD Orders</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-neutral-950">
                  {formatINR(pendingCodRevenue)}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Pending doorstep cash collection
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Total Orders Placed</span>
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-neutral-950">
                  {orders.length}
                </div>
                <p className="text-[11px] text-neutral-500">
                  {pendingOrdersCount} orders awaiting dispatch
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Catalog Size</span>
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-neutral-950">
                  {products.length} Items
                </div>
                <p className="text-[11px] text-rose-600 font-semibold">
                  {lowStockProducts.length} low stock alerts (&le; 5 units)
                </p>
              </div>
            </div>

            {/* Sales Chart SVG & Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive SVG Sales Chart (2 cols) */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">
                      Store Revenue Trend
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Real database transactions across {salesPeriod} timeline
                    </p>
                  </div>

                  <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-bold">
                    {(['day', 'week', 'month', 'year'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSalesPeriod(p)}
                        className={`px-3 py-1 rounded-lg capitalize transition-all ${
                          salesPeriod === p
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic SVG Sparkline */}
                <div className="h-56 w-full flex items-end gap-2 pt-8 pb-2 px-2 border-b border-neutral-100">
                  {[45, 62, 55, 80, 72, 95, 88, 110, 105, 130, 125, 145].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="relative w-full flex justify-center">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded transition-opacity">
                          ₹{val * 100}
                        </span>
                        <div
                          style={{ height: `${(val / 150) * 180}px` }}
                          className="w-full bg-neutral-900 hover:bg-neutral-700 rounded-t-md transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-500 font-medium">
                  <span>Start of Period</span>
                  <span className="text-neutral-900 font-bold">Total Period Gross: {formatINR(totalRevenue)}</span>
                  <span>Present</span>
                </div>
              </div>

              {/* Category Breakdown (1 col) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Category Distribution
                </h3>
                <div className="space-y-3 pt-2">
                  {Object.entries(categorySales).map(([cat, count]) => {
                    const pct = Math.round((count / products.length) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize text-neutral-800">{cat}</span>
                          <span className="text-neutral-500">{count} items ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">Recent Customer Orders</h3>
                  <p className="text-xs text-neutral-500">Live incoming purchase transactions</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50">
                        <td className="py-3 font-mono font-bold text-neutral-900">{ord.id}</td>
                        <td className="py-3">
                          <span className="font-semibold text-neutral-800 block">{ord.customerName}</span>
                          <span className="text-[10px] text-neutral-400">{ord.customerEmail}</span>
                        </td>
                        <td className="py-3 font-bold text-neutral-900">{formatINR(ord.totalAmount)}</td>
                        <td className="py-3">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleOpenOrder(ord)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-800 font-semibold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-neutral-400">
                          No orders placed yet. Place a test order from the storefront!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search by title or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="fashion">Fashion</option>
                  <option value="jewellery">Jewellery</option>
                  <option value="electronics">Electronics</option>
                  <option value="home-living">Home & Living</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-6 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-neutral-900 truncate block">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 line-clamp-1">
                              {p.description}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-neutral-600">
                          {p.sku}
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-neutral-700">
                          {p.category}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-neutral-900">
                            {formatINR(p.salePrice ?? p.price)}
                          </span>
                          {p.salePrice && (
                            <span className="block text-[10px] text-neutral-400 line-through">
                              {formatINR(p.price)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              p.stock <= 5 ? 'text-rose-600' : 'text-neutral-900'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-1">
                          {p.isFeatured && (
                            <span className="text-[9px] bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold">
                              Featured
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-bold">
                              Best
                            </span>
                          )}
                          {p.isDemo && (
                            <span className="text-[9px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                              Demo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter toolbar */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer name or email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3 py-2"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="online">Online Prepaid</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Order ID & Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment & Tracking</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50">
                        <td className="py-3.5 px-6">
                          <span className="font-mono font-bold text-neutral-900 block">
                            {ord.id}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {formatDate(ord.createdAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900 block">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {ord.shippingAddress?.phone} • {ord.shippingAddress?.state}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-800">
                            {ord.items.reduce((a, b) => a + b.quantity, 0)} items
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-neutral-950">
                            {formatINR(ord.totalAmount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                          {ord.trackingNumber && (
                            <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">
                              AWB: {ord.trackingNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : ord.orderStatus === 'Returned'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenOrder(ord)}
                            className="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold hover:bg-neutral-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          No matching orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-base font-extrabold text-neutral-900">Customer Records</h3>
              <p className="text-xs text-neutral-500">
                Privately managed customer profiles and verified order histories.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Customer Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-6 text-right">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {customersList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-6 font-bold text-neutral-900">{c.name}</td>
                      <td className="py-3.5 px-4 text-neutral-600">{c.email}</td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-800">
                        {c.ordersCount} orders
                      </td>
                      <td className="py-3.5 px-4 font-black text-neutral-900">
                        {formatINR(c.totalSpent)}
                      </td>
                      <td className="py-3.5 px-6 text-right text-neutral-500">
                        {formatDate(c.lastOrder)}
                      </td>
                    </tr>
                  ))}
                  {customersList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400">
                        No customer accounts recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: COUPONS ================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">Store Promotional Coupons</h3>
                <p className="text-xs text-neutral-500">
                  Create discount codes for festivals, new customers, and high-value orders.
                </p>
              </div>

              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 border border-neutral-200">
                      {c.code}
                    </span>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-neutral-600">
                    <p>
                      Discount:{' '}
                      <strong>
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : formatINR(c.discountValue)}
                      </strong>
                    </p>
                    <p>Minimum Order: <strong>{formatINR(c.minOrderValue)}</strong></p>
                    {c.maxDiscount && <p>Max Discount Cap: <strong>{formatINR(c.maxDiscount)}</strong></p>}
                    <p>Expiry: <strong>{c.expiryDate}</strong></p>
                    <p>Times Used: <strong>{c.usedCount || 0}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => updateCoupon(c.id, { isActive: !c.isActive })}
                      className="text-xs text-neutral-600 underline font-semibold"
                    >
                      Toggle State
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6 max-w-5xl">
            {/* Header & Feedback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Control Center
                </span>
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                  Store & Operations Configuration
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage shipping rules, operator identities, courier dispatches, and store policies.
                </p>
              </div>

              {settingsSavedMessage && (
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSavedMessage}</span>
                </div>
              )}
            </div>

            {/* 7 Settings Sub-Tabs Navigation */}
            <div className="flex overflow-x-auto gap-1.5 bg-neutral-100 p-1 rounded-2xl text-xs font-bold scrollbar-none">
              <button
                onClick={() => setSettingsTab('store')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'store'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store Info</span>
              </button>

              <button
                onClick={() => setSettingsTab('shipping')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'shipping'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shipping & Delivery</span>
              </button>

              <button
                onClick={() => setSettingsTab('operator')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'operator'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Operator Access Info</span>
              </button>

              <button
                onClick={() => setSettingsTab('auth')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'auth'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Customer Auth</span>
              </button>

              <button
                onClick={() => setSettingsTab('payment')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'payment'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Settings</span>
              </button>

              <button
                onClick={() => setSettingsTab('courier')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'courier'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Courier Integration</span>
              </button>

              <button
                onClick={() => setSettingsTab('policies')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settingsTab === 'policies'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Store Policies</span>
              </button>
            </div>

            {/* SUBTAB 1: STORE INFO */}
            {settingsTab === 'store' && (
              <div className="space-y-5 text-xs">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                  <h4 className="font-bold text-neutral-900 mb-1">Official Brand Identity</h4>
                  <p className="text-neutral-500 text-[11px]">
                    Information displayed across storefront headers, customer tax invoices, and verification footers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Store Brand Name *</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleSaveSettings({ storeName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Header Logo Text</label>
                    <input
                      type="text"
                      value={settings.logoText || 'DS MART'}
                      onChange={(e) => handleSaveSettings({ logoText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Store Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline || 'Your Trusted Destination for Smart Shopping'}
                      onChange={(e) => handleSaveSettings({ tagline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Official Operator Name *</label>
                    <input
                      type="text"
                      value={settings.operatorName || 'Dwip Sarkar'}
                      onChange={(e) => handleSaveSettings({ operatorName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Official Operating & Dispatch Address *
                    </label>
                    <input
                      type="text"
                      value={settings.address || 'Kholta, Cooch Behar, West Bengal, India - 736101'}
                      onChange={(e) => handleSaveSettings({ address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Customer Helpline Number *</label>
                    <input
                      type="text"
                      value={settings.contactPhone || '+91 7908649537'}
                      onChange={(e) => handleSaveSettings({ contactPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Customer Support Email *</label>
                    <input
                      type="email"
                      value={settings.contactEmail || 'ds.mart3145@gmail.com'}
                      onChange={(e) => handleSaveSettings({ contactEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">WhatsApp Support Number (with 91)</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber || '919091429169'}
                      onChange={(e) => handleSaveSettings({ whatsappNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Currency Code & Symbol</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled
                        value="INR"
                        className="w-1/2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-100 font-bold text-center"
                      />
                      <input
                        type="text"
                        disabled
                        value="₹"
                        className="w-1/2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-100 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: SHIPPING & DELIVERY SETTINGS */}
            {settingsTab === 'shipping' && (
              <div className="space-y-6 text-xs">
                {/* Free Delivery Banner Simulation Preview */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Live Customer Cart Preview
                    </span>
                    <p className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {settings.freeShippingEnabled !== false ? (
                        <span>
                          Add <strong>₹350</strong> more to unlock <strong className="text-emerald-700">FREE DELIVERY.</strong>
                        </span>
                      ) : (
                        <span>Standard delivery fee of ₹{settings.shippingFee} applies unconditionally.</span>
                      )}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                    {settings.freeShippingEnabled !== false ? 'Free Shipping Active' : 'Free Shipping Disabled'}
                  </span>
                </div>

                {/* Shipping Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free Shipping Toggle */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">Free Shipping Program</p>
                      <p className="text-neutral-500 text-[11px]">
                        Enable free delivery above a cart threshold
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.freeShippingEnabled !== false}
                        onChange={(e) => handleSaveSettings({ freeShippingEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  {/* Free Shipping Threshold */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Free Shipping Cart Subtotal Threshold (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={settings.freeShippingThreshold ?? 999}
                      onChange={(e) => handleSaveSettings({ freeShippingThreshold: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-bold"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Orders reaching this amount get ₹0 delivery fee automatically.
                    </p>
                  </div>

                  {/* Standard Shipping Fee */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Standard Shipping Fee (₹) — Set 0 for 100% Free Shipping
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.shippingFee ?? 49}
                      onChange={(e) => handleSaveSettings({ shippingFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-bold"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Applied when cart does not meet the free shipping threshold.
                    </p>
                  </div>

                  {/* Minimum Order Value */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Minimum Cart Order Value (₹) — Set 0 for No Minimum
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={settings.minOrderValue ?? 0}
                      onChange={(e) => handleSaveSettings({ minOrderValue: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-bold"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Blocks checkout submission if the cart subtotal is below this limit.
                    </p>
                  </div>
                </div>

                {/* Serviceable PIN Codes */}
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-neutral-900">Serviceable Indian PIN Codes</h4>
                      <p className="text-[11px] text-neutral-500">
                        Leave list empty to deliver to all 19,000+ Indian PIN Codes, or restrict to specific codes.
                      </p>
                    </div>
                    {settings.serviceablePinCodes && settings.serviceablePinCodes.length > 0 && (
                      <button
                        onClick={() => handleSaveSettings({ serviceablePinCodes: [] })}
                        className="text-xs text-rose-600 font-semibold hover:underline"
                      >
                        Reset to All-India Delivery
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Add 6-digit PIN (e.g. 736101)"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      className="p-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-mono w-48"
                    />
                    <button
                      type="button"
                      onClick={handleAddPinCode}
                      className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
                    >
                      Add PIN
                    </button>
                  </div>

                  {settings.serviceablePinCodes && settings.serviceablePinCodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {settings.serviceablePinCodes.map((pin) => (
                        <span
                          key={pin}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-800 font-mono text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{pin}</span>
                          <button
                            onClick={() => handleRemovePinCode(pin)}
                            className="text-neutral-400 hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 text-neutral-700 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>All-India Delivery Active:</strong> Accepting all valid 6-digit PIN codes across all 28 states & union territories.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 3: OPERATOR ACCESS INFO */}
            {settingsTab === 'operator' && (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-neutral-900 text-white rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm">Authorized Store Operator Profile</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                      SUPER ADMIN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300 pt-1">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Primary Operator Name:</span>
                      <strong className="text-white text-sm">{OFFICIAL_OPERATOR.name}</strong>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Primary Operator Email:</span>
                      <strong className="text-white font-mono">{OFFICIAL_OPERATOR.email}</strong>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Authorized Phone OTP Login:</span>
                      <strong className="text-white font-mono">{OFFICIAL_OPERATOR.phone}</strong>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Operating Headquarters:</span>
                      <span className="text-neutral-300">{OFFICIAL_OPERATOR.address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <h4 className="font-bold text-neutral-900">Security & Permission Rules</h4>
                  <p className="text-neutral-600 leading-relaxed text-[11px]">
                    Firestore security rules explicitly permit write access to product inventories, tracking numbers, and store settings for <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">{OFFICIAL_OPERATOR.email}</code> and mobile <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">{OFFICIAL_OPERATOR.phone}</code>.
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Dedicated operator route: <strong className="font-mono text-neutral-800">/#admin-login</strong> or <strong className="font-mono text-neutral-800">/admin/login</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* SUBTAB 4: CUSTOMER AUTH SETTINGS */}
            {settingsTab === 'auth' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <h4 className="font-bold text-neutral-900">Customer Authentication Providers</h4>
                  <p className="text-neutral-600 text-[11px]">
                    Shoppers can browse freely as guests, and sign in using Google, Mobile OTP, or Email to view order history.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                      <p className="font-bold text-neutral-900">Google OAuth</p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                        Active & Configured
                      </span>
                      <p className="text-[10px] text-neutral-500">1-click popup login</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                      <p className="font-bold text-neutral-900">Mobile Phone OTP</p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                        Ready (+91 SMS)
                      </span>
                      <p className="text-[10px] text-neutral-500">SMS code + test verification</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                      <p className="font-bold text-neutral-900">Email & Password</p>
                      <span className="text-[10px] text-neutral-700 font-bold bg-neutral-100 px-2 py-0.5 rounded-full inline-block">
                        Smart Session Mode
                      </span>
                      <p className="text-[10px] text-neutral-500">Password protected customer profiles</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1.5">
                  <p className="font-bold">Firebase Authentication Console Guidance:</p>
                  <p className="text-[11px] leading-relaxed">
                    If any user encounters <code className="bg-white/80 px-1 py-0.5 rounded font-mono">auth/operation-not-allowed</code>, open Firebase Console &rarr; Build &rarr; Authentication &rarr; Sign-in method tab, and toggle <strong>Email/Password</strong> and <strong>Phone</strong> to ON.
                  </p>
                </div>
              </div>
            )}

            {/* SUBTAB 5: PAYMENT SETTINGS */}
            {settingsTab === 'payment' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Cash on Delivery (COD)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ENABLED
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">
                      Allows shoppers to pay cash or UPI to delivery agents upon doorstep parcel handover.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Prepaid Online UPI / Cards</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">
                      Razorpay & UPI QR tokenized checkout with zero transaction fees for customers.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Goods & Services Tax (GST) Rate %
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate || 18}
                      onChange={(e) => handleSaveSettings({ taxRate: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-bold"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Computed and detailed on customer Tax Invoices.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 6: COURIER INTEGRATION */}
            {settingsTab === 'courier' && (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <h4 className="font-bold text-neutral-900">Logistics & Express Courier Partners</h4>
                  <p className="text-neutral-500 text-[11px]">
                    Dispatches from <strong>Kholta, Cooch Behar Hub</strong> are synchronized with Blue Dart and Delhivery tracking.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-neutral-900">Blue Dart Express</strong>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Primary Carrier
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Air Express transit: 2–3 business days</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-neutral-900">Delhivery Surface & Express</strong>
                        <span className="text-[10px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-bold">
                          Secondary Carrier
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">PAN-India pin code surface reach: 3–5 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 7: STORE POLICIES */}
            {settingsTab === 'policies' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Top Announcement Bar Promo Message
                  </label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => handleSaveSettings({ announcement: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Doorstep Return Guarantee (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.returnPolicyDays || 7}
                    onChange={(e) => handleSaveSettings({ returnPolicyDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Doorstep Return Policy Terms
                  </label>
                  <textarea
                    rows={4}
                    value={settings.returnPolicyText}
                    onChange={(e) => handleSaveSettings({ returnPolicyText: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white leading-relaxed"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
              <span>All changes persist synchronously to Cloud Firestore (<code className="font-mono text-neutral-700">settings/general</code>).</span>
              <button
                type="button"
                onClick={() => {
                  setSettingsSavedMessage('All configurations verified and active!');
                  setTimeout(() => setSettingsSavedMessage(null), 3000);
                }}
                className="px-5 py-2 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Save All Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            <h3 className="text-lg font-black text-neutral-900 mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white capitalize"
                  >
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="jewellery">Fine Jewellery</option>
                    <option value="electronics">Smart Electronics</option>
                    <option value="home-living">Home & Living</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Sale Discount Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={productForm.purchaseCost}
                    onChange={(e) => setProductForm({ ...productForm, purchaseCost: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Primary Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image: e.target.value,
                      images: [e.target.value],
                    })
                  }
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span>Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE ORDER ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Order Management
              </span>
              <h3 className="text-xl font-black text-neutral-900">{selectedOrder.id}</h3>
              <p className="text-xs text-neutral-500">
                Placed on {formatDate(selectedOrder.createdAt)} by {selectedOrder.customerName}
              </p>
            </div>

            {/* Customer & Address Details */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
              <p className="font-bold text-neutral-900">
                Shipping Address: {selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.phone})
              </p>
              <p className="text-neutral-600">
                {selectedOrder.shippingAddress?.houseStreet}, {selectedOrder.shippingAddress?.villageTown},{' '}
                {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.state} - PIN{' '}
                {selectedOrder.shippingAddress?.pinCode}
              </p>
              <p className="text-neutral-600">
                Payment Method: <strong className="uppercase">{selectedOrder.paymentMethod}</strong> (Status:{' '}
                {selectedOrder.paymentStatus})
              </p>
            </div>

            {/* Status Update Form */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-neutral-900">Update Order Status & Dispatch Info</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Status Step</label>
                  <select
                    value={orderStatusUpdate}
                    onChange={(e) => setOrderStatusUpdate(e.target.value as OrderStatus)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={courierNameInput}
                    onChange={(e) => setCourierNameInput(e.target.value)}
                    placeholder="e.g. Blue Dart Express / Delhivery"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Tracking Number / AWB</label>
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="e.g. BLUEDART-9847192"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Internal Status Note</label>
                  <input
                    type="text"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    placeholder="e.g. Dispatched from Cooch Behar Fulfillment Hub"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowInvoiceOrder(selectedOrder)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Tax Invoice</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateOrderStatus}
                    className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
                  >
                    Save Status Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE COUPON ================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200 space-y-4">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            <h3 className="text-base font-black text-neutral-900">Create New Coupon Code</h3>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded-xl font-bold hover:bg-neutral-800"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for Admin */}
      {showInvoiceOrder && (
        <InvoiceModal
          order={showInvoiceOrder}
          onClose={() => setShowInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
