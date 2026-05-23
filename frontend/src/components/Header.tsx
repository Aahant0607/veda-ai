'use client';

import { useState } from 'react';
import { BookOpen, Bell } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Mock notifications data
  const notifications = [
    { id: 1, text: "Quiz on Electricity generated successfully.", time: "2 mins ago", read: false },
    { id: 2, text: "Student 'Alex' submitted their assignment.", time: "1 hour ago", read: false },
    { id: 3, text: "System maintenance scheduled for midnight.", time: "1 day ago", read: true },
  ];

  const markAllAsRead = () => {
    setUnreadCount(0);
    setShowNotifs(false);
  };

  return (
    <header className="flex justify-between items-center mb-6 px-2 print:hidden relative">
      <div className="flex items-center gap-2 text-gray-500">
        <BookOpen size={18} />
        <span className="font-medium text-sm">Dashboard</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="text-gray-400 hover:text-gray-600 transition relative p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E1502E] rounded-full border-2 border-[#F4F4F5]"></span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-[#E1502E] font-semibold hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-pointer">
                    <p className={`text-sm ${!notif.read && unreadCount > 0 ? 'font-bold text-black' : 'font-medium text-gray-600'}`}>
                      {notif.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Link */}
        <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="user" />
          </div>
          <span className="text-sm font-semibold hidden sm:inline-block">John Doe</span>
        </Link>
      </div>
    </header>
  );
}