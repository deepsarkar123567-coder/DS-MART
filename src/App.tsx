import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { ContactFaqPage } from './pages/ContactFaqPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ProductCard } from './components/ProductCard';
import { Product } from './types';
import { CheckCircle2, ArrowRight, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { products, seedDemoProducts } = useStore();
  const { wishlist, setIsCartOpen } = useCart();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    const path = window.location.pathname;
    if (path.includes('admin/login') || hash === 'admin/login' || hash === 'admin-login') return 'admin-login';
    if (path.includes('login') || hash === 'login') return 'login';
    if (path.includes('admin') || hash === 'admin') return 'admin';
    return hash || 'home';
  });

  const [navParams, setNavParams] = useState<any>({});
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin/login' || hash === 'admin-login') {
        setCurrentPage('admin-login');
      } else if (hash === 'login') {
        setCurrentPage('login');
      } else if (hash) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavParams(params);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickView = (product: Product) => {
    setActiveModalProduct(product);
  };

  const handleNavigateDetail = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setActiveModalProduct(found);
    }
  };

  const handleOrderSuccess = (orderId: string) => {
    setOrderSuccessId(orderId);
    setCurrentPage('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated full-screen Executive Operator Authentication Portal
  if (currentPage === 'admin-login') {
    return (
      <AdminLoginPage
        onNavigateAdmin={() => handleNavigate('admin')}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Promotional Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {/* Order Success Confirmation Screen */}
        {currentPage === 'order-success' && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Order Placed Successfully
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-2">
                Thank You For Your Order!
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Your order number is <strong className="font-mono text-neutral-900 font-bold">{orderSuccessId}</strong>.
              </p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 text-left text-xs space-y-2 text-neutral-600">
              <p>• A confirmation email and SMS with delivery tracking has been sent.</p>
              <p>• Our logistics partner will deliver your package within 2–4 business days.</p>
              <p>• You can download the GST Tax Invoice directly from your order dashboard.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => handleNavigate('orders')}
                className="px-6 py-3 rounded-2xl bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-md"
              >
                Track Order & View Invoice
              </button>
              <button
                onClick={() => handleNavigate('shop')}
                className="px-6 py-3 rounded-2xl bg-neutral-100 text-neutral-800 font-bold text-xs hover:bg-neutral-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* 1. Home Page */}
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {/* 2. Shop Page */}
        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={navParams.category || 'all'}
            initialFilter={navParams.filter}
            initialSearch={navParams.search}
            onOpenQuickView={handleOpenQuickView}
            onNavigateDetail={handleNavigateDetail}
          />
        )}

        {/* 3. Wishlist View */}
        {currentPage === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                <span>My Saved Wishlist ({wishlist.length})</span>
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Saved items synchronized to your account.
              </p>
            </div>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenQuickView={handleOpenQuickView}
                      onNavigateDetail={handleNavigateDetail}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
                <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900 mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Save items you love by tapping the heart icon on any product card.
                </p>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
                >
                  Explore Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Checkout Page */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigateShop={() => handleNavigate('shop')}
          />
        )}

        {/* 5. Orders & Tracking */}
        {currentPage === 'orders' && (
          <MyOrdersPage
            onNavigateShop={() => handleNavigate('shop')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* 6. Customer Profile & Addresses */}
        {currentPage === 'profile' && (
          <CustomerProfilePage
            onNavigateShop={() => handleNavigate('shop')}
            onNavigateOrders={() => handleNavigate('orders')}
            onNavigateWishlist={() => handleNavigate('wishlist')}
          />
        )}

        {/* Customer Standalone Login */}
        {currentPage === 'login' && (
          <CustomerLoginPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigateAdminLogin={() => handleNavigate('admin-login')}
          />
        )}

        {/* 7. Protected Admin Dashboard */}
        {currentPage === 'admin' && (
          <AdminDashboard
            onNavigateHome={() => handleNavigate('home')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateAdminLogin={() => handleNavigate('admin-login')}
          />
        )}

        {/* 8. Contact & FAQ */}
        {currentPage === 'contact' && <ContactFaqPage />}

        {/* 9. Policies & Shipping Coverage */}
        {currentPage === 'policies' && <PoliciesPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onNavigateCheckout={() => handleNavigate('checkout')}
        onNavigateShop={() => handleNavigate('shop')}
      />

      {/* Global Customer Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Product Quick View / Detail Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onNavigateDetail={handleNavigateDetail}
        />
      )}

      {/* Floating WhatsApp Support Bubble */}
      <WhatsAppButton />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
