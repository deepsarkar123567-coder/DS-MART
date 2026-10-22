import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();

  if (!settings.whatsappNumber) return null;

  const rawNumber = settings.whatsappNumber || '919091429169';
  const cleanNumber = rawNumber.replace(/\D/g, '').endsWith('9091429169')
    ? '919091429169'
    : rawNumber.replace(/\D/g, '') || '919091429169';
  const message = encodeURIComponent(`Hi DS MART (Dwip Sarkar), I have an inquiry regarding products and delivery.`);
  const url = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
      title="Chat with DS MART on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
        Chat with Us
      </span>
    </a>
  );
};
