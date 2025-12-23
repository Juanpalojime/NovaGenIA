import React from 'react';
import { Hexagon, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark bg-surface-light dark:bg-background-dark px-4 md:px-10 py-3 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="size-8 text-primary">
            <Hexagon className="w-full h-full fill-current" strokeWidth={1.5} />
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">NeoGen Estudio</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8 items-center">
        <div className="hidden md:flex items-center gap-9">
          <a className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Dashboard</a>
          <a className="text-primary dark:text-white text-sm font-medium leading-normal" href="#">Training Center</a>
          <a className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Gallery</a>
          <a className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Settings</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-full size-10 text-slate-600 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Bell size={20} />
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/50 cursor-pointer" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbn-_2D4m_w6redlDDeoEe9OtJgHL2UgvrOLnztgJGR_AfoIPn-ogIGV6494LEz0LaXfRzR8eLk2aUny_GR9qOFJg4rk7Nem2zEiYx2EIEJEqEUfji9Yu82pw7Fsm4J_4BL0LCFm5F8re8k-e9qZoDw7uTQ81e2ANRVWJNs_gaaqOuiNfi-rgbsSfG1hoQWpUtVWWGee3b1EVjli0c798M8AvWTq2JkAKntmz8wWoSNzth5lNfHxOlE26vvPySKyJ8WKakDJ1hl0k")'}}></div>
        </div>
      </div>
    </header>
  );
};