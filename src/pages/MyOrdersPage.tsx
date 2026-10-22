import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  RotateCcw,
  Ban,
  ChevronRight,
  Search,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { InvoiceModal } from '../components/InvoiceModal';

interface MyOrdersPageProps {
  onNavigateShop: () => void;
  onOpenAuth: () => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigateShop, onOpenAuth }) => {
  const { orders, cancelOrder, requestReturn } = useStore();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Changed my mind');
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Size/fit issue');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-neutral-900 mb-2">Sign In to View Orders</h2>
        <p className="text-xs text-neutral-500 mb-6">
          Please sign in to track your current deliveries and view your purchase history.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  const handleConfirmCancel = async () => {
    if (!cancellingOrderId) return;
    await cancelOrder(cancellingOrderId, cancelReason);
    setCancellingOrderId(null);
  };

  const handleConfirmReturn = async () => {
    if (!returningOrderId) return;
    await requestReturn(returningOrderId, returnReason);
    setReturningOrderId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track real-time delivery status, download tax invoices, or request easy returns.
          </p>
        </div>

        {/* Search inside orders */}
        {orders.length > 0 && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">
            {searchQuery ? 'No orders match your search' : 'No orders placed yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-6">
            When you purchase items from DS MART, your live shipment updates and invoices will appear here.
          </p>
          <button
            onClick={onNavigateShop}
            className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            const isReturned = order.orderStatus === 'Returned';
            const isDelivered = order.orderStatus === 'Delivered';
            const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';
            const canReturn = isDelivered;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Order ID</span>
                      <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Placed On</span>
                      <span className="font-medium text-neutral-700">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <span className="font-black text-neutral-950">{formatINR(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : isReturned
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    {/* Tax Invoice button */}
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:border-black bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Tracking Stepper (If not cancelled or returned) */}
                {!isCancelled && !isReturned && (
                  <div className="px-6 py-6 bg-white border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-800 mb-4 flex items-center justify-between">
                      <span>Delivery Progress</span>
                      {order.trackingNumber && (
                        <span className="font-mono font-medium text-neutral-500">
                          Tracking: {order.trackingNumber} ({order.courierName || 'Blue Dart'})
                        </span>
                      )}
                    </p>

                    <div className="relative">
                      {/* Timeline Bar */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-neutral-200 -z-0 hidden sm:block">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, currentStepIdx) / (ORDER_STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;
                          return (
                            <div key={step} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                                  isDone
                                    ? 'bg-black text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-400'
                                } ${isCurrent ? 'ring-4 ring-neutral-200' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] leading-tight ${
                                  isCurrent
                                    ? 'font-bold text-black'
                                    : isDone
                                    ? 'font-medium text-neutral-800'
                                    : 'text-neutral-400'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled / Returned Notice */}
                {isCancelled && (
                  <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-xs text-rose-800">
                    <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Order was cancelled. Reason: <strong>{order.cancellationReason || 'Requested by customer'}</strong>.
                    </span>
                  </div>
                )}
                {isReturned && (
                  <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex items-center gap-3 text-xs text-purple-800">
                    <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Return process initiated. Reason: <strong>{order.returnReason || 'Requested by customer'}</strong>. Pickup will be arranged within 48h.
                    </span>
                  </div>
                )}

                {/* Items in this order */}
                <div className="p-6 divide-y divide-neutral-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-neutral-50 border border-neutral-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}{' '}
                          {item.color ? `• Color: ${item.color}` : ''}
                        </p>
                        <p className="text-xs font-bold text-neutral-900 mt-1">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate max-w-sm">
                      Deliver to: {order.shippingAddress.fullName}, PIN {order.shippingAddress.pinCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => setCancellingOrderId(order.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 font-semibold transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={() => setReturningOrderId(order.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 font-semibold transition-colors"
                      >
                        Request Return (7-Day Policy)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Dialog */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-sm font-black text-neutral-900 mb-2">Confirm Cancellation</h3>
            <p className="text-xs text-neutral-600 mb-4">
              Are you sure you want to cancel order <strong>{cancellingOrderId}</strong>?
            </p>

            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Select reason:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 mb-4"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price elsewhere">Found better price elsewhere</option>
              <option value="Delivery time too long">Delivery time too long</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Dialog */}
      {returningOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-sm font-black text-neutral-900 mb-2">Request 7-Day Return</h3>
            <p className="text-xs text-neutral-600 mb-4">
              Doorstep pickup will be scheduled at zero extra cost.
            </p>

            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Reason for return:
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 mb-4"
            >
              <option value="Size/fit issue">Size or fit issue</option>
              <option value="Product not as expected">Product not as expected</option>
              <option value="Received damaged or defective item">Received damaged or defective item</option>
              <option value="Quality not satisfactory">Quality not satisfactory</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setReturningOrderId(null)}
                className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={handleConfirmReturn}
                className="flex-1 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
};
