'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/libreria', icon: 'menu_book', label: 'Libreria' },
  { href: '/ricerca', icon: 'search', label: 'Cerca' },
  { href: '/statistiche', icon: 'leaderboard', label: 'Statistiche' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#fcf9f4]/90 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0px_-12px_32px_rgba(28,28,25,0.05)]">
      {TABS.map(tab => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all ${
              isActive
                ? 'bg-[#2c4132] text-[#fcf9f4] rounded-2xl scale-105'
                : 'text-[#4e6073] hover:text-[#162b1d]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="font-medium text-[10px] tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
