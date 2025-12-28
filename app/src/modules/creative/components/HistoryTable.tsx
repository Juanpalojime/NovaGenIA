import React, { useState } from 'react'
import { Clock, Copy, Trash2 } from 'lucide-react'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { useGlobalStore } from '@/store/useGlobalStore'

export const HistoryTable: React.FC = () => {
    const { assets, removeAsset } = useLibraryStore()
    const { addNotification } = useGlobalStore()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredAssets = assets
        .filter(a => a.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10) // Show last 10

    const handleCopyPrompt = (text: string) => {
        navigator.clipboard.writeText(text)
        addNotification({ type: 'success', message: 'Prompt copied!' })
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('Delete this entry?')) {
            removeAsset(id)
            addNotification({ type: 'success', message: 'Deleted' })
        }
    }

    return (
        <div className="bg-surface/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Generation History</h3>
                </div>
                <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-primary/50 w-48"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-bold border-b border-white/5">
                            <th className="px-4 py-3 w-16 text-center">Preview</th>
                            <th className="px-4 py-3">Prompt</th>
                            <th className="px-4 py-3 w-24">Model</th>
                            <th className="px-4 py-3 w-20">Size</th>
                            <th className="px-4 py-3 w-32">Date</th>
                            <th className="px-4 py-3 w-20 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-xs">
                                    No history found. Start generating!
                                </td>
                            </tr>
                        ) : (
                            filteredAssets.map((asset) => (
                                <tr key={asset.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/20 relative">
                                            <img
                                                src={asset.url}
                                                alt="thumbnail"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3C/svg%3E'
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <p className="text-xs text-gray-300 font-medium line-clamp-1">{asset.prompt}</p>
                                        <div className="flex gap-1 mt-0.5">
                                            {asset.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[9px] bg-white/5 px-1 rounded text-gray-500">#{tag}</span>
                                            ))}
                                            <span className="text-[9px] text-gray-600">Seed: {asset.seed}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {asset.model || 'SDXL'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-xs text-gray-400 font-mono">{asset.width}x{asset.height}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-xs text-gray-500">{new Date(asset.createdAt).toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopyPrompt(asset.prompt)}
                                                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                                title="Copy Prompt"
                                            >
                                                <Copy size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(asset.id, e)}
                                                className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {assets.length > 10 && (
                <div className="p-2 border-t border-white/5 bg-black/20 text-center">
                    <button className="text-xs text-xs text-primary hover:text-primary-light transition-colors">
                        View All in Library
                    </button>
                </div>
            )}
        </div>
    )
}
