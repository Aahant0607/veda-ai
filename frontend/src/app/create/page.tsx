'use client';

import { UploadCloud, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CreatePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Create Assignment</h1>
        <p className="text-gray-500 text-sm">Set up a new assignment for your students.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-10">
        <h2 className="text-lg font-bold text-center mb-1">Assignment Details</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Basic information about your assignment</p>

        <div className="border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 p-10 flex flex-col items-center justify-center mb-8 cursor-pointer hover:bg-gray-50 transition-colors">
          <UploadCloud className="text-gray-400 mb-3" size={32} />
          <p className="text-sm font-semibold mb-1">Choose a file or drag & drop it here</p>
          <p className="text-xs text-gray-400 mb-4">JPEG, PNG, PDF, formats up to 10MB</p>
          <button className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">
            Browse File
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Due Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">Question Type</label>
              <div className="flex gap-10 text-xs font-semibold text-gray-500 pr-4">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                'Multiple Choice Questions',
                'Short Questions',
                'Diagram/Graph-Based Questions',
                'Numerical Problems'
              ].map((type, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center bg-white text-sm">
                    {type}
                    <ChevronRight size={16} className="text-gray-400 rotate-90" />
                  </div>
                  <X size={16} className="text-gray-300 mx-2" />
                  <input type="number" defaultValue={5} className="w-20 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center outline-none focus:border-gray-300" />
                  <input type="number" defaultValue={1} className="w-20 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center outline-none focus:border-gray-300" />
                </div>
              ))}
            </div>

            <button className="flex items-center gap-2 text-sm font-semibold mt-4 text-gray-700 hover:text-black">
              <div className="bg-black text-white rounded-full p-0.5"><Plus size={14} /></div>
              Add Question Type
            </button>
          </div>

          <div className="flex justify-end gap-10 text-xs font-bold text-gray-700 pb-4 border-b border-gray-100">
            <div className="flex flex-col gap-1 text-right">
              <span>Total Questions: 20</span>
              <span>Total Marks: 20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Additional Information</label>
            <textarea 
              rows={4} 
              placeholder="e.g. Generate a question paper for a 3 hour exam duration..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} /> Previous
          </button>
          <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-800 transition-colors">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}