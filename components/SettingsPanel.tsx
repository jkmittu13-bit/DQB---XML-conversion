
import React from 'react';
import { Settings2, MessageSquareText, Zap } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';
import { ProcessingOptions } from '../types';

interface SettingsPanelProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ options, setOptions }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-slate-500" />
        <h2 className="font-semibold text-slate-700">Generation Settings</h2>
      </div>
      
      <div className="p-5 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> AI Model Selection
          </label>
          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setOptions(prev => ({ ...prev, model: model.id }))}
                className={`text-left p-3 rounded-lg border transition-all ${
                  options.model === model.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900">{model.name}</div>
                <div className="text-xs text-slate-500 mt-1">{model.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
             <MessageSquareText className="w-4 h-4 text-blue-500" /> System Instruction Prompt
          </label>
          <textarea
            value={options.systemPrompt}
            onChange={(e) => setOptions(prev => ({ ...prev, systemPrompt: e.target.value }))}
            className="w-full h-48 p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mono resize-none"
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={options.extractImages}
                onChange={(e) => setOptions(prev => ({ ...prev, extractImages: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Extract images from PDF</span>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer group ${!options.extractImages ? 'opacity-50 grayscale' : ''}`}>
            <div className="relative">
              <input
                type="checkbox"
                disabled={!options.extractImages}
                checked={options.includeImageAnalysis}
                onChange={(e) => setOptions(prev => ({ ...prev, includeImageAnalysis: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Include image analysis in prompt</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
