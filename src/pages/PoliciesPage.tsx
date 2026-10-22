import React from 'react';
import { Shield, RotateCcw, Truck, FileCheck, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PoliciesPage: React.FC = () => {
  const { settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Customer Policies & Terms</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Transparent guidelines protecting your shopping experience at DS MART.
        </p>
      </div>

      {/* 7-Day Returns */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-neutral-900">{settings.returnPolicyDays}-Day Doorstep Return Policy</h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {settings.returnPolicyText}
        </p>
        <div className="pt-2 text-xs text-neutral-700 space-y-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Product must remain unused with price tags, original packaging and certificates intact.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Refunds for prepaid orders are credited back to the original source within 3–5 working days.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>For Cash on Delivery (COD) orders, refunds are disbursed directly via instant UPI or NEFT.</span>
          </div>
        </div>
      </section>

      {/* Shipping & Delivery Terms */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
            <Truck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-neutral-900">Shipping Fees & Indian PIN Coverage</h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          We ship across all 28 Indian States and Union Territories from our central hub at <strong>Kholta, Cooch Behar, West Bengal - 736101</strong>, operated by <strong>Dwip Sarkar</strong>.
          {settings.freeShippingEnabled !== false ? (
            <> Orders valued at <strong>₹{settings.freeShippingThreshold} and above</strong> qualify for 100% <strong>Free Express Delivery</strong>. Orders below this threshold incur a nominal fee of ₹{settings.shippingFee}.</>
          ) : (
            <> Standard delivery fee is ₹{settings.shippingFee} per order.</>
          )}
        </p>
        <p className="text-xs text-neutral-500">
          Standard express transit takes 2 to 4 business days via Blue Dart and Delhivery.
        </p>
      </section>

      {/* Privacy & Data Protection */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-neutral-900">Privacy & Data Security</h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          At DS MART, your personal data is protected under modern cloud security architectures.
          We never sell, rent, or trade your personal email, phone numbers, or delivery records with third parties.
          Payment details are handled strictly through encrypted, PCI-DSS Level 1 compliant tokenized channels.
        </p>
      </section>

      {/* GST & Invoicing */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-neutral-900">GST Compliance & Legal Information</h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          All orders are dispatched with official computer-generated GST tax invoices conforming to the Central Goods and Services Tax Act.
          GSTIN: 07AAACD1234F1Z5. The prices shown on our website include all applicable Central GST and State GST levies.
        </p>
      </section>
    </div>
  );
};
