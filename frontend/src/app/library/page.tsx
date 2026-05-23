'use client';

import { Library, ExternalLink, Search, BookOpen } from 'lucide-react';

export default function LibraryPage() {
  const freeLibraries = [
    { name: 'Project Gutenberg', desc: 'Library of over 70,000 free eBooks.', url: 'https://www.gutenberg.org/', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Open Library', desc: 'Millions of books available to borrow.', url: 'https://openlibrary.org/', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'NDLI', desc: 'National Digital Library of India repository.', url: 'https://ndl.iitkgp.ac.in/', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Directory of Open Access Books', desc: 'Academic peer-reviewed books.', url: 'https://www.doabooks.org/', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Google Scholar', desc: 'Search scholarly literature and papers.', url: 'https://scholar.google.com/', color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Internet Archive', desc: 'Non-profit library of millions of free books.', url: 'https://archive.org/details/books', color: 'text-gray-800', bg: 'bg-gray-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">My Library <Library size={20} className="text-[#E1502E]" /></h1>
          <p className="text-gray-500 text-sm">Access global free digital libraries and resources.</p>
        </div>
        <div className="relative w-64 hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search resources..." className="w-full bg-white border-none rounded-full py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freeLibraries.map((lib, index) => (
          <a 
            key={index} 
            href={lib.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-48"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`${lib.bg} ${lib.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <BookOpen size={24} />
                </div>
                <ExternalLink size={16} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-[#E1502E] transition-colors">{lib.name}</h3>
              <p className="text-sm font-medium text-gray-500">{lib.desc}</p>
            </div>
            <div className="mt-4 text-xs font-bold text-gray-400 group-hover:text-black transition-colors">
              Access Library →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}