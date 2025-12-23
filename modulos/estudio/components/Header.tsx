import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between border-b border-[#362348] bg-[#1a1122]/95 backdrop-blur-sm px-6 py-3 z-10 shrink-0">
      <div className="flex items-center gap-2">
        <a href="#" className="text-[#ad92c9] text-sm font-medium hover:text-white transition-colors">Library</a>
        <span className="text-[#ad92c9] text-sm font-medium">/</span>
        <a href="#" className="text-[#ad92c9] text-sm font-medium hover:text-white transition-colors">Projects</a>
        <span className="text-[#ad92c9] text-sm font-medium">/</span>
        <span className="text-white text-sm font-medium">Cyberpunk City Assets</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center justify-center size-9 rounded-lg bg-[#362348] text-white hover:bg-[#4a3061] transition-colors relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-[#362348]"></span>
        </button>
        <button className="flex items-center justify-center size-9 rounded-lg bg-[#362348] text-white hover:bg-[#4a3061] transition-colors">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
  );
};
