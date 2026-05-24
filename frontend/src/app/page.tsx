'use client';

import { Search, MoreVertical, Plus, Filter, FileX, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
type SortOption = 'latest' | 'oldest' | 'alphabetical';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  dueDate: string;
}

export default function DashboardPage() {
  const [assignments,    setAssignments]    = useState<Assignment[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [sortBy,         setSortBy]         = useState<SortOption>('latest');
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [openMenuIndex,  setOpenMenuIndex]  = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Fetch real assignments from backend ──────────────────────────
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  // ── Close dropdowns on outside click ────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      const menu = document.getElementById(`menu-${openMenuIndex}`);
      if (menu && !menu.contains(e.target as Node)) setOpenMenuIndex(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuIndex]);

  const sortLabels: Record<SortOption, string> = {
    latest: 'Latest', oldest: 'Oldest', alphabetical: 'Alphabetical',
  };

  // ── Format date ──────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    } catch { return iso; }
  };

  // ── Filter + sort ────────────────────────────────────────────────
  const filtered = assignments
    .filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy === 'latest' ? db - da : da - db;
    });

  // ── Status badge ─────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed:  'bg-green-100 text-green-700',
      processing: 'bg-blue-100 text-blue-700',
      pending:    'bg-yellow-100 text-yellow-700',
      failed:     'bg-red-100 text-red-600',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-500'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-[70vh]">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Assignments</h1>
          <p className="text-gray-500 text-sm">Manage and create assignments for your classes.</p>
        </div>
        <button
          onClick={fetchAssignments}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border bg-orange-50 text-[#E1502E] border-orange-100 hover:bg-orange-100 transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      {assignments.length > 0 && (
        <div className="flex justify-between items-center mb-6 gap-3">
          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-black transition-colors bg-white px-3 py-2 rounded-xl shadow-sm"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filter By</span>
              <span className="text-[#E1502E] font-bold">{sortLabels[sortBy]}</span>
              <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-10 left-0 z-20 bg-white rounded-2xl shadow-lg border border-gray-100 w-40 py-1">
                {(['latest', 'oldest', 'alphabetical'] as SortOption[]).map(opt => (
                  <button key={opt} onClick={() => { setSortBy(opt); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      sortBy === opt ? 'text-[#E1502E] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {sortLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search Assignment"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none rounded-full py-2 pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100" />
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#E1502E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading assignments...</p>
          </div>
        </div>

      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<FileX size={40} className="text-red-400" />}
          title="No assignments yet"
          description="Create your first assignment to start generating AI-powered question papers."
          buttonText="Create Your First Assignment"
          buttonLink="/create"
        />

      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold">No matches found</h3>
          <p className="text-gray-500 text-sm mt-1">No assignments matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-[#E1502E] text-sm font-semibold hover:underline">
            Clear Search
          </button>
        </div>

      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-10">
            {filtered.map((item, index) => (
              <div key={item._id} className="relative bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between h-44 group">
                <div className="flex justify-between items-start">
                  <Link href={item.status === 'completed' ? `/output/${item._id}` : '#'} className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-[#E1502E] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{item.subject} • Grade {item.grade}</p>
                  </Link>
                  <div id={`menu-${index}`} className="relative ml-2">
                    <button onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                      className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                    {openMenuIndex === index && (
                      <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 w-40 py-1">
                        {item.status === 'completed' && (
                          <Link href={`/output/${item._id}`}
                            className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenMenuIndex(null)}>
                            View Assignment
                          </Link>
                        )}
                        <button onClick={() => { setAssignments(p => p.filter(a => a._id !== item._id)); setOpenMenuIndex(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500 space-y-0.5">
                    <p>Assigned on: {formatDate(item.createdAt)}</p>
                    <p>Due: {formatDate(item.dueDate)}</p>
                  </div>
                  {statusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile list */}
          <div className="flex sm:hidden flex-col gap-0 mb-6 bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <div key={item._id} className="relative flex items-center justify-between px-4 py-4 hover:bg-gray-50 group">
                <Link href={item.status === 'completed' ? `/output/${item._id}` : '#'} className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-sm group-hover:text-[#E1502E] transition-colors truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subject} • Grade {item.grade}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-400">Due: {formatDate(item.dueDate)}</p>
                    {statusBadge(item.status)}
                  </div>
                </Link>
                <div id={`menu-mobile-${index}`} className="relative shrink-0">
                  <button onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                    className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100">
                    <MoreVertical size={18} />
                  </button>
                  {openMenuIndex === index && (
                    <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 w-40 py-1">
                      {item.status === 'completed' && (
                        <Link href={`/output/${item._id}`}
                          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenMenuIndex(null)}>
                          View Assignment
                        </Link>
                      )}
                      <button onClick={() => { setAssignments(p => p.filter(a => a._id !== item._id)); setOpenMenuIndex(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create button */}
          <div className="mt-auto pb-4 flex justify-center">
            <Link href="/create"
              className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:scale-105 transition-transform">
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
