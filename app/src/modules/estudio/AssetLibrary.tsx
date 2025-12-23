import React from 'react'
import FilterSidebar from './components/FilterSidebar'
import AssetGrid from './components/AssetGrid'
import ActionsBar from './components/ActionsBar'

const AssetLibrary: React.FC = () => {
    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#050505] relative">
            <FilterSidebar />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20 backdrop-blur-sm z-10">
                    <h1 className="text-xl font-bold text-white tracking-tight">System Memory</h1>
                    <div className="flex gap-2">
                        <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none">
                            <option>Sort by Date: Newest</option>
                            <option>Sort by Date: Oldest</option>
                            <option>Sort by Rating</option>
                        </select>
                    </div>
                </header>

                <AssetGrid />
                <ActionsBar />
            </main>
        </div>
    )
}

export default AssetLibrary
