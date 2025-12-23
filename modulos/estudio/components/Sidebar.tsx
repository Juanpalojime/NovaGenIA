import React from 'react';
import { Asset } from '../types';

interface SidebarProps {
  recentAssets?: Asset[];
}

export const Sidebar: React.FC<SidebarProps> = ({ recentAssets = [] }) => {
  // Filter for assets that are either processing or created recently (mock check by ensuring they have an ID)
  // We take the top 5
  const historyItems = recentAssets.slice(0, 5);

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1a1122] border-r border-[#362348] flex flex-col h-full z-20">
      <div className="p-5 flex items-center gap-3">
        <div className="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
          </svg>
        </div>
        <div>
          <h1 className="text-white text-base font-bold leading-tight tracking-tight">NeoGen</h1>
          <p className="text-[#ad92c9] text-xs font-normal">Estudio Pro</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <NavItem icon="dashboard" label="Overview" />
        
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-[#ad92c9] uppercase tracking-wider">Library</div>
        <NavItem icon="image" label="Images" active />
        <NavItem icon="movie" label="Videos" />
        <NavItem icon="inventory_2" label="Models" />
        <NavItem icon="view_quilt" label="Moodboards" />
        
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-[#ad92c9] uppercase tracking-wider">Collections</div>
        <NavItem icon="star" label="Favorites" />
        <NavItem icon="history" label="Recent" />
        <NavItem icon="delete" label="Trash" />

        {/* New Generation History Section */}
        {historyItems.length > 0 && (
          <>
            <div className="pt-6 pb-2 px-3 text-xs font-bold text-[#ad92c9] uppercase tracking-wider">Generation History</div>
            <div className="space-y-1">
              {historyItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#ad92c9] hover:bg-[#362348] hover:text-white transition-colors cursor-pointer group">
                  <div className={`size-2 rounded-full shrink-0 ${item.isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate font-medium">{item.title}</p>
                    <p className="text-[10px] opacity-60 truncate">{item.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-[#362348]">
        <div className="flex items-center gap-3">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-[#362348]" 
               style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBpmxR9n1ku4VmhJlL21y5tubE0ZgIabgt9p2hxBLRhBBdCdlrGx3o_YhaMtAIABWU5eGkE83vZEJQpwKiKYO0ALu8MqTUdQSU8e2dXCx46UBZUJrE4UjYUQgOMNSQuUOXy_zd38mvJtJyVxFaw6lJJ3wOxdUZNvQRnSrfmqqHVrEKE4mpCZndkVhERsrfIQsw5FYPfvQtdNbaYqLhOLRMpZuOJUnjxxGW7E3hWcH_iMs_v2BnshCS01d7kQImhSSzAmJWmc5hTt4M")'}}>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-bold">Alex Chen</span>
            <span className="text-[#ad92c9] text-xs">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{icon: string, label: string, active?: boolean}> = ({icon, label, active}) => {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-[#362348] text-white' : 'text-[#ad92c9] hover:bg-[#362348] hover:text-white'}`}>
      <span className={`material-symbols-outlined text-[20px] ${active ? 'fill-1' : ''}`}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};
