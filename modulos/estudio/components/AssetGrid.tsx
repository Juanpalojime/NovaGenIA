import React from 'react';
import { Asset } from '../types';

interface AssetGridProps {
  assets: Asset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({ assets, selectedId, onSelect }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background-dark custom-scrollbar">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map((asset) => (
          <div 
            key={asset.id}
            onClick={() => !asset.isProcessing && onSelect(asset.id)}
            className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all bg-surface-dark
              ${asset.id === selectedId ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'hover:ring-2 hover:ring-[#ad92c9]'}
              ${asset.isProcessing ? 'border border-[#362348] cursor-wait' : ''}
            `}
          >
            {asset.isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-white text-xs font-bold tracking-wide">GENERATING</p>
                <p className="text-[#ad92c9] text-[10px] mt-1 mb-2 font-mono">{asset.progress || 0}%</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#362348] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(127,19,236,0.6)]" 
                    style={{ width: `${asset.progress || 5}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                  </button>
                  {asset.id === selectedId && (
                     <button className="size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    </button>
                  )}
                </div>
                
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src={asset.url} 
                  alt={asset.title} 
                />
                
                <div className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent transition-opacity ${asset.id === selectedId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <p className="text-white text-xs font-medium truncate">{asset.title}</p>
                  {asset.id === selectedId && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-primary/80 px-1.5 py-0.5 rounded text-white font-mono">{asset.dimensions}</span>
                      <span className="text-[10px] text-gray-300 font-mono">{asset.version}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        
        {/* Fillers to make the grid look populated if few items */}
        {[1, 2, 3].map((i) => (
             <div key={`filler-${i}`} className="group relative aspect-square rounded-xl overflow-hidden bg-surface-dark opacity-30">
               <div className="w-full h-full bg-[#362348]"></div>
             </div>
        ))}
      </div>
    </div>
  );
};
