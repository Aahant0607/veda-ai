import { Wrench, Sparkles, FileText, CheckSquare, Presentation } from 'lucide-react';

export default function ToolkitPage() {
  const tools = [
    { title: 'Rubric Generator', desc: 'Create detailed grading rubrics instantly.', icon: <CheckSquare size={24} /> },
    { title: 'Lesson Plan Creator', desc: 'Draft comprehensive lesson plans.', icon: <FileText size={24} /> },
    { title: 'Slide Deck Outliner', desc: 'Generate presentation outlines.', icon: <Presentation size={24} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">AI Teacher's Toolkit <Sparkles size={20} className="text-[#E1502E]" /></h1>
        <p className="text-gray-500 text-sm">Powerful AI tools to speed up your daily workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <div key={index} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#E1502E] mb-4 group-hover:scale-110 transition">
              {tool.icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}