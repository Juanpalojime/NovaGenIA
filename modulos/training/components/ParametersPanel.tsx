import React, { useState } from 'react';
import { Sliders, HelpCircle, ChevronDown, Sparkles, Loader2, Save, Download } from 'lucide-react';
import { TrainingParams } from '../types';
import { generateTrainingConfig } from '../services/geminiService';

interface Props {
  params: TrainingParams;
  setParams: React.Dispatch<React.SetStateAction<TrainingParams>>;
}

export const ParametersPanel: React.FC<Props> = ({ params, setParams }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleOptimization = async () => {
    setIsOptimizing(true);
    const optimized = await generateTrainingConfig(params.projectName, params.triggerWord);
    setParams(prev => ({
        ...prev,
        ...optimized
    }));
    setIsOptimizing(false);
  };

  const handleSave = () => {
    try {
        localStorage.setItem('neogen_params', JSON.stringify(params));
        setMessage({ text: 'Configuration saved successfully', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
    } catch (e) {
        setMessage({ text: 'Failed to save configuration', type: 'error' });
    }
  };

  const handleLoad = () => {
    try {
        const saved = localStorage.getItem('neogen_params');
        if (saved) {
            setParams(JSON.parse(saved));
            setMessage({ text: 'Configuration loaded successfully', type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ text: 'No saved configuration found', type: 'error' });
            setTimeout(() => setMessage(null), 3000);
        }
    } catch (e) {
        setMessage({ text: 'Failed to load configuration', type: 'error' });
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden h-full shadow-sm flex flex-col">
      <h3 className="bg-slate-50 dark:bg-[#2a1d36] border-b border-border-light dark:border-border-dark text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-5 py-4 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
            <Sliders className="text-primary" size={18} />
            Training Parameters
        </div>
        <button 
            onClick={handleOptimization}
            disabled={isOptimizing}
            className="text-xs flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
            {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Optimize
        </button>
      </h3>
      
      <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
        {message && (
            <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                <div className={`size-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {message.text}
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Project Name</label>
            <input 
                className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder-slate-400" 
                type="text" 
                value={params.projectName}
                onChange={(e) => setParams({...params, projectName: e.target.value})}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Base Model</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                value={params.baseModel}
                onChange={(e) => setParams({...params, baseModel: e.target.value})}
              >
                <option>SDXL 1.0</option>
                <option>NeoGen_XL_v1</option>
                <option>Stable Cascade</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Trigger Word</label>
            <input 
                className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-primary font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" 
                type="text" 
                value={params.triggerWord}
                onChange={(e) => setParams({...params, triggerWord: e.target.value})}
            />
          </div>
        </div>

        <hr className="border-slate-200 dark:border-border-dark" />

        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Training Steps</label>
              <span className="text-slate-900 dark:text-white font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{params.steps}</span>
            </div>
            <input 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="500" 
                max="5000" 
                value={params.steps} 
                onChange={(e) => setParams({...params, steps: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 group cursor-help">
                T-LoRA Rank 
                <HelpCircle size={12} className="opacity-50" />
              </label>
              <span className="text-slate-900 dark:text-white font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{params.loraRank}</span>
            </div>
            <input 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="8" 
                max="256" 
                step="8"
                value={params.loraRank} 
                onChange={(e) => setParams({...params, loraRank: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Learning Rate</label>
              <span className="text-slate-900 dark:text-white font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">1e-{Math.round(params.learningRate/10)}</span>
            </div>
            <input 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="1" 
                max="100" 
                value={params.learningRate} 
                onChange={(e) => setParams({...params, learningRate: parseInt(e.target.value)})}
            />
          </div>
        </div>

        {/* Advanced Accordion */}
        <div className="mt-2">
          <div className="group">
            <button 
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between cursor-pointer list-none text-slate-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors focus:outline-none"
            >
              <span>Advanced Configuration</span>
              <ChevronDown className={`transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {isAdvancedOpen && (
                <div className="pt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                        <span className="text-xs text-slate-500 dark:text-gray-300">Gradient Checkpointing</span>
                        <div 
                            className={`relative w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer ${params.gradientCheckpointing ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                            onClick={() => setParams({...params, gradientCheckpointing: !params.gradientCheckpointing})}
                        >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm ${params.gradientCheckpointing ? 'translate-x-4.5 left-0.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                        <span className="text-xs text-slate-500 dark:text-gray-300">Mixed Precision (fp16)</span>
                        <div 
                            className={`relative w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer ${params.mixedPrecision ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                            onClick={() => setParams({...params, mixedPrecision: !params.mixedPrecision})}
                        >
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm ${params.mixedPrecision ? 'translate-x-4.5 left-0.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save/Load Footer */}
      <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-border-light dark:border-border-dark flex gap-3">
        <button 
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
            <Save size={16} />
            Save Config
        </button>
        <button 
            onClick={handleLoad}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
            <Download size={16} />
            Load Config
        </button>
      </div>
    </div>
  );
};