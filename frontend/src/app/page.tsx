'use client';

import { Search, MoreVertical, Plus, Filter, FileX, RefreshCw, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';

type SortOption = 'latest' | 'oldest' | 'alphabetical';

export default function DashboardPage() {
  const mockData = [
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '12-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '23-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '17-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '25-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '13-06-2025', dueDate: '21-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '27-06-2025' },
    { title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  ];

  const [assignments, setAssignments] = useState(mockData);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuIndex(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sortLabels: Record<SortOption, string> = {
    latest: 'Latest',
    oldest: 'Oldest',
    alphabetical: 'Alphabetical',
  };

  // Filter + sort pipeline
  const filteredAssignments = assignments
    .filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      const parseDate = (d: string) => {
        const [day, month, year] = d.split('-').map(Number);
        return new Date(year, month - 1, day).getTime();
      };
      if (sortBy === 'latest') return parseDate(b.assignedDate) - parseDate(a.assignedDate);
      if (sortBy === 'oldest') return parseDate(a.assignedDate) - parseDate(b.assignedDate);
      return 0;
    });

  const handleDelete = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
    setOpenMenuIndex(null);
  };

  const triggerEmptyStateDemo = () => {
    if (isDemoActive) return;
    setAssignments([]);
    setIsDemoActive(true);
    setSearchQuery('');
    setTimeout(() => {
      setAssignments(mockData);
      setIsDemoActive(false);
    }, 3500);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full min-h-[70vh]">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Assignments</h1>
          <p className="text-gray-500 text-sm">Manage and create assignments for your classes.</p>
        </div>
        <button
          onClick={triggerEmptyStateDemo}
          disabled={isDemoActive}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition shadow-sm ${
            isDemoActive
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-orange-50 text-[#E1502E] border-orange-100 hover:bg-orange-100'
          }`}
        >
          <RefreshCw size={14} className={isDemoActive ? 'animate-spin' : ''} />
          {isDemoActive ? 'Restoring data...' : 'Toggle Empty State (Demo)'}
        </button>
      </div>

      {/* Toolbar */}
      {assignments.length > 0 && (
        <div className="flex justify-between items-center mb-6">

          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
            >
              <Filter size={16} />
              Filter By
              <span className="text-[#E1502E] font-bold">{sortLabels[sortBy]}</span>
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterOpen && (
              <div className="absolute top-9 left-0 z-20 bg-white rounded-2xl shadow-lg border border-gray-100 w-44 py-1 overflow-hidden">
                {(['latest', 'oldest', 'alphabetical'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      sortBy === opt ? 'text-[#E1502E] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {sortLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none rounded-full py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            />
          </div>
        </div>
      )}

      {/* Conditional rendering */}
      {assignments.length === 0 ? (
        <EmptyState
          icon={<FileX size={40} className="text-red-400" />}
          title="No assignments yet"
          description="Create your first assignment to start collecting and grading student submissions."
          buttonText="Create Your First Assignment"
          buttonLink="/create"
        />
      ) : filteredAssignments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold">No matches found</h3>
          <p className="text-gray-500 text-sm mt-1">We couldn't find any assignments matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-[#E1502E] text-sm font-semibold hover:underline">
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {filteredAssignments.map((item, index) => (
              <div key={index} className="relative bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between h-40 group">

                <div className="flex justify-between items-start">
                  <Link href={`/output/test-id-${index}`} className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-[#E1502E] transition-colors">{item.title}</h3>
                  </Link>

                  {/* ⋮ Context menu */}
                  <div className="relative" ref={openMenuIndex === index ? menuRef : undefined}>
                    <button
                      className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuIndex === index && (
                      <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 w-40 py-1 overflow-hidden">
                        <Link
                          href={`/output/test-id-${index}`}
                          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenMenuIndex(null)}
                        >
                          View Assignment
                        </Link>
                        <button
                          onClick={() => handleDelete(index)}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/output/test-id-${index}`} className="flex items-center gap-6 text-xs font-semibold text-gray-500">
                  <span>Assigned on: {item.assignedDate}</span>
                  <span>Due: {item.dueDate}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Floating Create Button */}
          <div className="mt-auto pb-4 flex justify-center">
            <Link
              href="/create"
              className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <div className="bg-white text-black rounded-full p-0.5">
                <Plus size={14} strokeWidth={3} />
              </div>
              Create Assignment
            </Link>
          </div>
        </>
      )}
    </div>
  );
}