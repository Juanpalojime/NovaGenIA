import React, { useState } from 'react';
import { GenerationParams } from '../types';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerationParams) => void;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [model, setModel] = useState('gemini-2.5-flash-image');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate({
        prompt,
        negativePrompt,
        aspectRatio,
        model
      });
      // Reset sensitive fields, keep settings
      setPrompt('');
      onClose();
    }
  };

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1122] border border-[#362348] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#362348] flex justify-between items-center shrink-0">
          <h3 className="text-white text-lg font-bold">New Generation</h3>
          <button onClick={onClose} className="text-[#ad92c9] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar p-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Model Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[#ad92c9] text-xs font-bold uppercase tracking-wider mb-2">Model</label>
                  <div className="relative">
                    <select 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-[#362348] text-white rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary border border-transparent cursor-pointer"
                    >
                      <option value="gemini-2.5-flash-image">Gemini 2.5 Flash (Fast)</option>
                      <option value="gemini-3-pro-image-preview">Gemini 3 Pro (High Quality)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#ad92c9]">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                  </div>
               </div>
               
               <div>
                 <label className="block text-[#ad92c9] text-xs font-bold uppercase tracking-wider mb-2">Aspect Ratio</label>
                 <div className="flex gap-2">
                   {aspectRatios.map((ratio) => (
                     <button
                       key={ratio}
                       type="button"
                       onClick={() => setAspectRatio(ratio)}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                         aspectRatio === ratio 
                           ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(127,19,236,0.3)]' 
                           : 'bg-[#362348] border-transparent text-[#ad92c9] hover:text-white hover:border-[#ad92c9]'
                       }`}
                     >
                       {ratio}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-[#ad92c9] text-xs font-bold uppercase tracking-wider mb-2">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 bg-[#362348] text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                placeholder="Describe the image you want to generate..."
                autoFocus
              />
            </div>

            {/* Negative Prompt Input */}
            <div>
              <label className="block text-[#ad92c9] text-xs font-bold uppercase tracking-wider mb-2">Negative Prompt</label>
              <textarea 
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full h-16 bg-[#362348] text-gray-300 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                placeholder="What to avoid (e.g. blur, low quality, watermarks)..."
              />
            </div>
            
          </form>
        </div>

        <div className="p-5 border-t border-[#362348] flex justify-end gap-3 shrink-0 bg-[#1a1122]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#362348] text-white hover:bg-[#4a3061] text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={!prompt.trim()}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Generate
            </button>
        </div>
      </div>
    </div>
  );
};
