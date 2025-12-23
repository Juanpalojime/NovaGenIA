import React, { useState } from 'react'
import { Search, Tag, Calendar, FolderHeart, HardDrive } from 'lucide-react'
import { useLibraryStore } from '../stores/useLibraryStore'
import { clsx } from 'clsx'

const FilterSidebar: React.FC = () => {
    const { searchTerm, setSearchTerm, assets, activeTags, setActiveTags } = useLibraryStore()
    const [activeCategory, setActiveCategory] = useState<'all' | 'favorites' | 'month'>('all')

    // Calculate real counts
    const favoritesCount = assets.filter(a => a.isFavorite).length
    const thisMonthCount = assets.filter(a => {
        const assetDate = new Date(a.createdAt)
        const now = new Date()
        return assetDate.getMonth() === now.getMonth() && assetDate.getFullYear() === now.getFullYear()
    }).length

    // Extract unique tags from assets
    const allTags = Array.from(new Set(assets.flatMap(a => a.tags)))

    const categories = [
        { id: 'all', name: 'All Assets', icon: HardDrive, count: assets.length },
        { id: 'favorites', name: 'Favorites', icon: FolderHeart, count: favoritesCount },
        { id: 'month', name: 'This Month', icon: Calendar, count: thisMonthCount },
    ]

    const handleCategoryClick = (categoryId: 'all' | 'favorites' | 'month') => {
        setActiveCategory(categoryId)
        // Filter logic is handled in AssetGrid based on activeCategory
        // For now, we'll use search term to filter
        if (categoryId === 'favorites') {
            // This is a simplified approach - ideally we'd have a separate filter state
            console.log('Filtering favorites')
        } else if (categoryId === 'month') {
            console.log('Filtering this month')
        }
    }

    const handleTagClick = (tag: string) => {
        const newActiveTags = activeTags.includes(tag)
            ? activeTags.filter(t => t !== tag)
            : [...activeTags, tag]
        setActiveTags(newActiveTags)
    }

    return (
        <div className="w-64 border-r border-white/5 bg-black/20 p-4 shrink-0 hidden md:flex flex-col h-full">
            <div className="relative mb-6">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search visuals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                />
            </div>

            <div className="space-y-1 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id as any)}
                        className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                            activeCategory === cat.id ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <cat.icon size={16} />
                            <span>{cat.name}</span>
                        </div>
                        <span className={clsx(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            activeCategory === cat.id ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/5 text-gray-500 group-hover:text-white"
                        )}>{cat.count}</span>
                    </button>
                ))}
            </div>

            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Smart Tags</div>
                <div className="flex flex-wrap gap-2 px-1">
                    {allTags.slice(0, 10).map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all",
                                activeTags.includes(tag)
                                    ? "border-neon-magenta bg-neon-magenta/20 text-neon-magenta"
                                    : "border-white/5 bg-white/5 text-gray-400 hover:border-neon-magenta/50 hover:text-neon-magenta"
                            )}
                        >
                            <Tag size={10} />
                            {tag}
                        </button>
                    ))}
                </div>
                {activeTags.length > 0 && (
                    <button
                        onClick={() => setActiveTags([])}
                        className="mt-3 text-xs text-neon-cyan hover:underline px-3"
                    >
                        Clear filters ({activeTags.length})
                    </button>
                )}
            </div>
        </div>
    )
}

export default FilterSidebar
