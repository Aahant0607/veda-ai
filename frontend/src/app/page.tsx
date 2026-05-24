'use client';

import { Search, MoreVertical, Plus, Filter, FileX, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import EmptyState from '@/components/EmptyState';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type FilterOption = 'latest' | 'oldest' | 'alphabetical' | 'pending' | 'submitted';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'pending' | 'processing' | 'completed' | 'submitted' | 'failed';
  createdAt: string;
  dueDate: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted:  { label: 'Submitted',     color: 'bg-green-100  text-green-700'  },
  completed:  { label: 'Pending',       color: 'bg-yellow-100 text-yellow-700' }, 
  processing: { label: 'Generating...', color: 'bg-blue-100   text-blue-700'   },
  pending:    { label: 'In Queue',      color: 'bg-gray-100   text-gray-600'   },
  failed:     { label: 'Not Generated', color: 'bg-red-100    text-red-600'    },
};

export default function DashboardPage() {
  const [assignments,    setAssignments]   = useState<Assignment[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [searchQuery,    setSearchQuery]   = useState('');
  const [activeFilter,   setActiveFilter]  = useState<FilterOption>('latest');
  const [filterOpen,     setFilterOpen]    = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/assignments`);
      setAssignments(res.data || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      const menu = document.getElementById(`menu-${openMenuIndex}`);
      if (menu && !menu.contains(e.target as Node)) setOpenMenuIndex(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuIndex]);

  const submit = async (id: string) => {
    setAssignments(prev => prev.map(a => a._id === id ? { ...a, status: 'submitted' } : a));
    setOpenMenuIndex(null);
    window.dispatchEvent(new Event('assignmentSubmitted'));
    
    try {
      await axios.patch(`${API_URL}/api/assignments/${id}`, { status: 'submitted' });
    } catch (error) {
      console.error("Failed to sync submission with backend", error);
    }
  };

  const filterLabels: Record<FilterOption, string> = {
    latest: 'Latest', oldest: 'Oldest', alphabetical: 'Alphabetical', pending: 'Pending', submitted: 'Submitted'
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    } catch { return iso; }
  };

  const filtered = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase(); 
    
    let result = assignments.filter(a => a.status !== 'failed');
    
    result = result.filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.subject.toLowerCase().includes(lowerQuery)
    );
    
    if (activeFilter === 'pending') {
      result = result.filter(a => ['completed', 'pending', 'processing'].includes(a.status));
    } else if (activeFilter === 'submitted') {
      result = result.filter(a => a.status === 'submitted');
    }
    
    result.sort((a, b) => {
      if (activeFilter === 'alphabetical') return a.title.localeCompare(b.title);
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return activeFilter === 'oldest' ? da - db : db - da; 
    });
    
    return result;
  }, [assignments, searchQuery, activeFilter]);

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500' };
    return (
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const CardMenu = ({ item, index }: { item: Assignment; index: number }) => (
    <div id={`menu-${index}`} className="relative shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}
        className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      {openMenuIndex === index && (
        <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 w-44 py-1">
          
          {item.status === 'completed' && (
            <>
              <Link href={`/output/${item._id}`}
                className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setOpenMenuIndex(null)}>
                View Assignment
              </Link>
              <button
                onClick={() => submit(item._id)}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50">
                Submit
              </button>
            </>
          )}

          {item.status !== 'completed' && (
            <>
              {item.status === 'submitted' && (
                 <Link href={`/output/${item._id}`}
                 className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                 onClick={() => setOpenMenuIndex(null)}>
                 View Assignment
               </Link>
              )}
              <button
                onClick={() => { setAssignments(p => p.filter(a => a._id !== item._id)); setOpenMenuIndex(null); }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-[70vh]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Assignments</h1>
          <p className="text-gray-500 text-sm">Manage and create assignments for your classes.</p>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="relative" ref={filterRef}>
            <button onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-black bg-white px-3 py-2 rounded-xl shadow-sm">
              <Filter size={14} />
              <span className="hidden sm:inline">Filter By</span>
              <span className="text-[#E1502E] font-bold">{filterLabels[activeFilter]}</span>
              <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-10 left-0 z-20 bg-white rounded-2xl shadow-lg border border-gray-100 w-40 py-1">
                {(Object.keys(filterLabels) as FilterOption[]).map(opt => (
                  <button key={opt} onClick={() => { setActiveFilter(opt); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold ${
                      activeFilter === opt ? 'text-[#E1502E] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {filterLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search Assignment"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none rounded-full py-2 pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100" />
          </div>
        </div>
      )}

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
          <p className="text-gray-500 text-sm mt-1">Adjust filters or search term to see more.</p>
          <button onClick={() => {setSearchQuery(''); setActiveFilter('latest')}} className="mt-4 text-[#E1502E] text-sm font-semibold hover:underline">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-10">
            {filtered.map((item, index) => (
              <div key={item._id}
                className="relative bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between h-44 group">
                <div className="flex justify-between items-start">
                  <Link href={item.status === 'completed' || item.status === 'submitted' ? `/output/${item._id}` : '#'} className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-[#E1502E] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{item.subject} • Grade {item.grade}</p>
                  </Link>
                  <CardMenu item={item} index={index} />
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xs font-semibold text-gray-500 space-y-0.5">
                    <p>Assigned on: {formatDate(item.createdAt)}</p>
                    <p>Due: {formatDate(item.dueDate)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex sm:hidden flex-col gap-0 mb-6 bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <div key={item._id} className="relative flex items-center justify-between px-4 py-4 hover:bg-gray-50 group">
                <Link href={item.status === 'completed' || item.status === 'submitted' ? `/output/${item._id}` : '#'} className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-sm group-hover:text-[#E1502E] transition-colors truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subject} • Grade {item.grade}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-gray-400">Due: {formatDate(item.dueDate)}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
                <CardMenu item={item} index={index} />
              </div>
            ))}
          </div>

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
