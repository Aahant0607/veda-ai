'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  // State to hold the current avatar image URL
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=John');
  
  // Ref to trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image upload instantly
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate a new AI avatar by randomizing the seed
  const handleAIGenerate = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=e5e7eb`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile and school preferences.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm p-8">
        <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
        
        {/* Interactive Avatar Section */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10 items-start sm:items-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-sm shrink-0">
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">Update your avatar</p>
            <div className="flex flex-wrap gap-3">
              {/* Upload Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition text-gray-700 shadow-sm"
              >
                <UploadCloud size={16} /> Upload Photo
              </button>
              
              {/* AI Generate Button */}
              <button 
                onClick={handleAIGenerate}
                className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-100 transition text-[#E1502E] shadow-sm"
              >
                <Sparkles size={16} /> Generate AI Avatar
              </button>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
            <p className="text-xs text-gray-400">JPG, PNG or AI generated. Max size 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2">First Name</label>
            <input type="text" defaultValue="John" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Last Name</label>
            <input type="text" defaultValue="Doe" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors" />
          </div>
        </div>

        <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-4 mt-10">School Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">School Name</label>
            <input type="text" defaultValue="Delhi Public School" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Place / City</label>
            <input type="text" defaultValue="Bokaro Steel City" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-300 transition-colors" />
          </div>
        </div>

        <div className="flex justify-end mt-10">
          <button className="bg-black text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-md hover:bg-gray-800 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}