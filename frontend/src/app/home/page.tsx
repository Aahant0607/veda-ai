import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-500">Here is what is happening in your classes today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Clickable Assignments Card */}
        <Link href="/" className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gray-200 border border-transparent transition cursor-pointer group">
          <div className="bg-orange-100 p-4 rounded-full text-[#E1502E] group-hover:scale-110 transition"><BookOpen size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Assignments</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </Link>
        
        {/* Clickable Groups Card */}
        <Link href="/groups" className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gray-200 border border-transparent transition cursor-pointer group">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:scale-110 transition"><Users size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Active Groups</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </Link>
        
        {/* Clickable Grading Card (Routes to Assignments for now) */}
        <Link href="/" className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gray-200 border border-transparent transition cursor-pointer group">
          <div className="bg-green-100 p-4 rounded-full text-green-600 group-hover:scale-110 transition"><Clock size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Pending Grading</p>
            <p className="text-2xl font-bold">45</p>
          </div>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden border border-gray-50">
        {[1, 2, 3].map((_, i) => (
          <Link href="/output/test-id-0" key={i} className="flex items-center justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition block">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-[#E1502E] rounded-full"></div>
              <div>
                <p className="font-bold text-sm">Quiz on Electricity Generated</p>
                <p className="text-xs text-gray-500">Assigned to Class 5th • 2 hours ago</p>
              </div>
            </div>
            <div className="text-gray-400"><ArrowRight size={16} /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}