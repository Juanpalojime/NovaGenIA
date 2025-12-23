import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { GenerationStatus, AspectRatio, ART_STYLES, ASPECT_RATIO_LABELS, Project, HistoryItem } from '../types';

interface GeneratorProps {
  onProjectCreated: (project: Project) => void;
}

const Generator: React.FC<GeneratorProps> = ({ onProjectCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('prompt_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Close history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToHistory = (p: string, s: string, r: AspectRatio) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      prompt: p,
      style: s,
      ratio: r,
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history].slice(0, 10); // keep last 10
    setHistory(newHistory);
    localStorage.setItem('prompt_history', JSON.stringify(newHistory));
  };

  const reuseHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setSelectedStyle(item.style);
    setSelectedRatio(item.ratio);
    setShowHistory(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setErrorMsg(null);
    setStatus(GenerationStatus.PARSING);

    // Simulate Parsing Step
    await new Promise(r => setTimeout(r, 800));
    
    setStatus(GenerationStatus.RENDERING);

    try {
      const result = await geminiService.generateImage(prompt, selectedStyle, selectedRatio);
      
      setStatus(GenerationStatus.FINISHING);
      
      // Simulate Finalizing Step
      await new Promise(r => setTimeout(r, 600));

      // Success
      const newProject: Project = {
        id: Date.now().toString(),
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        imageUrl: `data:${result.mimeType};base64,${result.base64}`,
        timestamp: 'Just now',
        status: 'completed'
      };

      onProjectCreated(newProject);
      addToHistory(prompt, selectedStyle, selectedRatio);
      setStatus(GenerationStatus.SUCCESS);
      
      // Reset status after a moment to allow another generation
      setTimeout(() => setStatus(GenerationStatus.IDLE), 2000);

    } catch (err: any) {
      setStatus(GenerationStatus.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  const getStatusText = () => {
    switch (status) {
      case GenerationStatus.PARSING: return "Parsing message...";
      case GenerationStatus.RENDERING: return "Rendering image...";
      case GenerationStatus.FINISHING: return "Finishing...";
      case GenerationStatus.SUCCESS: return "Complete!";
      default: return "Generate";
    }
  };

  const isGenerating = status === GenerationStatus.PARSING || status === GenerationStatus.RENDERING || status === GenerationStatus.FINISHING;

  return (
    <div className="lg:col-span-2 rounded-xl bg-gradient-to-r from-surface-dark to-[#2a1b36] border border-surface-highlight p-6 lg:p-8 flex flex-col justify-center gap-6 shadow-xl relative overflow-visible group">
      
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
            <h2 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                Start Creating
            </h2>
            <p className="text-text-secondary text-sm max-w-lg">Enter a prompt to generate new assets instantly using NeoGen v4 engine.</p>
        </div>
        
        {/* History Button */}
        <div className="relative" ref={historyRef}>
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors bg-surface-dark/50 p-2 rounded-lg border border-transparent hover:border-primary/30"
            >
                <span className="material-symbols-outlined text-sm">history</span>
                <span>History</span>
            </button>
            {showHistory && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface-dark border border-surface-highlight rounded-lg shadow-xl z-50 p-2 max-h-64 overflow-y-auto">
                    {history.length === 0 ? (
                        <p className="text-text-secondary text-xs p-2">No history yet.</p>
                    ) : (
                        history.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => reuseHistory(item)}
                                className="p-2 hover:bg-surface-highlight rounded cursor-pointer group"
                            >
                                <p className="text-white text-xs truncate font-medium">{item.prompt}</p>
                                <p className="text-text-secondary text-[10px]">{item.style} • {ASPECT_RATIO_LABELS[item.ratio]}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-4 z-10">
        <div className="flex-1 relative">
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="w-full h-24 bg-surface-highlight/50 border border-surface-highlight rounded-lg p-4 text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:bg-surface-highlight transition-all resize-none text-sm" 
                placeholder="A futuristic cyberpunk city with neon lights, cinematic lighting..."
            />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
                {/* Style Selector */}
                <div className="flex flex-col gap-1">
                    <label className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">Style</label>
                    <select 
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        disabled={isGenerating}
                        className="bg-surface-dark border border-surface-highlight rounded-md text-white text-xs px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                        {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="flex flex-col gap-1">
                     <label className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">Ratio</label>
                     <select 
                        value={selectedRatio}
                        onChange={(e) => setSelectedRatio(e.target.value as AspectRatio)}
                        disabled={isGenerating}
                        className="bg-surface-dark border border-surface-highlight rounded-md text-white text-xs px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                        {Object.entries(ASPECT_RATIO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`h-10 px-6 ${isGenerating ? 'bg-surface-highlight cursor-wait' : 'bg-primary hover:bg-primary-dark'} text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(127,19,236,0.3)] disabled:opacity-50 disabled:shadow-none min-w-[140px]`}
            >
                {isGenerating ? (
                    <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        <span className="text-sm">{getStatusText()}</span>
                    </>
                ) : (
                    <>
                        <span>Generate</span>
                        <span className="material-symbols-outlined text-sm">send</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Error Message */}
      {status === GenerationStatus.ERROR && errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center justify-between text-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{errorMsg}</span>
            </div>
            <button 
                onClick={handleGenerate} 
                className="text-white bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded text-xs font-bold transition-colors"
            >
                Retry
            </button>
        </div>
      )}

    </div>
  );
};

export default Generator;
