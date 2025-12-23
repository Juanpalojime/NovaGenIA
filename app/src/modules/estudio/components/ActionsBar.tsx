import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, Share2, X, Archive } from 'lucide-react'
import { useLibraryStore } from '../stores/useLibraryStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useGenerationStore } from '@/modules/creative/stores/useGenerationStore'

import { getApiUrl } from '@/lib/api'

const ActionsBar: React.FC = () => {
    const { selectedAssetIds, clearSelection, deleteAssets, assets } = useLibraryStore()
    const { addNotification } = useGlobalStore()
    const count = selectedAssetIds.length

    if (count === 0) return null

    const handleExport = async () => {
        try {
            const selectedAssets = assets.filter(a => selectedAssetIds.includes(a.id))

            if (selectedAssets.length === 1) {
                // Single image: direct download
                const asset = selectedAssets[0]
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
                addNotification({ type: 'success', message: 'Image exported!' })
            } else {
                // Multiple images: download each
                for (const asset of selectedAssets) {
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
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
                addNotification({ type: 'success', message: `${selectedAssets.length} images exported!` })
            }
        } catch (error) {
            addNotification({ type: 'error', message: 'Export failed' })
        }
    }

    const handleUpscale = async () => {
        const selectedAssets = assets.filter(a => selectedAssetIds.includes(a.id))

        if (selectedAssets.length === 0) return

        addNotification({ type: 'info', message: 'Starting Upscale x4...' })

        try {
            const apiUrl = getApiUrl()

            for (const asset of selectedAssets) {
                // Ensure we have a full URL for fetching, or base64 if available (assets usually have URL)
                const assetUrl = asset.url.startsWith('http') ? asset.url : `${apiUrl}${asset.url}`

                // Fetch image to get blob/base64
                const response = await fetch(assetUrl)
                const blob = await response.blob()
                const reader = new FileReader()

                reader.onloadend = async () => {
                    const base64data = reader.result as string

                    try {
                        const res = await fetch(`${apiUrl}/upscale`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: base64data })
                        })

                        if (res.ok) {
                            const data = await res.json()
                            addNotification({ type: 'success', message: `Upscaled image ready!` })
                            // Refresh library to see new image if backend saves it to gallery logic (Wait, upscale endpoint saves to disk but doesn't auto-add to JSON or returning standard format?)
                            // The backend returns { image: { url: ... }, status: "success" }
                            // We should add it to the library store manually here
                            if (data.image) {
                                useLibraryStore.getState().addAssets([{
                                    id: `upscale-${Date.now()}`,
                                    url: data.image.url.startsWith('http') ? data.image.url : `${apiUrl}${data.image.url}`,
                                    prompt: asset.prompt + " (Upscaled)",
                                    negativePrompt: asset.negativePrompt,
                                    width: asset.width * 4,
                                    height: asset.height * 4,
                                    createdAt: Date.now(),
                                    tags: ['upscaled', ...asset.tags],
                                    model: 'SD x4 Upscaler',
                                    isFavorite: false,
                                    seed: 0
                                }])
                            }
                        } else {
                            throw new Error("Upscale failed")
                        }
                    } catch (err) {
                        console.error(err)
                        addNotification({ type: 'error', message: 'Upscale API error' })
                    }
                }
                reader.readAsDataURL(blob)
            }
        } catch (error) {
            console.error('Upscale error:', error)
            addNotification({ type: 'error', message: 'Failed to process upscale request' })
        }
    }

    const handleBlend = async () => {
        const selectedAssets = assets.filter(a => selectedAssetIds.includes(a.id))
        if (selectedAssets.length !== 1) {
            addNotification({ type: 'warning', message: 'Select exactly one image to Remix/Blend' })
            return
        }

        const asset = selectedAssets[0]
        const apiUrl = getApiUrl()
        const assetUrl = asset.url.startsWith('http') ? asset.url : `${apiUrl}${asset.url}`

        try {
            const response = await fetch(assetUrl)
            const blob = await response.blob()
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64data = reader.result as string
                // Initialize Generation Store
                const genStore = useGenerationStore.getState()

                // Set Init Image
                genStore.setInitImage(base64data)

                // Set Tab to Img2Img (We need to expose setActiveTab or just know that the component defaults/handles params)
                // Since setActiveTab is local state in GenerationPanel, we can't change it from here easily.
                // However, we can set param 'initImage' which visualizes in the store.
                // To force the UI to switch, we might need a global navigation or 'intent' state.
                // For now, setting initImage is enough, user asks to remix, we take them to generation.
                // The GenerationPanel needs to see initImage is set and maybe auto-switch?
                // Or we can assume user manually switches. 
                // BETTER: We just notify "Image sent to Remix"

                addNotification({ type: 'success', message: 'Image sent to Remix! Go to "Creative" tab.' })
            }
            reader.readAsDataURL(blob)
        } catch (e) {
            console.error(e)
            addNotification({ type: 'error', message: 'Failed to load image for blend' })
        }
    }

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
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white transition-colors text-xs font-medium"
                    >
                        <Download size={14} /> Export
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button
                        onClick={handleUpscale}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-neon-cyan/20 hover:text-neon-cyan rounded-lg text-white transition-colors text-xs font-medium group"
                    >
                        <Archive size={14} /> Upscale 4x
                        <span className="text-[10px] bg-neon-cyan/20 px-1 rounded text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">PRO</span>
                    </button>

                    <button
                        onClick={handleBlend}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-neon-magenta/20 hover:text-neon-magenta rounded-lg text-white transition-colors text-xs font-medium"
                    >
                        <Share2 size={14} /> Blend / Remix
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button
                        onClick={() => deleteAssets(selectedAssetIds)}
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
