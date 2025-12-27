
import React, { useState } from 'react';
import { Copy, Download, Check, Code, FileText, Eye } from 'lucide-react';
import { QTIResult } from '../types';
import QTIPreview from './QTIPreview';

interface ResultViewerProps {
  result: QTIResult | null;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'xml' | 'preview'>('preview');

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.split('.')[0]}_qti.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
      <div className="p-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setView('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button 
                onClick={() => setView('xml')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'xml' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Code className="w-3.5 h-3.5" />
                XML Code
              </button>
           </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy XML'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .xml
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-slate-50">
        {view === 'xml' ? (
          <div className="h-full overflow-auto p-6 bg-slate-950">
            <pre className="mono text-[13px] leading-relaxed text-slate-300">
              <code>{result.xml}</code>
            </pre>
          </div>
        ) : (
          <QTIPreview questions={result.questions || []} />
        )}
      </div>

      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <FileText className="w-3 h-3" />
          Source: {result.fileName}
        </div>
        <div className="text-[10px] text-slate-500 font-medium">
          Generated at {result.timestamp}
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
