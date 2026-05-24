'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Wrench, Library } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BottomNav() {
  const pathname = usePathname();
  const [notSubmittedCount, setNotSubmittedCount] = useState<number>(0);

  useEffect(() => {
    // Fetches initial count from the backend
    const fetchCount = () => {
      axios.get(`${API_URL}/api/assignments`)
        .then(res => {
          const count = (res.data || []).filter(
            (a: any) => a.status === 'completed' || a.status === 'pending' || a.status === 'processing'
          ).length;
          setNotSubmittedCount(count);
        })
        .catch(() => setNotSubmittedCount(0));
    };

    fetchCount(); 

    // Instantly drops the counter by 1 when user clicks "Submit" in Dashboard
    const handleSubmission = () => setNotSubmittedCount(prev => Math.max(0, prev - 1));

    window.addEventListener('assignmentSubmitted', handleSubmission);
    return () => window.removeEventListener('assignmentSubmitted', handleSubmission);
  }, [pathname]);

  const navItems = [
    { label: 'Home',                 href: '/home',    icon: Home },
    { label: 'My Groups',            href: '/groups',  icon: Users },
    { label: 'Assignments',          href: '/',        icon: BookOpen, badge: notSubmittedCount },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: Wrench },
    { label: 'My Library',           href: '/library', icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-1 pt-2 pb-5 lg:hidden print:hidden">
      {navItems.map(({ label, href, icon: Icon, badge }) => {
        const active =
          pathname === href ||
          (pathname.startsWith('/output') && href === '/');
          
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 flex-1 py-1"
          >
            <div className={`relative p-1.5 rounded-xl transition-colors ${active ? 'bg-orange-50' : ''}`}>
              <Icon
                size={20}
                className={active ? 'text-[#E1502E]' : 'text-gray-400'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#E1502E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm border-[1.5px] border-white">
                  {badge}
                </span>
              )}
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
