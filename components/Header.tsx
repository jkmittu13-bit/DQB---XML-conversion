
import React from 'react';
import { Cpu, FileCode } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Gemini <span className="text-blue-600">QTI</span> Architect
              </h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Enterprise Assessment Generator</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
              <Cpu className="w-3 h-3" />
              Powered by Gemini 3
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
