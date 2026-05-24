'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Printer, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100  text-amber-700',
  hard:   'bg-red-100    text-red-700',
};

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

interface Section {
  name: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

interface Paper {
  examTitle: string;
  subject: string;
  grade: string;
  duration: string;
  totalMarks: number;
  dueDate: string;
  sections: Section[];
}

export default function OutputPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [paper,   setPaper]   = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) { router.push('/create'); return; }

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/assignments/${id}/paper`);
        setPaper(res.data.paper);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load paper.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-gray-400 mb-4" size={36} />
      <p className="text-sm font-semibold text-gray-500">Loading your question paper...</p>
    </div>
  );

  if (error || !paper) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <p className="text-sm font-semibold text-red-500 mb-4">{error || 'Paper not found'}</p>
      <button onClick={() => router.push('/create')}
        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold">
        Create New Assignment
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* Action bar */}
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button onClick={() => router.push('/create')}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} /> New Paper
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
          <Printer size={16} /> Print
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors">
          <Download size={16} /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-none sm:rounded-xl shadow-sm p-6 sm:p-16 text-black print:p-0 print:shadow-none min-h-[1056px]">

        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">{paper.examTitle}</h1>
          <h2 className="text-lg font-bold mt-2">Subject: {paper.subject}</h2>
          <p className="text-sm font-semibold mt-1">Class: {paper.grade}</p>
          <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm font-semibold gap-2">
            <span>Time Allowed: {paper.duration}</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm font-bold italic mb-6">All questions are compulsory unless stated otherwise.</p>

        {/* Student fields */}
        <div className="space-y-3 mb-10 text-sm font-semibold">
          {['Name', 'Roll Number'].map(f => (
            <div key={f} className="flex gap-2">
              <span className="w-28">{f}:</span>
              <div className="border-b border-black flex-1 max-w-xs" />
            </div>
          ))}
          <div className="flex gap-2">
            <span className="w-28">Class: {paper.grade}</span>
            <span className="ml-4">Section:</span>
            <div className="border-b border-black w-24" />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10 mb-16">
          {paper.sections.map((section) => (
            <div key={section.name}>
              <div className="text-center font-bold text-lg mb-2 underline">{section.name}</div>
              <p className="font-bold text-sm mb-1">{section.title}</p>
              <p className="italic text-gray-600 text-sm mb-4">{section.instruction}</p>
              <div className="space-y-4">
                {section.questions.map((q, qi) => (
                  <div key={q.id} className="flex gap-3">
                    <span className="text-gray-500 font-bold min-w-[28px] text-sm">Q{qi + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed">{q.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${DIFF_BADGE[q.difficulty] || DIFF_BADGE.medium}`}>
                            {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">[{q.marks}M]</span>
                        </div>
                      </div>

                      {/* MCQ options */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className="text-sm text-gray-700">
                              <span className="text-gray-400">({String.fromCharCode(65 + oi)})</span> {opt}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === 'True/False' && (
                        <div className="mt-2 flex gap-6 text-sm text-gray-600">
                          <label className="flex items-center gap-2"><input type="radio" name={`tf-${q.id}`} /> True</label>
                          <label className="flex items-center gap-2"><input type="radio" name={`tf-${q.id}`} /> False</label>
                        </div>
                      )}

                      {/* Answer lines */}
                      {!q.options && q.type !== 'True/False' && (
                        <div className="mt-2 space-y-2">
                          {Array.from({ length: q.marks > 2 ? 4 : 2 }).map((_, li) => (
                            <div key={li} className="border-b border-gray-200 h-6" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-right text-xs text-gray-400 mt-3 font-semibold">
                [{section.totalMarks} Marks]
              </p>
            </div>
          ))}
        </div>

        <div className="text-center font-bold border-t border-gray-200 pt-6 text-sm">
          *** End of Question Paper ***
        </div>
      </div>
    </div>
  );
}
