import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactFaqPage: React.FC = () => {
  const { settings } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const faqs = [
    {
      q: 'What is the estimated delivery timeframe?',
      a: 'Orders shipped across major Indian metros are delivered within 2 to 3 business days. Tier-2 and Tier-3 cities receive delivery within 3 to 5 business days via Blue Dart and Delhivery Express.',
    },
    {
      q: 'How does the 7-Day Easy Return policy work?',
      a: 'If you are not 100% satisfied with your order, you can initiate a return within 7 days of delivery directly from your My Orders page. We schedule a doorstep reverse pickup with zero extra cost.',
    },
    {
      q: 'What payment modes are accepted?',
      a: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, Net Banking, and major mobile wallets.',
    },
    {
      q: 'How do I apply promotional coupons?',
      a: 'You can enter coupon codes like DSMART10 (10% off) or FESTIVE20 in the cart drawer or checkout screen before placing your order.',
    },
    {
      q: 'Are all products 100% genuine and hallmarked?',
      a: 'Yes, every product on DS MART undergoes rigorous quality screening. Our jewellery is hallmarked 925 sterling silver, and all electronics come with official warranty cards.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Customer Support & FAQ</h1>
        <p className="text-xs text-neutral-500 mt-2">
          We are here to assist with your orders, sizing queries, payments, or product specifications.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="tel:7908649537"
          className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-xs text-center space-y-2 hover:border-black transition-colors block group"
        >
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-black mb-3 group-hover:bg-black group-hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Phone Support</h3>
          <p className="text-xs font-semibold text-neutral-900 group-hover:underline">+91 7908649537</p>
          <p className="text-[11px] text-neutral-400">Monday–Saturday: 9 AM – 8 PM IST</p>
        </a>

        <a
          href="mailto:ds.mart3145@gmail.com"
          className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-xs text-center space-y-2 hover:border-black transition-colors block group"
        >
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-black mb-3 group-hover:bg-black group-hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Email Helpline</h3>
          <p className="text-xs font-semibold text-neutral-900 group-hover:underline">ds.mart3145@gmail.com</p>
          <p className="text-[11px] text-neutral-400">Response within 4 business hours</p>
        </a>

        <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-black mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Store & Dispatch Center</h3>
          <p className="text-xs text-neutral-700 font-medium">Kholta, Cooch Behar, West Bengal - 736101</p>
          <p className="text-[11px] text-neutral-400">Operated by Dwip Sarkar</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">Frequently Asked Questions</h2>
        <div className="divide-y divide-neutral-200">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-neutral-900 text-sm gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-neutral-50 p-6 sm:p-10 rounded-3xl border border-neutral-200 space-y-4">
        <h2 className="text-lg font-black text-neutral-900 tracking-tight">Send Us a Direct Message</h2>
        <p className="text-xs text-neutral-500">
          Fill out this form and our support executive will connect with you promptly.
        </p>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your message has been received. Ticket #DS-{Math.floor(1000 + Math.random()*9000)} created.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Subject / Order ID"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
            />
            <textarea
              required
              rows={4}
              placeholder="How can we help you today?"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
