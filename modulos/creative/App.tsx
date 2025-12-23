import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StatsWidget from './components/StatsWidget';
import ProjectGrid from './components/ProjectGrid';
import Generator from './components/Generator';
import { Project } from './types';

const App: React.FC = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const handleProjectCreated = (project: Project) => {
    setRecentProjects(prev => [project, ...prev]);
  };

  return (
    <div className="flex h-screen w-full font-body">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-6 py-8 max-w-[1200px] flex flex-col gap-8 z-10">
          
          {/* Header Section */}
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-text-secondary text-sm font-medium tracking-wider uppercase">Overview</p>
              <h1 className="text-white text-4xl font-bold leading-tight font-display">Welcome back, Alex</h1>
              <p className="text-text-secondary text-base">Ready to create something extraordinary today?</p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full max-w-md">
              <div className="flex w-full items-center rounded-lg bg-surface-dark border border-surface-highlight h-12 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="pl-4 pr-2 text-text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none text-white placeholder-text-secondary focus:ring-0 h-full text-sm focus:outline-none" 
                  placeholder="Search projects, assets, or models..." 
                />
              </div>
            </div>
          </header>

          {/* Hero / Quick Create Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Generator onProjectCreated={handleProjectCreated} />
            <StatsWidget />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
            
            {/* Recent Projects (Left, Larger) */}
            <ProjectGrid projects={recentProjects} />

            {/* Quick Access / Tools (Right, Smaller) */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              <h3 className="text-white text-xl font-bold font-display">Quick Access</h3>
              
              {/* Tool Card 1 */}
              <a href="#" className="flex flex-col gap-2 p-4 rounded-xl bg-surface-dark border border-surface-highlight hover:border-primary/50 hover:bg-surface-highlight transition-all group">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
                    <span className="material-symbols-outlined">folder_special</span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <div>
                  <h4 className="text-white font-bold">Asset Library</h4>
                  <p className="text-text-secondary text-xs">Manage your 3k+ assets</p>
                </div>
              </a>

              {/* Tool Card 2 */}
              <a href="#" className="flex flex-col gap-2 p-4 rounded-xl bg-surface-dark border border-surface-highlight hover:border-primary/50 hover:bg-surface-highlight transition-all group">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined">model_training</span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <div>
                  <h4 className="text-white font-bold">Training Center</h4>
                  <p className="text-text-secondary text-xs">Train new LoRA models</p>
                </div>
              </a>

              {/* Notification Card */}
              <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-[#2a1b36] to-surface-dark border border-surface-highlight">
                <div className="flex items-start gap-3">
                  <span className="relative flex size-2.5 mt-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2.5 bg-green-500"></span>
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">System Update v4.2</p>
                    <p className="text-text-secondary text-xs mt-1">New upscaler model is now live. Try it on your next project.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
