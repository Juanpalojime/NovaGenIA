import React from 'react'
import { clsx } from 'clsx'
import { Heart, Copy, Maximize2 } from 'lucide-react'
import { useLibraryStore } from '../stores/useLibraryStore'
import type { Asset } from '../stores/useLibraryStore'
import { motion } from 'framer-motion'

const AssetCard: React.FC<{ asset: Asset; selected: boolean }> = ({ asset, selected }) => {
    const { toggleSelection, toggleFavorite } = useLibraryStore()

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            className={clsx(
                "group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-200",
                selected ? "border-neon-cyan shadow-neon-cyan ring-1 ring-neon-cyan/20" : "border-white/5 hover:border-white/20 hover:shadow-2xl"
            )}
            onClick={(e) => toggleSelection(asset.id, e.ctrlKey || e.metaKey)}
            style={{ aspectRatio: asset.width / asset.height }}
        >
            <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover block" loading="lazy" />

            {/* Dynamic Hover Overlay - "Smart Preview" */}
            <div className={clsx(
                "absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4",
                selected && "opacity-100 bg-neon-cyan/10"
            )}>
                <div className="flex justify-between items-start translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                    <div
                        className={clsx(
                            "w-5 h-5 rounded border flex items-center justify-center transition-all cursor-default",
                            selected ? "bg-neon-cyan border-neon-cyan" : "border-white/30 hover:border-white"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleSelection(asset.id, true) }}
                    >
                        {selected && <div className="w-2 h-2 bg-black rounded-sm" />}
                    </div>

                    <button className="p-2 rounded-full bg-black/50 hover:bg-neon-magenta hover:text-black text-white transition-colors" title="Like">
                        <Heart size={14} className={clsx(asset.isFavorite && "fill-current text-neon-magenta")} onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.id) }} />
                    </button>
                </div>

                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {asset.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 border border-white/5">#{tag}</span>
                        ))}
                    </div>
                    <p className="text-xs text-white/90 font-medium line-clamp-2 mb-2">{asset.prompt}</p>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <button className="flex-1 py-1.5 bg-neon-cyan text-black text-xs font-bold rounded hover:bg-white transition-colors flex items-center justify-center gap-2">
                            <Maximize2 size={12} /> Edit in Studio
                        </button>
                        <button className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white" title="Copy Seed">
                            <Copy size={12} />
                        </button>
                    </div>
                </div>
            </div>

        </motion.div>
    )
}

const AssetGrid: React.FC = () => {
    const { assets, selectedAssetIds, fetchLibrary } = useLibraryStore()

    React.useEffect(() => {
        fetchLibrary()
    }, [fetchLibrary])

    // Simple masonry simulation manually splitting columns for now
    // In production use 'react-masonry-css' or similar
    const columns = 4
    const columnWrapper = Array.from({ length: columns }, () => [] as Asset[])

    assets.forEach((asset, i) => {
        columnWrapper[i % columns].push(asset)
    })

    return (
        <div className="flex-1 p-6 h-full overflow-y-auto custom-scrollbar">
            <div className="flex gap-4">
                {columnWrapper.map((colAssets, colIndex) => (
                    <div key={colIndex} className="flex-1 flex flex-col gap-4">
                        {colAssets.map(asset => (
                            <AssetCard key={asset.id} asset={asset} selected={selectedAssetIds.includes(asset.id)} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssetGrid
