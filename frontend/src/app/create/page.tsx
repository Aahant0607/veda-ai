'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Plus, ChevronLeft, ChevronRight, X, Loader2, FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useStore } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEFAULT_QUESTION_TYPES = [
  { type: 'Multiple Choice Questions', key: 'MCQ',          questions: 5, marks: 1 },
  { type: 'Short Questions',           key: 'Short Answer', questions: 5, marks: 2 },
];

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────────
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [dueDate,      setDueDate]        = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [questionTypes, setQuestionTypes] = useState(DEFAULT_QUESTION_TYPES);
  const [isDragging,   setIsDragging]     = useState(false);
  const [errors,       setErrors]         = useState<Record<string, string>>({});

  // ── Submission state ────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitError,  setSubmitError]    = useState('');

  // ── Zustand + WebSocket ─────────────────────────────────────────
  const { setAssignmentId, setJobStatus, currentAssignmentId, jobStatus, progress } = useStore();
  useWebSocket(currentAssignmentId);

  // ── Derived totals ───────────────────────────────────────────────
  const totalQuestions = questionTypes.reduce((s, t) => s + Number(t.questions), 0);
  const totalMarks     = questionTypes.reduce((s, t) => s + Number(t.questions) * Number(t.marks), 0);

  // ── File handling ────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    if (!['application/pdf', 'text/plain', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only PDF, TXT, JPEG, PNG allowed'); return;
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Question type helpers ────────────────────────────────────────
  const updateQuestionType = (index: number, field: 'questions' | 'marks', value: string) => {
    setQuestionTypes(prev => prev.map((t, i) =>
      i === index ? { ...t, [field]: Math.max(0, Number(value)) } : t
    ));
  };

  const removeQuestionType = (index: number) => {
    setQuestionTypes(prev => prev.filter((_, i) => i !== index));
  };

  const addQuestionType = () => {
    setQuestionTypes(prev => [...prev, {
      type: 'Essay Questions', key: 'Long Answer', questions: 2, marks: 5
    }]);
  };

  // ── Validation ───────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!dueDate)              e.dueDate       = 'Due date is required';
    if (new Date(dueDate) < new Date()) e.dueDate = 'Due date must be in the future';
    if (questionTypes.length === 0) e.types    = 'Add at least one question type';
    if (totalQuestions < 1)    e.questions     = 'Total questions must be at least 1';
    if (totalMarks < 1)        e.marks         = 'Total marks must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const fd = new FormData();
      fd.append('title',          'Assignment');
      fd.append('subject',        'General');
      fd.append('grade',          '10');
      fd.append('dueDate',        dueDate);
      fd.append('totalQuestions', String(totalQuestions));
      fd.append('totalMarks',     String(totalMarks));
      if (additionalInfo) fd.append('additionalInstructions', additionalInfo);
      questionTypes.forEach(t => fd.append('questionTypes', t.key));
      if (uploadedFile) fd.append('file', uploadedFile);

      const res = await axios.post(`${API_URL}/api/assignments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAssignmentId(res.data.assignmentId);
      setJobStatus('pending', 0);
      // WebSocket will auto-navigate when done

    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to generate. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ── Progress status text ─────────────────────────────────────────
  const statusText: Record<string, string> = {
    pending:    'Queuing your request...',
    processing: 'Gemini AI is generating your paper...',
    completed:  'Done! Opening your paper...',
    failed:     'Generation failed. Please try again.',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Create Assignment</h1>
        <p className="text-gray-500 text-sm">Set up a new assignment for your students.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-10">
        <h2 className="text-lg font-bold text-center mb-1">Assignment Details</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Basic information about your assignment</p>

        {/* ── File Upload ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploadedFile && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center mb-8 transition-colors ${
            isDragging
              ? 'border-black bg-gray-100 cursor-copy'
              : uploadedFile
              ? 'border-green-300 bg-green-50 cursor-default'
              : 'border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.jpeg,.jpg,.png"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />

          {uploadedFile ? (
            <>
              <FileText className="text-green-500 mb-3" size={32} />
              <p className="text-sm font-semibold text-green-700 mb-1">{uploadedFile.name}</p>
              <p className="text-xs text-gray-400 mb-3">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline"
              >
                <X size={12} /> Remove file
              </button>
            </>
          ) : (
            <>
              <UploadCloud className="text-gray-400 mb-3" size={32} />
              <p className="text-sm font-semibold mb-1">Choose a file or drag & drop it here</p>
              <p className="text-xs text-gray-400 mb-4">JPEG, PNG, PDF, TXT — up to 10MB</p>
              <button className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">
                Browse File
              </button>
            </>
          )}
        </div>

        <div className="space-y-6">

          {/* ── Due Date ── */}
          <div>
            <label className="block text-sm font-semibold mb-2">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); setErrors(p => ({ ...p, dueDate: '' })); }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* ── Question Types ── */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Question Type *</label>
              <div className="flex gap-8 text-xs font-semibold text-gray-500 pr-2">
                <span>No. of Questions</span>
                <span>Marks each</span>
              </div>
            </div>

            <div className="space-y-3">
              {questionTypes.map((qt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm font-medium text-gray-700">
                    {qt.type}
                  </div>
                  <button
                    onClick={() => removeQuestionType(i)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                  <input
                    type="number"
                    value={qt.questions}
                    min={1}
                    onChange={(e) => updateQuestionType(i, 'questions', e.target.value)}
                    className="w-20 border border-gray-200 rounded-xl px-3 py-3 text-sm text-center outline-none focus:border-gray-400"
                  />
                  <input
                    type="number"
                    value={qt.marks}
                    min={1}
                    onChange={(e) => updateQuestionType(i, 'marks', e.target.value)}
                    className="w-20 border border-gray-200 rounded-xl px-3 py-3 text-sm text-center outline-none focus:border-gray-400"
                  />
                </div>
              ))}
            </div>

            {errors.types    && <p className="text-red-500 text-xs mt-1">{errors.types}</p>}
            {errors.questions && <p className="text-red-500 text-xs mt-1">{errors.questions}</p>}

            <button
              onClick={addQuestionType}
              className="flex items-center gap-2 text-sm font-semibold mt-4 text-gray-700 hover:text-black transition-colors"
            >
              <div className="bg-black text-white rounded-full p-0.5"><Plus size={14} /></div>
              Add Question Type
            </button>
          </div>

          {/* ── Totals ── */}
          <div className="flex justify-end gap-10 text-xs font-bold text-gray-700 pb-4 border-b border-gray-100">
            <div className="flex flex-col gap-1 text-right">
              <span>Total Questions: <span className="text-black">{totalQuestions}</span></span>
              <span>Total Marks: <span className="text-black">{totalMarks}</span></span>
            </div>
          </div>

          {/* ── Additional Info ── */}
          <div>
            <label className="block text-sm font-semibold mb-2">Additional Information</label>
            <textarea
              rows={4}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Focus on chapters 3–5, include real-world examples, avoid repetition..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors resize-none"
            />
          </div>

          {/* ── Error message ── */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {submitError}
            </div>
          )}

          {/* ── Progress bar ── */}
          {isSubmitting && jobStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="animate-spin text-gray-600 shrink-0" size={18} />
                <span className="text-sm font-semibold text-gray-700">
                  {statusText[jobStatus] || 'Processing...'}
                </span>
                <span className="ml-auto text-xs font-bold text-gray-500">{progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-black h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Pending state before WS connects */}
          {isSubmitting && !jobStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-3">
              <Loader2 className="animate-spin text-gray-600" size={18} />
              <span className="text-sm font-semibold text-gray-700">Connecting to server...</span>
            </div>
          )}
        </div>

        {/* ── Navigation buttons ── */}
        <div className="flex items-center justify-between mt-10 pt-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={16} /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Generate Paper</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
