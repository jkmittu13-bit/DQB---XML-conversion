
import React, { useState, useCallback } from 'react';
import { 
  FileUp, 
  Loader2, 
  AlertCircle, 
  FileSearch, 
  Image as ImageIcon,
  ArrowRight,
  BrainCircuit,
  Database
} from 'lucide-react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ResultViewer from './components/ResultViewer';
import { 
  ProcessingOptions, 
  AppStatus, 
  ExtractedData, 
  QTIResult 
} from './types';
import { 
  DEFAULT_SYSTEM_PROMPT, 
  AVAILABLE_MODELS, 
  MAX_FILE_SIZE_MB 
} from './constants';
import { extractFromPdf, extractFromTxt, extractFromDocx } from './services/pdfService';
import { generateQTI } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    extractImages: true,
    includeImageAnalysis: true,
    model: AVAILABLE_MODELS[0].id,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  });
  const [result, setResult] = useState<QTIResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setExtractedData(null);
  };

  const processAndGenerate = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setStatus(AppStatus.EXTRACTING);
      setError(null);
      
      let data: ExtractedData;
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (file.type === 'application/pdf' || fileExt === 'pdf') {
        data = await extractFromPdf(file, options.extractImages);
      } else if (file.type === 'text/plain' || fileExt === 'txt') {
        data = await extractFromTxt(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === 'docx') {
        data = await extractFromDocx(file, options.extractImages);
      } else {
        throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
      }

      setExtractedData(data);
      
      setStatus(AppStatus.GENERATING);
      const generationData = await generateQTI(data, options);
      
      setResult({
        xml: generationData.xml,
        questions: generationData.questions,
        fileName: file.name,
        timestamp: new Date().toLocaleTimeString(),
      });
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration & Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* File Upload Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileUp className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">Source Content</h2>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  file 
                    ? 'border-blue-400 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  accept=".pdf,.txt,.docx" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <FileSearch className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}</p>
                    <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">Change file</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <FileUp className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Click or drag to upload</p>
                    <p className="text-xs text-slate-400">PDF, Word, or Text files (Max {MAX_FILE_SIZE_MB}MB)</p>
                  </div>
                )}
              </div>

              {extractedData && extractedData.images.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-slate-600 uppercase">Extracted Assets</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      {extractedData.images.length} IMAGES
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {extractedData.images.slice(0, 8).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="Extracted" />
                      </div>
                    ))}
                    {extractedData.images.length > 8 && (
                      <div className="aspect-square rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{extractedData.images.length - 8} MORE
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AI Generation Trigger */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BrainCircuit className="w-24 h-24 text-white" />
               </div>
               
               <div className="relative z-10">
                 <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                   Generate QTI Package
                 </h3>
                 <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                   Review your settings and click below to start the AI-powered conversion process.
                 </p>
                 
                 <button
                   disabled={!file || status === AppStatus.GENERATING || status === AppStatus.EXTRACTING}
                   onClick={processAndGenerate}
                   className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${
                    !file || status === AppStatus.GENERATING || status === AppStatus.EXTRACTING
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                      : 'bg-blue-600 hover:bg-blue-500 text-white transform hover:-translate-y-0.5 active:scale-95'
                   }`}
                 >
                   {status === AppStatus.EXTRACTING && (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Extracting Text...
                     </>
                   )}
                   {status === AppStatus.GENERATING && (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Gemini is architecting QTI...
                     </>
                   )}
                   {status !== AppStatus.EXTRACTING && status !== AppStatus.GENERATING && (
                     <>
                       Convert to QTI
                       <ArrowRight className="w-5 h-5" />
                     </>
                   )}
                 </button>
               </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}
          </div>

          {/* Right Column: Settings & Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {result ? (
              <ResultViewer result={result} />
            ) : (
              <div className="space-y-6">
                 <SettingsPanel options={options} setOptions={setOptions} />
                 
                 <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                     <Database className="w-8 h-8 text-slate-300" />
                   </div>
                   <h3 className="text-slate-600 font-semibold mb-1">Waiting for content</h3>
                   <p className="text-slate-400 text-sm max-w-xs">Once you upload a file and start the generation, the formatted XML output and preview will appear here.</p>
                 </div>
              </div>
            )}

            {extractedData && !result && status === AppStatus.GENERATING && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-pulse">
                <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
                </div>
                <div className="mt-8 flex justify-center">
                   <p className="text-sm text-slate-400 font-medium">Synthesizing XML nodes...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">© 2024 Gemini QTI Architect • Enterprise-Grade AI Conversion</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-semibold">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-semibold">API Documentation</a>
            <a href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-semibold">QTI Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
