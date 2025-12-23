import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AssetGrid } from './components/AssetGrid';
import { Inspector } from './components/Inspector';
import { GenerateModal } from './components/GenerateModal';
import { MOCK_ASSETS } from './mockData';
import { Asset, GenerationParams } from './types';
import { generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [selectedId, setSelectedId] = useState<string>(MOCK_ASSETS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedId) || null;

  const handleGenerate = async (params: GenerationParams) => {
    // 1. Add a placeholder asset in "Processing" state
    const newId = Date.now().toString();
    const placeholderAsset: Asset = {
      id: newId,
      url: '',
      title: 'Generating...',
      prompt: params.prompt,
      negativePrompt: params.negativePrompt || '',
      dimensions: params.aspectRatio === '16:9' ? '1920 x 1080' : 
                  params.aspectRatio === '9:16' ? '1080 x 1920' : 
                  params.aspectRatio === '4:3' ? '1600 x 1200' : '1024 x 1024',
      seed: '---',
      sampler: 'Euler a',
      steps: 30,
      cfgScale: 7.0,
      model: params.model === 'gemini-3-pro-image-preview' ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash',
      version: 'v1.0',
      createdAt: 'Processing...',
      isProcessing: true,
      progress: 0
    };

    setAssets(prev => [placeholderAsset, ...prev]);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setAssets(prev => prev.map(a => {
        if (a.id === newId && a.isProcessing) {
          // Increment progress up to 90%
          const newProgress = (a.progress || 0) + Math.random() * 10;
          return { ...a, progress: Math.min(newProgress, 90) };
        }
        return a;
      }));
    }, 800);
    
    try {
      // 2. Call Gemini API
      const base64Image = await generateImage(params);

      clearInterval(progressInterval);

      // 3. Update asset with real image
      setAssets(prev => prev.map(asset => {
        if (asset.id === newId) {
          return {
            ...asset,
            url: base64Image,
            title: params.prompt.slice(0, 20) + (params.prompt.length > 20 ? '...' : ''),
            isProcessing: false,
            progress: 100,
            createdAt: 'Just now',
            seed: Math.floor(Math.random() * 100000000).toString()
          };
        }
        return asset;
      }));
      
      // Select the new asset
      setSelectedId(newId);

    } catch (error) {
      console.error("Failed to generate", error);
      clearInterval(progressInterval);
      // Remove the placeholder on error
      setAssets(prev => prev.filter(a => a.id !== newId));
      alert("Failed to generate image. Please check your API key or try again.");
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <Sidebar recentAssets={assets} />
      
      <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        <Header />
        
        {/* Toolbar */}
        <div className="px-6 py-4 flex flex-col gap-4 shrink-0 bg-background-dark">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Biblioteca de Activos</h2>
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-lg h-10 bg-[#362348] text-white gap-2 text-sm font-bold px-4 hover:bg-[#4a3061] transition-colors">
                <span className="material-symbols-outlined text-[20px]">upload</span>
                <span>Import</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold px-4 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>New Generation</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#ad92c9]">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-[#362348] text-white placeholder-[#ad92c9] focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-shadow" 
                placeholder="Search prompts, seeds, or tags..." 
                type="text"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
               <button className="p-2.5 rounded-lg bg-[#362348] text-white hover:bg-[#4a3061] transition-colors shrink-0" title="Filter">
                <span className="material-symbols-outlined text-[22px]">filter_list</span>
              </button>
              <div className="h-10 w-[1px] bg-[#362348] mx-1 shrink-0"></div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#362348] text-white text-sm font-medium hover:bg-[#4a3061] whitespace-nowrap border border-primary/40 shrink-0">
                <span>Upscaled</span>
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
               <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent border border-[#362348] text-[#ad92c9] text-sm font-medium hover:border-[#ad92c9] whitespace-nowrap shrink-0">
                <span>Model: Flux V1</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent border border-[#362348] text-[#ad92c9] text-sm font-medium hover:border-[#ad92c9] whitespace-nowrap shrink-0">
                <span>Ratio: 16:9</span>
              </button>
            </div>
            
            <div className="ml-auto flex gap-1 bg-[#362348] p-1 rounded-lg shrink-0">
              <button className="p-1.5 rounded bg-[#4a3061] text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button className="p-1.5 rounded hover:bg-[#4a3061]/50 text-[#ad92c9] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden border-t border-[#362348]">
          <AssetGrid 
            assets={assets} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
          <Inspector asset={selectedAsset} />
        </div>
      </main>

      <GenerateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGenerate={handleGenerate} 
      />
    </div>
  );
};

export default App;
