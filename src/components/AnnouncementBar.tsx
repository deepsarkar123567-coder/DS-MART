import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Phone, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  return (
    <div className="bg-black text-white text-xs py-2 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{settings.announcement}</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-300 text-[11px] shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Genuine Products
          </span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <a
            href="tel:7908649537"
            className="hidden md:flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Support: +91 7908649537</span>
          </a>
        </div>
      </div>
    </div>
  );
};
