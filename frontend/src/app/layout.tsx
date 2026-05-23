import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'VedaAI – Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F4F4F5] min-h-screen font-sans text-gray-800">

        {/* ── DESKTOP lg+ : Sidebar left, content right ── */}
        <div className="hidden lg:flex flex-row min-h-screen p-4 gap-6">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <Header />
            <div className="flex-1 mt-2">
              {children}
            </div>
          </main>
        </div>

        {/* ── MOBILE below lg : Header top, content middle, BottomNav fixed ── */}
        <div className="flex lg:hidden flex-col min-h-screen">
          <div className="px-4 pt-4">
            <Header />
          </div>
          {/* pb-24 so content never hides behind the fixed bottom nav */}
          <main className="flex-1 px-4 pb-24 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>

      </body>
    </html>
  );
}