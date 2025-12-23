import React from 'react'
import { Search, Tag, Calendar, FolderHeart, HardDrive } from 'lucide-react'
import { useLibraryStore } from '../stores/useLibraryStore'
import { clsx } from 'clsx'

const FilterSidebar: React.FC = () => {
    const { searchTerm, setSearchTerm } = useLibraryStore()

    const categories = [
        { name: 'All Assets', icon: HardDrive, active: true },
        { name: 'Favorites', icon: FolderHeart, count: 12 },
        { name: 'This Month', icon: Calendar, count: 85 },
    ]

    const tags = ['Cyberpunk', 'Portrait', 'Landscape', 'Anime', 'Realistic', 'Sketch', 'Logo']

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
                        key={cat.name}
                        className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                            cat.active ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <cat.icon size={16} />
                            <span>{cat.name}</span>
                        </div>
                        {cat.count && <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-white">{cat.count}</span>}
                    </button>
                ))}
            </div>

            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Smart Tags</div>
                <div className="flex flex-wrap gap-2 px-1">
                    {tags.map(tag => (
                        <button key={tag} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/5 bg-white/5 text-xs text-gray-400 hover:border-neon-magenta/50 hover:text-neon-magenta transition-all">
                            <Tag size={10} />
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FilterSidebar
