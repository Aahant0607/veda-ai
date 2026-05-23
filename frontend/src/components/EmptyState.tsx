import Link from 'next/link';
import { Plus } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function EmptyState({ icon, title, description, buttonText, buttonLink }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center mt-10 w-full">
      <div className="bg-white w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed mx-auto">
        {description}
      </p>
      
      {/* Only render the button if a link and text are provided */}
      {buttonText && buttonLink && (
        <Link href={buttonLink} className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:scale-105 transition-transform mx-auto">
          <div className="bg-white text-black rounded-full p-0.5">
            <Plus size={14} strokeWidth={3} />
          </div>
          {buttonText}
        </Link>
      )}
    </div>
  );
}