import React, { useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Truck,
  CreditCard,
  Mail,
  CheckCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-950 text-white mt-16 border-t border-neutral-800">
      {/* 4 Value Proposition Pillars */}
      <div className="border-b border-neutral-850 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-white">
              <Truck className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Free Express Shipping</h4>
              <p className="text-xs text-neutral-400 mt-0.5">On all orders above ₹{settings.freeShippingThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-white">
              <RefreshCw className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{settings.returnPolicyDays}-Day Easy Returns</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Doorstep pickup & quick refund</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Guaranteed</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Directly sourced & verified quality</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-white">
              <CreditCard className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Flexible Payment</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Cash on Delivery & Secure Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black text-lg">
                DS
              </div>
              <span className="text-xl font-black tracking-tight">{settings.storeName}</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Your destination for smart, refined online shopping. Experience thoughtfully curated
              apparel, precious jewellery, next-gen electronics, and designer home accents with reliable delivery across India.
            </p>
            <div className="space-y-2.5 text-xs text-neutral-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  {settings.address || 'Kholta, Cooch Behar, West Bengal, India - 736101'}
                  <span className="block text-[11px] text-neutral-500">Operated by {settings.operatorName || 'Dwip Sarkar'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>
                  Helpline:{' '}
                  <a
                    href="tel:7908649537"
                    className="text-white hover:underline font-semibold"
                  >
                    +91 7908649537
                  </a>{' '}
                  (Mon–Sat 9am–8pm IST)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>
                  Support:{' '}
                  <a
                    href="mailto:ds.mart3145@gmail.com"
                    className="text-white hover:underline font-semibold"
                  >
                    ds.mart3145@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-200 mb-4">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'fashion' })}
                  className="hover:text-white transition-colors"
                >
                  Fashion & Apparel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'jewellery' })}
                  className="hover:text-white transition-colors"
                >
                  Fine Jewellery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'electronics' })}
                  className="hover:text-white transition-colors"
                >
                  Smart Electronics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'home-living' })}
                  className="hover:text-white transition-colors"
                >
                  Home & Living
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { filter: 'new-arrivals' })}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { filter: 'best-sellers' })}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Quick links & support */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-200 mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-white transition-colors">
                  Track My Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">
                  My Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors">
                  Shipping & PIN Coverage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-200 mb-4">
              Join the Inner Circle
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Subscribe to get exclusive festival promotions, early sale access, and special coupon codes.
            </p>
            {subscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Thank you! Use coupon <strong>DSMART10</strong> for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-black font-semibold text-xs py-2 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
            <div className="mt-4 pt-3 border-t border-neutral-850">
              <p className="text-[11px] text-neutral-500">
                GSTIN: 07AAACD1234F1Z5 | Registered under Indian E-Commerce Commerce Rules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              UPI Accepted
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              RuPay
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              Visa / MC
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
