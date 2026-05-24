'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100  text-amber-700  border-amber-200',
  hard:   'bg-red-100    text-red-700    border-red-200',
};

interface Question {
  id:         string;
  text:       string;
  type:       string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks:      number;
  options?:   string[];
  answer?:    string;
}

interface Section {
  name:       string;
  title:      string;
  instruction:string;
  totalMarks: number;
  questions:  Question[];
}

interface Paper {
  examTitle:  string;
  subject:    string;
  grade:      string;
  duration:   string;
  totalMarks: number;
  dueDate:    string;
  sections:   Section[];
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
    const load = async () => {
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
    load();
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
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      <div className="bg-white rounded-none sm:rounded-xl shadow-sm p-6 sm:p-16 text-black print:p-0 print:shadow-none">

        {/* ── Header ── */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">{paper.examTitle}</h1>
          <h2 className="text-lg font-bold mt-2">Subject: {paper.subject}</h2>
          <p className="text-sm font-semibold mt-1">Class: {paper.grade}</p>
          <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm font-semibold gap-2">
            <span>Time Allowed: {paper.duration}</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>
        </div>

        {/* ── Instructions ── */}
        <p className="text-sm font-bold italic mb-6">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* ── Student fields ── */}
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

        {/* ════════════════════════════════════════
            ALL QUESTIONS — section by section
        ════════════════════════════════════════ */}
        <div className="space-y-10 mb-8">
          {paper.sections.map((section) => (
            <div key={section.name}>
              {/* Section header */}
              <div className="text-center font-bold text-lg mb-1 underline">
                {section.name}
              </div>
              <p className="font-bold text-sm text-center mb-1">{section.title}</p>
              <p className="italic text-gray-600 text-sm mb-5 border-l-4 border-gray-200 pl-3">
                {section.instruction}
              </p>

              {/* Questions */}
              <div className="space-y-5">
                {section.questions.map((q, qi) => (
                  <div key={q.id} className="flex gap-3">
                    <span className="text-gray-500 font-bold min-w-[32px] text-sm pt-0.5">
                      Q{qi + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed font-medium">{q.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${DIFF_BADGE[q.difficulty] || DIFF_BADGE.medium}`}>
                            {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                            [{q.marks}M]
                          </span>
                        </div>
                      </div>

                      {/* MCQ options */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className="text-sm text-gray-700">
                              <span className="text-gray-400 font-semibold">
                                ({String.fromCharCode(65 + oi)})
                              </span> {opt}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === 'True/False' && !q.options && (
                        <div className="mt-2 flex gap-6 text-sm text-gray-600">
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`tf-${q.id}`} /> True
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`tf-${q.id}`} /> False
                          </label>
                        </div>
                      )}

                      {/* Answer lines */}
                      {!q.options && q.type !== 'True/False' && (
                        <div className="mt-3 space-y-2">
                          {Array.from({ length: q.marks > 3 ? 5 : 3 }).map((_, li) => (
                            <div key={li} className="border-b border-gray-200 h-6" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-right text-xs text-gray-400 mt-4 font-semibold">
                [{section.totalMarks} Marks]
              </p>
            </div>
          ))}
        </div>

        {/* End of paper */}
        <div className="text-center font-bold border-t border-gray-200 pt-6 text-sm">
          *** End of Question Paper ***
        </div>

        {/* ════════════════════════════════════════
            ALL ANSWERS — after all questions
        ════════════════════════════════════════ */}
        <div className="print:break-before-page border-t-2 border-black pt-10 mt-12">
          <h3 className="font-bold text-xl mb-8 underline text-center tracking-wide">
            Answer Key
          </h3>

          {/* Flat numbered list across all sections */}
          {(() => {
            // Flatten all questions from all sections into one list
            const allQA: { q: Question; sectionName: string; sectionTitle: string; globalIndex: number }[] = [];
            let globalIndex = 1;
            paper.sections.forEach(section => {
              section.questions.forEach(q => {
                allQA.push({
                  q,
                  sectionName:  section.name,
                  sectionTitle: section.title,
                  globalIndex:  globalIndex++,
                });
              });
            });

            // Group by section for display
            let currentSection = '';
            return allQA.map(({ q, sectionName, sectionTitle, globalIndex }) => (
              <div key={`ans-${q.id}`}>
                {/* Section divider */}
                {sectionName !== currentSection && (() => {
                  currentSection = sectionName;
                  return (
                    <h4 className="font-bold text-sm mb-3 mt-6 bg-gray-50 px-4 py-2 rounded-xl first:mt-0">
                      {sectionName} — {sectionTitle}
                    </h4>
                  );
                })()}

                <div className="flex gap-3 mb-4 pl-2">
                  <span className="font-bold text-sm text-gray-500 min-w-[32px]">
                    {globalIndex}.
                  </span>
                  <div className="flex-1">
                    {/* Question for context */}
                    <p className="text-xs text-gray-400 italic mb-1">{q.text}</p>

                    {/* Answer */}
                    <p className="text-sm font-semibold text-gray-800">
                      {q.answer
                        ? q.answer
                        : q.type === 'True/False'
                        ? 'True / False (refer to textbook)'
                        : q.options && q.options.length > 0
                        ? `Correct Option: ${q.options[0]}`
                        : 'Refer to textbook for detailed answer.'}
                    </p>

                    {/* MCQ — highlight correct option */}
                    {q.type === 'MCQ' && q.options && q.answer && (
                      <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-gray-400">
                        {q.options.map((opt, oi) => (
                          <p key={oi} className={opt === q.answer ? 'text-green-700 font-bold' : ''}>
                            ({String.fromCharCode(65 + oi)}) {opt}
                            {opt === q.answer ? ' ✓' : ''}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 font-medium">[{q.marks}M]</span>
                </div>
              </div>
            ));
          })()}
        </div>

      </div>
    </div>
  );
}
