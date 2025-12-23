import React, { useEffect, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import type { Asset } from '@/modules/estudio/stores/useLibraryStore'

const RecentProjects: React.FC = () => {
    const { assets, fetchLibrary } = useLibraryStore()
    const [recentAssets, setRecentAssets] = useState<Asset[]>([])

    useEffect(() => {
        fetchLibrary()
    }, [fetchLibrary])

    useEffect(() => {
        // Get the 4 most recent assets
        setRecentAssets(assets.slice(0, 4))
    }, [assets])

    if (recentAssets.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Recent Generations</h3>
                </div>
                <div className="text-sm text-gray-500 text-center py-8">
                    No generations yet. Create your first image!
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Generations</h3>
                <button className="text-xs text-neon-cyan hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentAssets.map((asset) => (
                    <div key={asset.id} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-neon-cyan/50 transition-all cursor-pointer">
                        <img
                            src={asset.url}
                            alt={asset.prompt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback for broken images
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3C/svg%3E'
                            }}
                        />

                        <button className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} />
                        </button>

                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <div className="text-xs font-medium text-white truncate">{asset.prompt}</div>
                            <div className="text-[10px] text-gray-400">
                                {new Date(asset.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentProjects
