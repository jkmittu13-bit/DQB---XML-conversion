
import React from 'react';
import { QuestionJSON } from '../types';
import { BadgeCheck, Layout, Type } from 'lucide-react';

interface QTIPreviewProps {
  questions: QuestionJSON[];
}

const QTIPreview: React.FC<QTIPreviewProps> = ({ questions }) => {
  return (
    <div className="space-y-8 p-6 bg-white overflow-auto h-full">
      {questions.map((q, idx) => (
        <div key={idx} className="group border border-slate-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3 h-3" />
              {q.category || "General Question"}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Question {idx + 1}</span>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-800 font-medium text-lg leading-relaxed whitespace-pre-wrap mb-4">
              {q.question}
            </p>
          </div>

          {q.images && q.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {q.images.map((img, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center p-2 min-h-[200px]">
                  <img 
                    src={img} 
                    alt={`Diagram for question ${idx + 1}`} 
                    className="max-w-full h-auto rounded shadow-sm hover:scale-[1.02] transition-transform cursor-zoom-in"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3EImage Reference Broken%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-emerald-100 p-1 rounded">
                   <BadgeCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Correct Answer</span>
                  <p className="text-slate-700 font-semibold">{q.correct_answer || "Not specified"}</p>
                </div>
             </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
             <div className="h-1 flex-1 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-slate-200 w-1/4 group-hover:w-full transition-all duration-700"></div>
             </div>
             <span className="text-[10px] font-mono text-slate-300">QTI_ATOM_V2.2</span>
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
           <Type className="w-12 h-12 mb-4 opacity-20" />
           <p className="font-medium">No questions found to preview.</p>
        </div>
      )}
    </div>
  );
};

export default QTIPreview;
