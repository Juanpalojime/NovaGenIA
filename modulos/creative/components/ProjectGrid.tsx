import React from 'react';
import { Project } from '../types';

interface ProjectGridProps {
  projects: Project[];
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="xl:col-span-3 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary">history</span>
          Recent Projects
        </h3>
        <button className="text-primary text-sm font-bold hover:text-white transition-colors">View All</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Render Projects from State */}
        {projects.map((project) => (
          <div key={project.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-dark border border-surface-highlight cursor-pointer">
            {project.status === 'processing' ? (
              <>
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-highlight/20 backdrop-blur-sm z-10">
                  <span className="material-symbols-outlined text-primary animate-spin text-4xl mb-2">progress_activity</span>
                  <p className="text-white font-medium text-sm">Rendering...</p>
                </div>
                <div 
                  className="w-full h-full bg-cover bg-center opacity-50 grayscale" 
                  style={{ backgroundImage: `url('https://picsum.photos/400/300?blur=5')` }}
                ></div>
              </>
            ) : (
              <>
                <div className="absolute top-2 left-2 z-10">
                   {/* Optional badge logic could go here */}
                   <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">New</span>
                </div>
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: `url('${project.imageUrl}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-bold truncate">{project.title}</p>
                  <p className="text-text-secondary text-xs">{project.timestamp}</p>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Static Sample Projects for Visual Fidelity matching the request */}
        <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-dark border border-surface-highlight cursor-pointer">
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">Upscaled</span>
          </div>
          <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIuHcyKNa3noS0jNzHpuH3UpNqIapDqmCJaeLQVyiUeewyLoQA1HLd6M-l679UtoS8ZUgPGhFCJMqjymAAQrgqJt6j-LdXhwCgVDZgkj5Bd7f4lZFqaouK45M8pvzngVtFSXmbU7XhTUev6to_EWu-IxX3NrYfc-4PvUeg90eTPa1NbDElJubsapte13JKYR5PhjXzB7F9D96-vLJpnUqrKVeWrQuRSVej6cPluakMlST18iQXuAC6QgSMxIMK7cdpg9VVF8gtAFQ')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <p className="text-white font-bold truncate">Neon Tokyo V2</p>
            <p className="text-text-secondary text-xs">Edited 2h ago</p>
          </div>
        </div>

        <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-dark border border-surface-highlight cursor-pointer">
          <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCG8nM8jfHO3zQow1cnDECxm1FR5cnnxZuwYdmUSv7TrsRhPr6cSZ3SlRVUbbSnPh5wkfmgC2JiuzyjzUJSjbHdbAnQ0EF-lnDObi008RqQqB_DN5J7Y8cXVzLeInDOiFmkrLNAdDhqrCzmrAEdRtkMzB-IupIj0iZ9d23009NvVxIQVT6kJq2npUKOtsGnMshFj8_ZMGHF1tr6bK4dATV_W8IN1DwFkVOllu6v0hcHWWibPIoq3nbTfxVgxLP2eAScIYlUUUVKJGY')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <p className="text-white font-bold truncate">Iridescent Flux</p>
            <p className="text-text-secondary text-xs">Edited 5h ago</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectGrid;
