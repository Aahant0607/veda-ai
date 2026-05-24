'use client';

import { Users, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';

export default function GroupsPage() {
  // Converted to React State so the UI updates when we add a new one
  const [groups, setGroups] = useState([
    { name: 'Class 5th - English', students: 32 },
    { name: 'Class 8th - Science', students: 28 },
    { name: 'Class 10th - Math', students: 40 },
  ]);

  // Function to handle the prompt and add the new group
  const handleCreateGroup = () => {
    const groupName = window.prompt('Enter the name of your new group:');
    
    // Check if the user typed something and didn't hit cancel
    if (groupName && groupName.trim() !== '') {
      setGroups([...groups, { name: groupName.trim(), students: 0 }]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Groups</h1>
          <p className="text-gray-500 text-sm">Manage your classes and students.</p>
        </div>
        <button 
          onClick={handleCreateGroup}
          className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <div key={index} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-transparent hover:border-gray-200 transition cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-100 p-3 rounded-xl text-gray-700"><Users size={20} /></div>
              <button className="text-gray-400 hover:text-black"><MoreVertical size={16} /></button>
            </div>
            <h3 className="font-bold text-lg mb-1">{group.name}</h3>
            <p className="text-sm font-semibold text-gray-500">{group.students} Students Enrolled</p>
          </div>
        ))}
      </div>
    </div>
  );
}
