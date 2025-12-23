import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, Share2, X, Archive } from 'lucide-react'
import { useLibraryStore } from '../stores/useLibraryStore'

const ActionsBar: React.FC = () => {
    const { selectedAssetIds, clearSelection, deleteAssets } = useLibraryStore()
    const count = selectedAssetIds.size

    if (count === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-neon-cyan/30 rounded-full px-6 py-3 flex items-center gap-6 shadow-[0_0_30px_rgba(0,243,255,0.15)] z-30"
            >
                <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <span className="text-neon-cyan font-bold font-mono text-lg">{count}</span>
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Selected</span>
                    <button onClick={clearSelection} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2">
                        <X size={14} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white transition-colors text-xs font-medium">
                        <Download size={14} /> Export
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-neon-cyan/20 hover:text-neon-cyan rounded-lg text-white transition-colors text-xs font-medium group">
                        <Archive size={14} /> Upscale 4x
                        <span className="text-[10px] bg-neon-cyan/20 px-1 rounded text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">PRO</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-neon-magenta/20 hover:text-neon-magenta rounded-lg text-white transition-colors text-xs font-medium">
                        <Share2 size={14} /> Blend / Remix
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button
                        onClick={() => deleteAssets(Array.from(selectedAssetIds))}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ActionsBar
