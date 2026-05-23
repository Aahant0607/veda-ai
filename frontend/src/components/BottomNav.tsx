'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Wrench, Library } from 'lucide-react';

const navItems = [
  { label: 'Home',                 href: '/home',    icon: Home     },
  { label: 'Assignments',          href: '/',        icon: BookOpen },
  { label: "AI Teacher's Toolkit", href: '/toolkit', icon: Wrench   },
  { label: 'My Library',           href: '/library', icon: Library  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-1 pt-2 pb-5 print:hidden">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active =
          pathname === href ||
          (pathname.startsWith('/output') && href === '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 flex-1 py-1"
          >
            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-orange-50' : ''}`}>
              <Icon
                size={20}
                className={active ? 'text-[#E1502E]' : 'text-gray-400'}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[9px] font-semibold leading-tight text-center ${
                active ? 'text-[#E1502E]' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}