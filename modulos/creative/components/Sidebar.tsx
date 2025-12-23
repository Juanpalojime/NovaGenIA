import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-surface-dark border-r border-surface-highlight flex-shrink-0">
      <div className="flex flex-col gap-6 p-6 h-full">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-[0_0_15px_rgba(127,19,236,0.5)]" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAn6Vk_MuDvUPQj5gEtDWdjs2tYr4y5J8A4c1IalGpujKoevz_mb8iS9UPabn9Zqoq7fj8kduBtTZ8RsWM_myqmhHDBHeQUAypHDWK1XO5LDlnknfHPDU9jda9gKM-74yoKeeOMqnQnSKSXo2-fuL7GyqBxzcnB0qesjqplr-zkzS6zWYvHpy2ml3ch5Q0kWnqzODJnmiwF46Ydr7EFOA2zMpe1fkfdQzUIHaJ4tce9_KvjHYSlSxxfphClPyKqeIRKBBCgWM-jiZQ")' }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-none tracking-wide">NeoGen</h1>
            <p className="text-text-secondary text-xs font-normal">Creative Studio v4.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/20 border-l-4 border-primary group transition-all">
            <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">dashboard</span>
            <p className="text-white text-sm font-medium">Dashboard</p>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-highlight group transition-all">
            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">palette</span>
            <p className="text-text-secondary group-hover:text-white text-sm font-medium">El Estudio</p>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-highlight group transition-all">
            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">folder_open</span>
            <p className="text-text-secondary group-hover:text-white text-sm font-medium">Biblioteca de Activos</p>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-highlight group transition-all">
            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">memory</span>
            <p className="text-text-secondary group-hover:text-white text-sm font-medium">Centro de Entrenamiento</p>
          </a>
          
          <div className="h-px w-full bg-surface-highlight my-2"></div>
          
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-highlight group transition-all">
            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">settings</span>
            <p className="text-text-secondary group-hover:text-white text-sm font-medium">Settings</p>
          </a>
        </nav>

        {/* User Profile Snippet */}
        <div className="mt-auto flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-highlight border border-white/5">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-blue-500 overflow-hidden">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover opacity-80" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJftE-gsVM-cRR4N1_zkIbcnCfSqYRzYYrL6a7Ye06VFjWdcHFeDfZ_FvNk1Q1_rvIwTaNwiQMfjXnm8Ami4dK4wXAkxSVuqurod-2SrKgpccumnMNF_LUyO_Xv2ZNQCbpuUgevF4f9CI5zjzQKJeg3_AF-PMJlux8WK3W6Ng80jZ1BIM9NV0978LngaLUPXmSdAAkZ9EHrUiqlCQPDoYmDltY1J_V9Ih_O8vYhcqdJy7ICRrneQVaHDp2r4q9k1lGuZ3YeCerbhQ"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-white text-sm font-medium truncate">Alex Designer</p>
            <p className="text-text-secondary text-xs truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
