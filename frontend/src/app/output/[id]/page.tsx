'use client';

import { useEffect, useState } from 'react';
import { Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Types ────────────────────────────────────────────────────────
interface Question {
  id?: string;
  type: string;
  difficulty?: string;
  questionText: string;
  marks: number;
  answer: string;
}

interface AssignmentData {
  id: string;
  schoolName?: string;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  timeAllowed?: string;
  questions: Question[];
}

export default function OutputPage() {
  const router = useRouter();
  const { currentAssignmentId } = useStore();
  
  const [data, setData] = useState<AssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Fetch Assignment Data ───────────────────────────────────────
  useEffect(() => {
    if (!currentAssignmentId) {
      router.push('/'); // Redirect to create page if no ID is found
      return;
    }

    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/assignments/${currentAssignmentId}`);
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to fetch assignment:', err);
        setError(err.response?.data?.error || 'Failed to load the assignment.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [currentAssignmentId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-semibold">Loading your generated paper...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-sm font-semibold">{error || 'Assignment not found'}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Group questions by type to create sections automatically
  const groupedQuestions = data.questions.reduce((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const sections = Object.entries(groupedQuestions);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} /> Print
        </button>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors">
          <Download size={16} /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-none sm:rounded-xl shadow-sm p-6 sm:p-16 text-black print:p-0 print:shadow-none min-h-[1056px]">

        {/* Document Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
            {data.schoolName || 'Your School Name'}
          </h1>
          <h2 className="text-lg font-bold mt-2">Subject: {data.subject}</h2>
          <p className="text-sm font-semibold mt-1">Class: {data.grade}</p>
          <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm font-semibold gap-2 sm:gap-0">
            <span>Time Allowed: {data.timeAllowed || 'As instructed'}</span>
            <span>Maximum Marks: {data.totalMarks}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-sm font-bold italic">All questions are compulsory unless stated otherwise.</p>
        </div>

        {/* Student Detail Fields */}
        <div className="space-y-3 mb-10 text-sm font-semibold">
          <div className="flex gap-2">
            <span className="w-28">Name:</span>
            <div className="border-b border-black flex-1 max-w-xs"></div>
          </div>
          <div className="flex gap-2">
            <span className="w-28">Roll Number:</span>
            <div className="border-b border-black flex-1 max-w-xs"></div>
          </div>
          <div className="flex gap-2">
            <span className="w-28">Class: {data.grade}</span>
            <span className="ml-4">Section:</span>
            <div className="border-b border-black w-24"></div>
          </div>
        </div>

        {/* Sections & Questions */}
        <div className="mb-16">
          {sections.map(([type, questions], index) => {
            const sectionLetter = String.fromCharCode(65 + index); // A, B, C...
            
            return (
              <div key={type} className="mb-10">
                <div className="text-center font-bold text-lg mb-6 underline">
                  Section {sectionLetter}
                </div>
                <div className="space-y-6 text-sm">
                  <p className="font-bold">{type}</p>
                  <p className="italic text-gray-700">Attempt all questions in this section.</p>
                  <ol className="list-decimal pl-5 space-y-4 font-medium">
                    {questions.map((q, qIndex) => (
                      <li key={qIndex} className="leading-relaxed">
                        {q.difficulty && (
                          <span className="mr-1 text-gray-600">[{q.difficulty}]</span>
                        )}
                        {q.questionText}
                        <span className="ml-2 whitespace-nowrap">[{q.marks} Marks]</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}

          <div className="text-center font-bold mt-10 pt-10 border-t border-gray-300">
            End of Question Paper
          </div>
        </div>

        {/* Answer Key */}
        <div className="print:break-before-page border-t-2 border-black pt-10">
          <h3 className="font-bold text-lg mb-6 underline">Answer Key:</h3>
          
          {sections.map(([type, questions], index) => (
            <div key={`ans-${type}`} className="mb-8">
              <h4 className="font-bold text-md mb-4">Section {String.fromCharCode(65 + index)} - {type}</h4>
              <ol className="list-decimal pl-5 space-y-6 text-sm font-medium text-gray-800">
                {questions.map((q, qIndex) => (
                  <li key={`ans-item-${qIndex}`}>
                    <div className="leading-relaxed whitespace-pre-wrap">
                      {q.answer}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
