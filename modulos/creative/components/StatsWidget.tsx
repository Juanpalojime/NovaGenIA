import React from 'react';

const StatsWidget: React.FC = () => {
  return (
    <div className="lg:col-span-1 flex flex-col gap-4">
      <div className="flex-1 rounded-xl bg-surface-dark border border-surface-highlight p-5 flex items-center justify-between relative overflow-hidden">
        <div className="flex flex-col gap-1 z-10">
          <p className="text-text-secondary text-xs uppercase font-bold tracking-wider">Credits Remaining</p>
          <p className="text-white text-3xl font-bold">850</p>
          <div className="flex items-center gap-1 text-[#fa6f38] text-xs font-medium">
            <span className="material-symbols-outlined text-xs">trending_down</span>
            <span>-15% this week</span>
          </div>
        </div>
        {/* Circular Progress Visual */}
        <div className="relative size-16 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path className="text-surface-highlight" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
            <path className="text-primary drop-shadow-[0_0_5px_rgba(127,19,236,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="70, 100" strokeLinecap="round" strokeWidth="3"></path>
          </svg>
        </div>
      </div>
      <div className="flex-1 flex gap-4">
        <div className="flex-1 rounded-xl bg-surface-dark border border-surface-highlight p-4 flex flex-col justify-center gap-1">
          <div className="text-primary mb-1"><span className="material-symbols-outlined">workspace_premium</span></div>
          <p className="text-text-secondary text-xs font-bold uppercase">Current Tier</p>
          <p className="text-white text-lg font-bold">Pro</p>
        </div>
        <div className="flex-1 rounded-xl bg-surface-dark border border-surface-highlight p-4 flex flex-col justify-center gap-1">
          <div className="text-[#0bda73] mb-1"><span className="material-symbols-outlined">task</span></div>
          <p className="text-text-secondary text-xs font-bold uppercase">Active Tasks</p>
          <p className="text-white text-lg font-bold">2</p>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
