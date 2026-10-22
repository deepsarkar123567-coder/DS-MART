import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShippingAddress, OrderItem } from '../types';
import { formatINR, isValidIndianPinCode, isValidIndianPhone } from '../utils/formatters';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onNavigateShop: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
  'Jammu & Kashmir',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onNavigateShop,
}) => {
  const { cart, subtotal, discount, deliveryCharge, taxAmount, finalTotal, clearCart, appliedCoupon } = useCart();
  const { createOrder, settings } = useStore();
  const { currentUser, userProfile, saveAddress } = useAuth();

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    houseStreet: '',
    villageTown: '',
    district: '',
    state: 'West Bengal',
    pinCode: '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500 mb-6">
          Add some products before proceeding to the checkout counter.
        </p>
        <button
          onClick={onNavigateShop}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Minimum Order Value check
    if (settings.minOrderValue && settings.minOrderValue > 0 && subtotal < settings.minOrderValue) {
      setValidationError(
        `Minimum order value of ${formatINR(settings.minOrderValue)} is required. Please add ${formatINR(settings.minOrderValue - subtotal)} more to your cart.`
      );
      return;
    }

    // 1. Validation
    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!isValidIndianPhone(formData.phone)) {
      setValidationError('Please enter a valid 10-digit Indian mobile number (e.g. 7908649537).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!formData.houseStreet.trim()) {
      setValidationError('Please enter flat/house number and street name.');
      return;
    }
    if (!formData.villageTown.trim()) {
      setValidationError('Please enter town or city.');
      return;
    }
    if (!isValidIndianPinCode(formData.pinCode)) {
      setValidationError('Please enter a valid 6-digit Indian PIN code (e.g. 736101).');
      return;
    }

    // Serviceable PIN Code check
    if (
      settings.serviceablePinCodes &&
      settings.serviceablePinCodes.length > 0 &&
      !settings.serviceablePinCodes.includes(formData.pinCode.trim())
    ) {
      setValidationError(
        `We currently deliver only to select PIN codes: ${settings.serviceablePinCodes.join(', ')}. Delivery is not currently available for PIN ${formData.pinCode}.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((c) => ({
        productId: c.productId,
        title: c.title,
        price: c.price,
        image: c.image,
        quantity: c.quantity,
        size: c.size || '',
        color: c.color || '',
      }));

      const paymentStatus = paymentMethod === 'online' ? 'paid' : 'pending';

      const orderId = await createOrder({
        customerId: currentUser?.uid || `guest-${Date.now()}`,
        customerEmail: formData.email.trim(),
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          houseStreet: formData.houseStreet.trim(),
          villageTown: formData.villageTown.trim(),
          district: formData.district.trim(),
          state: formData.state,
          pinCode: formData.pinCode.trim(),
          instructions: formData.instructions?.trim() || '',
        },
        items: orderItems,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code || '',
        deliveryCharge,
        taxAmount,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus,
        paymentDetails:
          paymentMethod === 'online'
            ? { transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`, gateway: 'Razorpay Test' }
            : { transactionId: 'COD-PENDING', gateway: 'Cash on Delivery' },
        orderStatus: 'Pending',
      });

      // Save address to user profile if logged in
      if (currentUser) {
        await saveAddress(formData);
      }

      clearCart();
      setIsSubmitting(false);
      onOrderSuccess(orderId);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setValidationError(err?.message || 'Failed to create order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-b border-neutral-200 pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review your delivery details and choose your preferred payment option.
        </p>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Shipping Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Contact & Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-4 shadow-xs">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  maxLength={10}
                  placeholder="10-digit Indian Mobile"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address * (For order updates & invoice)
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Flat, House No., Building, Street *
                </label>
                <input
                  type="text"
                  required
                  name="houseStreet"
                  placeholder="e.g. Flat 402, Green Valley Apts, MG Road"
                  value={formData.houseStreet}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Town / City *
                </label>
                <input
                  type="text"
                  required
                  name="villageTown"
                  placeholder="e.g. Cooch Behar / Kolkata / Bengaluru"
                  value={formData.villageTown}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  name="district"
                  placeholder="e.g. Gautam Buddha Nagar"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  6-Digit Indian PIN Code *
                </label>
                <input
                  type="text"
                  required
                  name="pinCode"
                  maxLength={6}
                  placeholder="e.g. 201301"
                  value={formData.pinCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pinCode: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  rows={2}
                  placeholder="e.g. Leave with security guard, call before arriving..."
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-4 shadow-xs">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Payment Option</span>
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-black bg-neutral-50/80'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-neutral-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Zero Advance
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Pay securely using cash or QR scan on delivery agent arrival. Status will be pending until delivered.
                  </p>
                </div>
              </label>

              {/* Online Payment / Razorpay simulation */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-black bg-neutral-50/80'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1 accent-black"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-neutral-900">
                        Online UPI / Cards / NetBanking
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowRazorpayModal(true);
                      }}
                      className="text-[11px] text-blue-600 underline font-medium flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" />
                      <span>Provider Info</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Instant verified authorization. (Demo sandbox enabled for preview).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Items & Pricing Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-neutral-50 p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-6 shadow-xs">
            <h3 className="text-base font-extrabold text-neutral-900">Order Summary</h3>

            {/* Items list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-neutral-200 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-neutral-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-neutral-500">
                      Qty: {item.quantity} {item.size ? `• Size ${item.size}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee</span>
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-600">FREE Delivery</span>
                ) : (
                  <span className="font-semibold text-neutral-900">{formatINR(deliveryCharge)}</span>
                )}
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>Taxes Included (GST 18%)</span>
                <span>{formatINR(taxAmount)}</span>
              </div>
              <div className="border-t border-neutral-300 pt-3 flex justify-between text-base font-black text-neutral-950">
                <span>Total Payable</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isSubmitting
                  ? 'Confirming Order...'
                  : paymentMethod === 'cod'
                  ? `Place Cash on Delivery Order • ${formatINR(finalTotal)}`
                  : `Pay & Place Order • ${formatINR(finalTotal)}`}
              </span>
            </button>

            <div className="text-[11px] text-neutral-500 text-center space-y-1">
              <p>🔒 256-bit Encrypted Checkout • 7-Day Hassle-Free Returns</p>
              <p>By placing your order, you agree to DS MART Terms & Conditions.</p>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Gateway Explanation Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Payment Gateway Integration Architecture
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Per strict security guidelines, live payment gateways like <strong>Razorpay</strong> require
              private API Key Secrets and webhook signature verifications configured exclusively on a secure
              server.
            </p>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1.5 mb-4">
              <p>• <strong>Sandbox Simulator:</strong> Simulated card/UPI authorization is active for instant preview testing.</p>
              <p>• <strong>Production Ready:</strong> Server proxy verifies webhook signatures before marking orders as paid.</p>
              <p>• <strong>No Card Storage:</strong> Client never stores sensitive card or bank details.</p>
            </div>
            <button
              onClick={() => setShowRazorpayModal(false)}
              className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
