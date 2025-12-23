import React, { useEffect, useState } from 'react'
import { MoreHorizontal, Download, Copy, Eye, Trash2 } from 'lucide-react'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import type { Asset } from '@/modules/estudio/stores/useLibraryStore'

const RecentProjects: React.FC = () => {
    const { assets, fetchLibrary, removeAsset } = useLibraryStore()
    const { addNotification } = useGlobalStore()
    const [recentAssets, setRecentAssets] = useState<Asset[]>([])
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    useEffect(() => {
        fetchLibrary()
    }, [fetchLibrary])

    useEffect(() => {
        // Get the 4 most recent assets
        setRecentAssets(assets.slice(0, 4))
    }, [assets])

    const handleDownload = async (asset: Asset) => {
        try {
            const response = await fetch(asset.url)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `novagen-${asset.id}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            addNotification({ type: 'success', message: 'Image downloaded!' })
        } catch (error) {
            addNotification({ type: 'error', message: 'Failed to download image' })
        }
        setOpenMenuId(null)
    }

    const handleCopyPrompt = (asset: Asset) => {
        navigator.clipboard.writeText(asset.prompt)
        addNotification({ type: 'success', message: 'Prompt copied to clipboard!' })
        setOpenMenuId(null)
    }

    const handleViewDetails = (asset: Asset) => {
        addNotification({
            type: 'info',
            message: `${asset.width}x${asset.height} • Seed: ${asset.seed} • ${asset.model}`
        })
        setOpenMenuId(null)
    }

    const handleDelete = (asset: Asset) => {
        if (confirm('¿Eliminar esta imagen?')) {
            removeAsset(asset.id)
            addNotification({ type: 'success', message: 'Image deleted' })
        }
        setOpenMenuId(null)
    }

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

                        {/* Menu Button */}
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === asset.id ? null : asset.id)
                                }}
                                className="p-1.5 bg-black/60 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            >
                                <MoreHorizontal size={14} className="text-white" />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuId === asset.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-black/95 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-md">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDownload(asset)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Download size={12} />
                                        Download
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCopyPrompt(asset)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Copy size={12} />
                                        Copy Prompt
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleViewDetails(asset)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Eye size={12} />
                                        View Details
                                    </button>
                                    <div className="border-t border-white/10" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(asset)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

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
