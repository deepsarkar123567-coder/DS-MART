import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { ShippingAddress } from '../types';
import { isValidIndianPinCode, isValidIndianPhone } from '../utils/formatters';

interface CustomerProfilePageProps {
  onNavigateShop: () => void;
  onNavigateOrders: () => void;
  onNavigateWishlist: () => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  onNavigateShop,
  onNavigateOrders,
  onNavigateWishlist,
}) => {
  const { currentUser, userProfile, saveAddress } = useAuth();
  const { wishlist } = useCart();
  const { orders } = useStore();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<ShippingAddress>({
    fullName: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    houseStreet: '',
    villageTown: '',
    district: '',
    state: 'Delhi NCR',
    pinCode: '',
  });
  const [addrError, setAddrError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-black text-neutral-900 mb-2">Please Sign In</h2>
        <p className="text-xs text-neutral-500 mb-6">You need to sign in to manage your customer profile.</p>
        <button
          onClick={onNavigateShop}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);

    if (!isValidIndianPhone(newAddr.phone)) {
      setAddrError('Please provide a valid 10-digit Indian phone number.');
      return;
    }
    if (!isValidIndianPinCode(newAddr.pinCode)) {
      setAddrError('Please provide a valid 6-digit Indian PIN code.');
      return;
    }

    await saveAddress(newAddr);
    setIsAddingAddress(false);
    setNewAddr({
      fullName: currentUser?.displayName || '',
      phone: '',
      email: currentUser?.email || '',
      houseStreet: '',
      villageTown: '',
      district: '',
      state: 'Delhi NCR',
      pinCode: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-black text-white font-black text-2xl flex items-center justify-center shrink-0">
            {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {currentUser.displayName || 'Valued Customer'}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email}</span>
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 uppercase tracking-wider">
              {userProfile?.role === 'admin' ? 'Store Administrator' : 'Verified Shopper'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <button
            onClick={onNavigateOrders}
            className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border border-neutral-200/80 text-center transition-colors min-w-[100px]"
          >
            <Package className="w-5 h-5 mx-auto mb-1 text-neutral-700" />
            <span className="text-lg font-black text-neutral-900">{orders.length}</span>
            <span className="block text-[11px] text-neutral-500">Orders</span>
          </button>

          <button
            onClick={onNavigateWishlist}
            className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border border-neutral-200/80 text-center transition-colors min-w-[100px]"
          >
            <Heart className="w-5 h-5 mx-auto mb-1 text-rose-600" />
            <span className="text-lg font-black text-neutral-900">{wishlist.length}</span>
            <span className="block text-[11px] text-neutral-500">Wishlist</span>
          </button>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Saved Shipping Addresses</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage your delivery addresses for seamless 1-click checkout.
            </p>
          </div>

          {!isAddingAddress && (
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-3.5 py-1.5 bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {/* Add Address Form */}
        {isAddingAddress && (
          <form
            onSubmit={handleSaveNewAddress}
            className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4"
          >
            <h3 className="text-xs font-bold text-neutral-900">New Address Details</h3>

            {addrError && (
              <p className="text-xs text-rose-600 font-semibold">{addrError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile (10 digits)</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">House, Street & Locality</label>
                <input
                  type="text"
                  required
                  value={newAddr.houseStreet}
                  onChange={(e) => setNewAddr({ ...newAddr, houseStreet: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Town</label>
                <input
                  type="text"
                  required
                  value={newAddr.villageTown}
                  onChange={(e) => setNewAddr({ ...newAddr, villageTown: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">6-Digit PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAddr.pinCode}
                  onChange={(e) => setNewAddr({ ...newAddr, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="px-4 py-2 border border-neutral-300 text-xs font-semibold rounded-xl hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Existing Addresses list */}
        {userProfile?.addresses && userProfile.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userProfile.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-1 text-xs relative"
              >
                <p className="font-bold text-neutral-900">{addr.fullName}</p>
                <p className="text-neutral-600">{addr.houseStreet}</p>
                <p className="text-neutral-600">{addr.villageTown}, {addr.district}</p>
                <p className="text-neutral-600 font-semibold">{addr.state} - PIN {addr.pinCode}</p>
                <p className="text-neutral-500 pt-1">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          !isAddingAddress && (
            <p className="text-xs text-neutral-400 text-center py-4">
              No saved addresses yet. Add one above or enter during checkout.
            </p>
          )
        )}
      </div>
    </div>
  );
};
