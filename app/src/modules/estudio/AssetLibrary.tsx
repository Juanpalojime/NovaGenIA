import React, { useState } from 'react'
import FilterSidebar from './components/FilterSidebar'
import AssetGrid from './components/AssetGrid'
import ActionsBar from './components/ActionsBar'
import { useLibraryStore } from './stores/useLibraryStore'

const AssetLibrary: React.FC = () => {
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest')
    const { assets, setAssets } = useLibraryStore()

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value as 'newest' | 'oldest' | 'rating'
        setSortBy(newSort)

        const sortedAssets = [...assets].sort((a, b) => {
            if (newSort === 'newest') {
                return b.createdAt - a.createdAt
            } else if (newSort === 'oldest') {
                return a.createdAt - b.createdAt
            } else {
                // Sort by favorites first, then by date
                if (a.isFavorite && !b.isFavorite) return -1
                if (!a.isFavorite && b.isFavorite) return 1
                return b.createdAt - a.createdAt
            }
        })

        setAssets(sortedAssets)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#050505] relative">
            <FilterSidebar />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20 backdrop-blur-sm z-10">
                    <h1 className="text-xl font-bold text-white tracking-tight">System Memory</h1>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-neon-cyan cursor-pointer"
                        >
                            <option value="newest">Sort by Date: Newest</option>
                            <option value="oldest">Sort by Date: Oldest</option>
                            <option value="rating">Sort by Rating</option>
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
