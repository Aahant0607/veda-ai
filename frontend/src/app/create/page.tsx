'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Plus, ChevronLeft, ChevronRight, X, Loader2, FileText, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useStore } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const QUESTION_TYPE_OPTIONS = [
  { label: 'Multiple Choice Questions', key: 'MCQ' },
  { label: 'Short Questions',           key: 'Short Answer' },
  { label: 'Diagram/Graph-Based Questions', key: 'Diagram' },
  { label: 'Numerical Problems',        key: 'Numerical' },
  { label: 'Long Answer Questions',     key: 'Long Answer' },
  { label: 'True/False',                key: 'True/False' },
  { label: 'Fill in the Blanks',        key: 'Fill in the Blanks' },
];

const GRADE_OPTIONS = ['1','2','3','4','5','6','7','8','9','10','11','12','Undergraduate','Postgraduate'];

const SUBJECT_OPTIONS = [
  'Mathematics','Science','Physics','Chemistry','Biology',
  'English','Hindi','History','Geography','Computer Science',
  'Economics','Political Science','General',
];

interface QuestionRow {
  label: string;
  key: string;
  questions: number;
  marks: number;
}

export default function CreatePage() {
  const router    = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form fields ──────────────────────────────────────────────────
  const [uploadedFile,    setUploadedFile]    = useState<File | null>(null);
  const [isDragging,      setIsDragging]      = useState(false);
  const [dueDate,         setDueDate]         = useState('');
  const [subject,         setSubject]         = useState('');
  const [grade,           setGrade]           = useState('');
  const [additionalInfo,  setAdditionalInfo]  = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});

  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { label: 'Multiple Choice Questions', key: 'MCQ',          questions: 4, marks: 1 },
    { label: 'Short Questions',           key: 'Short Answer', questions: 3, marks: 2 },
    { label: 'Diagram/Graph-Based Questions', key: 'Diagram',  questions: 5, marks: 5 },
    { label: 'Numerical Problems',        key: 'Numerical',    questions: 5, marks: 5 },
  ]);

  // ── Submission ───────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const { setAssignmentId, setJobStatus, currentAssignmentId, jobStatus, progress } = useStore();
  useWebSocket(currentAssignmentId);

  // ── Derived totals ───────────────────────────────────────────────
  const totalQuestions = questionRows.reduce((s, r) => s + Number(r.questions), 0);
  const totalMarks     = questionRows.reduce((s, r) => s + Number(r.questions) * Number(r.marks), 0);

  // ── File handling ────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    setUploadedFile(file);
  };

  // ── Question row helpers ─────────────────────────────────────────
  const updateRow = (i: number, field: 'questions' | 'marks', delta: number) => {
    setQuestionRows(prev => prev.map((r, idx) =>
      idx === i ? { ...r, [field]: Math.max(1, r[field] + delta) } : r
    ));
  };

  const updateRowDirect = (i: number, field: 'questions' | 'marks', value: string) => {
    setQuestionRows(prev => prev.map((r, idx) =>
      idx === i ? { ...r, [field]: Math.max(1, Number(value) || 1) } : r
    ));
  };

  const updateRowType = (i: number, key: string) => {
    const found = QUESTION_TYPE_OPTIONS.find(o => o.key === key);
    if (!found) return;
    setQuestionRows(prev => prev.map((r, idx) =>
      idx === i ? { ...r, key: found.key, label: found.label } : r
    ));
  };

  const removeRow = (i: number) => setQuestionRows(prev => prev.filter((_, idx) => idx !== i));

  const addRow = () => {
    const used = new Set(questionRows.map(r => r.key));
    const next = QUESTION_TYPE_OPTIONS.find(o => !used.has(o.key));
    if (!next) return;
    setQuestionRows(prev => [...prev, { label: next.label, key: next.key, questions: 3, marks: 2 }]);
  };

  // ── Validation ───────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject)  e.subject  = 'Subject is required';
    if (!grade)    e.grade    = 'Grade is required';
    if (!dueDate)  e.dueDate  = 'Due date is required';
    else if (new Date(dueDate) < new Date()) e.dueDate = 'Due date must be in the future';
    if (questionRows.length === 0) e.rows = 'Add at least one question type';
    if (totalQuestions < 1) e.rows = 'Total questions must be at least 1';
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
      fd.append('title',          `${subject} Assignment`);
      fd.append('subject',        subject);
      fd.append('grade',          grade);
      fd.append('dueDate',        dueDate);
      fd.append('totalQuestions', String(totalQuestions));
      fd.append('totalMarks',     String(totalMarks));
      if (additionalInfo) fd.append('additionalInstructions', additionalInfo);
      questionRows.forEach(r => fd.append('questionTypes', r.key));
      if (uploadedFile) fd.append('file', uploadedFile);

      const res = await axios.post(`${API_URL}/api/assignments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAssignmentId(res.data.assignmentId);
      setJobStatus('pending', 0);

    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to generate. Please try again.');
      setIsSubmitting(false);
    }
  };

  const statusText: Record<string, string> = {
    pending:    'Queuing your request...',
    processing: 'Gemini AI is generating your paper...',
    completed:  'Done! Opening your paper...',
    failed:     'Generation failed. Please try again.',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Create Assignment</h1>
        <p className="text-gray-500 text-sm">Set up a new assignment for your students.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm p-6 sm:p-10">
        <h2 className="text-lg font-bold text-center mb-1">Assignment Details</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Basic information about your assignment</p>

        {/* ── File Upload ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => !uploadedFile && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center mb-2 transition-colors ${
            isDragging        ? 'border-black bg-gray-100 cursor-copy'
            : uploadedFile    ? 'border-green-300 bg-green-50 cursor-default'
            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.jpeg,.jpg,.png" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

          {uploadedFile ? (
            <>
              <FileText className="text-green-500 mb-2" size={28} />
              <p className="text-sm font-semibold text-green-700">{uploadedFile.name}</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline">
                <X size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <UploadCloud className="text-gray-400 mb-2" size={28} />
              <p className="text-sm font-semibold mb-1">Choose a file or drag & drop it here</p>
              <p className="text-xs text-gray-400 mb-3">JPEG, PNG, PDF, upto 10MB</p>
              <button className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">
                Browse Files
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mb-6">Upload images of your preferred document/image</p>

        <div className="space-y-5">

          {/* ── Subject + Grade row ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Subject *</label>
              <div className="relative">
                <select value={subject} onChange={(e) => { setSubject(e.target.value); setErrors(p => ({...p, subject: ''})); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 appearance-none bg-white cursor-pointer">
                  <option value="">Select subject</option>
                  {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Grade *</label>
              <div className="relative">
                <select value={grade} onChange={(e) => { setGrade(e.target.value); setErrors(p => ({...p, grade: ''})); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 appearance-none bg-white cursor-pointer">
                  <option value="">Select grade</option>
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>
          </div>

          {/* ── Due Date ── */}
          <div>
            <label className="block text-sm font-semibold mb-2">Due Date *</label>
            <div className="relative">
              <input type="date" value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setErrors(p => ({...p, dueDate: ''})); }}
                min={new Date().toISOString().split('T')[0]}
                placeholder="DD-MM-YYYY"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* ── Question Types — DESKTOP ── */}
          <div>
            <div className="hidden sm:flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Question Type *</label>
              <div className="flex gap-12 text-xs font-semibold text-gray-500 pr-2">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>

            {/* Desktop rows */}
            <div className="hidden sm:flex flex-col gap-3">
              {questionRows.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  {/* Dropdown */}
                  <div className="relative flex-1">
                    <select value={row.key} onChange={(e) => updateRowType(i, e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 appearance-none bg-white cursor-pointer">
                      {QUESTION_TYPE_OPTIONS.map(o => (
                        <option key={o.key} value={o.key}
                          disabled={questionRows.some((r, ri) => ri !== i && r.key === o.key)}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>

                  {/* Questions stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateRow(i, 'questions', -1)}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold leading-none">−</button>
                    <input type="number" value={row.questions} min={1}
                      onChange={(e) => updateRowDirect(i, 'questions', e.target.value)}
                      className="w-10 text-center text-sm font-semibold outline-none border-x border-gray-200 py-3" />
                    <button onClick={() => updateRow(i, 'questions', +1)}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold leading-none">+</button>
                  </div>

                  {/* Marks stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateRow(i, 'marks', -1)}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold leading-none">−</button>
                    <input type="number" value={row.marks} min={1}
                      onChange={(e) => updateRowDirect(i, 'marks', e.target.value)}
                      className="w-10 text-center text-sm font-semibold outline-none border-x border-gray-200 py-3" />
                    <button onClick={() => updateRow(i, 'marks', +1)}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold leading-none">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Question Types — MOBILE (card style like Figma) ── */}
            <div className="flex sm:hidden flex-col gap-3">
              <label className="text-sm font-semibold">Question Type *</label>
              {questionRows.map((row, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative flex-1 mr-2">
                      <select value={row.key} onChange={(e) => updateRowType(i, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none appearance-none bg-gray-50 cursor-pointer">
                        {QUESTION_TYPE_OPTIONS.map(o => (
                          <option key={o.key} value={o.key}
                            disabled={questionRows.some((r, ri) => ri !== i && r.key === o.key)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-2">No. of Questions</p>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateRow(i, 'questions', -1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold">−</button>
                        <span className="flex-1 text-center text-sm font-semibold py-2">{row.questions}</span>
                        <button onClick={() => updateRow(i, 'questions', +1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold">+</button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Marks</p>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateRow(i, 'marks', -1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold">−</button>
                        <span className="flex-1 text-center text-sm font-semibold py-2">{row.marks}</span>
                        <button onClick={() => updateRow(i, 'marks', +1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.rows && <p className="text-red-500 text-xs mt-2">{errors.rows}</p>}

            {/* Add Question Type button */}
            <button onClick={addRow}
              disabled={questionRows.length >= QUESTION_TYPE_OPTIONS.length}
              className="flex items-center gap-2 text-sm font-semibold mt-4 text-gray-700 hover:text-black transition-colors disabled:opacity-40">
              <div className="bg-black text-white rounded-full p-0.5"><Plus size={14} /></div>
              Add Question Type
            </button>
          </div>

          {/* ── Totals ── */}
          <div className="flex justify-end text-xs font-bold text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex flex-col gap-1 text-right">
              <span>Total Questions : <span className="text-black text-sm">{totalQuestions}</span></span>
              <span>Total Marks : <span className="text-black text-sm">{totalMarks}</span></span>
            </div>
          </div>

          {/* ── Additional Info ── */}
          <div>
            <label className="block text-sm font-semibold mb-2">Additional Information <span className="font-normal text-gray-400">(For better output)</span></label>
            <textarea rows={4} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g Generate a question paper for a 3 hour exam duration..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors resize-none" />
          </div>

          {/* ── Error ── */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {submitError}
            </div>
          )}

          {/* ── Progress ── */}
          {isSubmitting && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="animate-spin text-gray-600 shrink-0" size={18} />
                <span className="text-sm font-semibold text-gray-700">
                  {jobStatus ? statusText[jobStatus] : 'Connecting to server...'}
                </span>
                {jobStatus && (
                  <span className="ml-auto text-xs font-bold text-gray-500">{progress}%</span>
                )}
              </div>
              <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-black h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8 pt-4">
          <button onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} /> Previous
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting
              ? <><Loader2 className="animate-spin" size={16} /> Generating...</>
              : <>Next <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
