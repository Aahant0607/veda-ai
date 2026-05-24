'use client';

import { Home, Users, BookOpen, Wrench, Library, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Sidebar() {
  const pathname = usePathname();
  const [notSubmittedCount, setNotSubmittedCount] = useState<number>(0);

  useEffect(() => {
    axios.get(`${API_URL}/api/assignments`)
      .then(res => {
        // Counts assignments that are in queue, processing, or ready for review (completed)
        const count = (res.data || []).filter(
          (a: any) => a.status === 'completed' || a.status === 'pending' || a.status === 'processing'
        ).length;
        setNotSubmittedCount(count);
      })
      .catch(() => setNotSubmittedCount(0));
  }, [pathname]);

  const navItems = [
    { icon: <Home size={20} />,     label: 'Home',                 href: '/home'    },
    { icon: <Users size={20} />,    label: 'My Groups',            href: '/groups'  },
    { icon: <BookOpen size={20} />, label: 'Assignments',          href: '/',       badge: notSubmittedCount },
    { icon: <Wrench size={20} />,   label: "AI Teacher's Toolkit", href: '/toolkit' },
    { icon: <Library size={20} />,  label: 'My Library',           href: '/library' },
  ];

  return (
    <aside className="hidden lg:flex w-[260px] min-h-[calc(100vh-32px)] sticky top-4 bg-white rounded-[2rem] shadow-sm flex-col p-5 print:hidden shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2 mt-2">
        <div className="bg-[#E1502E] text-white p-1.5 rounded-xl font-bold text-xl leading-none flex items-center justify-center w-8 h-8 shadow-md">
          V
        </div>
        <span className="font-extrabold text-2xl tracking-tight">VedaAI</span>
      </div>

      {/* Create Button */}
      <Link href="/create"
        className="bg-[#1C1C1C] text-white rounded-2xl py-3 px-4 flex items-center gap-3 mb-8 hover:bg-black transition-colors shadow-md">
        <div className="bg-[#E1502E] rounded-full p-1">
          <Plus size={16} strokeWidth={3} />
        </div>
        <span className="font-semibold text-sm">Create Assignment</span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith('/output') && item.href === '/');
          return (
            <Link key={item.label} href={item.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-gray-100 text-black font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              {/* Only show badge if count > 0 */}
              {item.badge != null && item.badge > 0 && (
                <span className="bg-[#E1502E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-4 pt-8">
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-900">
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </Link>
        <Link href="/settings"
          className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-gray-100 hover:bg-gray-100 transition w-full text-left">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex-shrink-0 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate text-gray-900">Delhi Public School</span>
            <span className="text-xs text-gray-500 truncate">Bokaro Steel City</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
