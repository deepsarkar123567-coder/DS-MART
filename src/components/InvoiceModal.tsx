import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.id.replace('ORD-', '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 my-6">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="print:hidden px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Tax Invoice Document
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-neutral-900 font-sans text-xs print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-300 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-black text-sm">
                  DS
                </div>
                <h1 className="text-xl font-black tracking-tight">DS MART RETAIL</h1>
              </div>
              <p className="text-neutral-500 font-medium">Modern Online Shopping Store • Operated by Dwip Sarkar</p>
              <p className="text-neutral-500">Kholta, Cooch Behar, West Bengal, India - 736101</p>
              <p className="text-neutral-500">GSTIN: 19AAACD1234F1Z5 | PAN: AAACD1234F</p>
              <p className="text-neutral-500">Support: ds.mart3145@gmail.com | Helpline: +91 7908649537</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-neutral-100 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-2">
                ORIGINAL TAX INVOICE
              </span>
              <p className="font-bold text-sm text-neutral-900">Invoice No: {invoiceNumber}</p>
              <p className="text-neutral-600">Order ID: {order.id}</p>
              <p className="text-neutral-600">Order Date: {formatDate(order.createdAt)}</p>
              <p className="text-neutral-600">
                Payment Mode:{' '}
                <strong className="uppercase font-semibold">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
                </strong>
              </p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 border-b border-neutral-300 pb-6 mb-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                Billed To & Shipped To:
              </h3>
              <p className="font-bold text-neutral-900 text-sm">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{order.shippingAddress.houseStreet}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.villageTown}, {order.shippingAddress.district}
              </p>
              <p className="text-neutral-600">
                {order.shippingAddress.state} - <strong>PIN {order.shippingAddress.pinCode}</strong>
              </p>
              <p className="text-neutral-600">Phone: {order.shippingAddress.phone}</p>
              <p className="text-neutral-600">Email: {order.shippingAddress.email}</p>
            </div>

            <div className="border-l border-neutral-200 pl-6">
              <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                Delivery Details:
              </h3>
              <p className="text-neutral-700">
                Courier:{' '}
                <strong>{order.courierName || 'Blue Dart / Delhivery Express'}</strong>
              </p>
              <p className="text-neutral-700">
                AWB / Tracking:{' '}
                <strong>{order.trackingNumber || 'In Dispatch Queue'}</strong>
              </p>
              <p className="text-neutral-700">
                Status:{' '}
                <span className="font-bold text-neutral-900">{order.orderStatus}</span>
              </p>
              {order.shippingAddress.instructions && (
                <p className="text-neutral-500 mt-1 italic">
                  Note: "{order.shippingAddress.instructions}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-neutral-800 text-[11px] uppercase tracking-wider">
                <th className="py-2">#</th>
                <th className="py-2">Description & SKU</th>
                <th className="py-2 text-center">HSN</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, idx) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 text-neutral-500">{idx + 1}</td>
                    <td className="py-2.5">
                      <p className="font-bold text-neutral-900">{item.title}</p>
                      <div className="flex gap-2 text-[10px] text-neutral-500 mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-neutral-500 font-mono">6204</td>
                    <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 text-right">{formatINR(item.price)}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">
                      {formatINR(itemTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Box */}
          <div className="flex justify-end border-t border-neutral-300 pt-4 mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({order.couponCode || 'Coupon'})</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : formatINR(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>Taxes Included (GST 18%)</span>
                <span>{formatINR(order.taxAmount)}</span>
              </div>
              <div className="border-t border-neutral-900 pt-2 flex justify-between text-base font-black text-neutral-950">
                <span>Grand Total</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Legal and terms */}
          <div className="border-t border-neutral-200 pt-4 text-[10px] text-neutral-500 leading-relaxed">
            <p><strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            <p>Goods once sold can be returned within 7 days as per DS MART Return Policy.</p>
            <p className="mt-2 text-neutral-400">This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
