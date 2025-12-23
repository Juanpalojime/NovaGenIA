import React from 'react';
import { Asset } from '../types';

interface InspectorProps {
  asset: Asset | null;
}

export const Inspector: React.FC<InspectorProps> = ({ asset }) => {
  if (!asset) return (
    <aside className="w-80 border-l border-[#362348] bg-[#1a1122] flex flex-col items-center justify-center p-8 hidden lg:flex">
      <span className="text-text-muted text-sm">Select an asset to view details</span>
    </aside>
  );

  return (
    <aside className="w-80 border-l border-[#362348] bg-[#1a1122] flex flex-col overflow-y-auto hidden lg:flex shrink-0">
      <div className="p-5 border-b border-[#362348]">
        <h3 className="text-white text-lg font-bold">Inspector</h3>
        <p className="text-[#ad92c9] text-xs mt-1">{asset.title}</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Prompt Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[#ad92c9] text-xs font-bold uppercase tracking-wider">Prompt</label>
            <button className="text-primary hover:text-white text-xs flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
            </button>
          </div>
          <div className="bg-[#362348] p-3 rounded-lg text-xs text-gray-200 leading-relaxed font-mono border border-transparent hover:border-[#ad92c9] transition-colors cursor-text break-words">
            {asset.prompt}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <label className="text-[#ad92c9] text-xs font-bold uppercase tracking-wider">Negative Prompt</label>
          </div>
          <div className="bg-[#362348]/50 p-2 rounded-lg text-xs text-gray-400 font-mono break-words">
            {asset.negativePrompt || 'None'}
          </div>
        </div>

        {/* Technical Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Dimensions" value={asset.dimensions} />
          <StatItem label="Seed" value={asset.seed} mono />
          <StatItem label="Sampler" value={asset.sampler} />
          <StatItem label="Steps" value={asset.steps.toString()} />
          <StatItem label="CFG Scale" value={asset.cfgScale.toString()} />
          <StatItem label="Model" value={asset.model} />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#362348] hover:bg-[#4a3061] text-white text-xs font-bold transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span> Download
          </button>
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#362348] hover:bg-[#4a3061] text-white text-xs font-bold transition-colors">
            <span className="material-symbols-outlined text-[16px]">share</span> Share
          </button>
        </div>
      </div>

      {/* Version History (Mocked for visual completeness) */}
      <div className="flex-1 border-t border-[#362348] p-5">
        <label className="text-[#ad92c9] text-xs font-bold uppercase tracking-wider mb-4 block">Version History</label>
        <div className="space-y-3">
          <div className="flex gap-3 items-center p-2 rounded-lg bg-[#362348] border border-primary/50 cursor-pointer">
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" src={asset.url} alt="Current Version" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold">{asset.version}</p>
              <p className="text-[#ad92c9] text-[10px]">{asset.createdAt}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const StatItem: React.FC<{label: string, value: string, mono?: boolean}> = ({label, value, mono}) => (
  <div className="space-y-1">
    <span className="text-[#ad92c9] text-[10px] uppercase">{label}</span>
    <p className={`text-white text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
  </div>
);
