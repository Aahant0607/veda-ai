'use client';

import { Search, MoreVertical, Plus, Filter, FileX, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import EmptyState from '@/components/EmptyState';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veda-ai-backend-img7.onrender.com';

// Standard headers to prevent caching issues
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

  const deleteAssignment = async (id: string) => {
    const originalAssignments = [...assignments];
    // 1. Optimistic Update
    setAssignments(prev => prev.filter(a => a._id !== id));
    setOpenMenuIndex(null);
    
    try {
      // 2. Perform Delete
      await axios.delete(`${API_URL}/api/assignments/${id}`, axiosConfig);
      window.dispatchEvent(new Event('assignmentSubmitted'));
      // 3. Final Sync
      await fetchAssignments();
    } catch (error) {
      // 4. Rollback if server fails
      setAssignments(originalAssignments);
      console.error("Failed to delete from database", error);
    }
  };

  // ... [Keep your filterLabels, formatDate, filtered, StatusBadge, and CardMenu as they were]

  // IMPORTANT: Ensure your component returns the JSX with these functions correctly linked to buttons
  // (The rest of your component structure remains the same)

  // ... [Return statement]
  return (
    // ... (Your existing JSX structure)
  );
}
