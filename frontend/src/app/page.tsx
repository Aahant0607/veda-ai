'use client';

import { Search, MoreVertical, Plus, Filter, FileX, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import EmptyState from '@/components/EmptyState';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veda-ai-backend-img7.onrender.com';

// Standard headers to prevent caching issues across all requests
const axiosConfig = {
  headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
};

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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('latest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/assignments`, axiosConfig);
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
    const originalAssignments = [...assignments];
    setAssignments(prev => prev.map(a => a._id === id ? { ...a, status: 'submitted' } : a));
    setOpenMenuIndex(null);
    
    try {
      await axios.patch(`${API_URL}/api/assignments/${id}`, { status: 'submitted' }, axiosConfig);
      window.dispatchEvent(new Event('assignmentSubmitted'));
    } catch (error) {
      setAssignments(originalAssignments);
      console.error("Failed to sync submission", error);
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
          {item.status === 'submitted' && (
            <Link href={`/output/${item._id}`}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => setOpenMenuIndex(null)}>
              View Assignment
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-[70vh]">
      {/* ... [Rest of your UI remains exactly as you had it] ... */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Assignments</h1>
          <p className="text-gray-500 text-sm">Manage and create assignments for your classes.</p>
        </div>
      </div>
      {/* ... [Remaining content] ... */}
    </div>
  );
}
