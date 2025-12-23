import React, { useState, useRef } from 'react'
import { Send, Clock, Book, Tag, CheckCircle2, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSystemStore } from '@/store/useSystemStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { apiFetch, getApiUrl } from '@/lib/api'

interface HistoryItem {
    id: string
    text: string
    tags: string[]
    timestamp: number
    status: 'success' | 'failed'
}

const PromptConsole: React.FC = () => {
    // Stores
    const { addNotification } = useGlobalStore()
    const { startJob, updateJobProgress, completeJob, currentJob } = useSystemStore()
    const { addAssets } = useLibraryStore()

    // Local State
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([])

    const handleSend = async () => {
        if (!input.trim() || currentJob) return

        const promptText = input.trim()

        // Add to history
        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            text: promptText,
            tags: ['user'],
            timestamp: Date.now(),
            status: 'success'
        }
        setHistory(prev => [newHistoryItem, ...prev])
        setInput('')

        // Start System Job
        const jobId = `job-${Date.now()}`
        startJob({
            id: jobId,
            type: 'text-to-image',
            status: 'processing',
            progress: 0
        })

        addNotification({ type: 'info', message: 'Generating image...' })

        try {
            // Real API Call to Backend
            const apiUrl = getApiUrl()
            const response = await apiFetch('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: promptText,
                    negative_prompt: '',
                    width: 1024,
                    height: 1024,
                    num_images: 1,
                    steps: 30,
                    guidance_scale: 7.5,
                    seed: -1
                })
            })

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`)
            }

            const data = await response.json()

            // Update progress to complete
            updateJobProgress(100)
            completeJob()

            // Add generated images to library
            if (data.images && data.images.length > 0) {
                const newAssets = data.images.map((imgData: any, idx: number) => ({
                    id: `gen-${Date.now()}-${idx}`,
                    url: imgData.url.startsWith('http') ? imgData.url : `${apiUrl}${imgData.url}`,
                    prompt: promptText,
                    negativePrompt: '',
                    width: 1024,
                    height: 1024,
                    createdAt: Date.now(),
                    tags: ['generated', 'txt2img', 'v2'],
                    model: data.model || 'NovaGen XL',
                    isFavorite: false,
                    seed: imgData.seed || Math.floor(Math.random() * 999999)
                }))

                addAssets(newAssets)
                addNotification({ type: 'success', message: `Generated ${newAssets.length} image(s)!` })
            } else {
                addNotification({ type: 'warning', message: 'No images returned from API' })
            }

        } catch (error) {
            console.error('Generation error:', error)
            completeJob()
            addNotification({
                type: 'error',
                message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Input Area */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-neon-magenta/10 rounded-xl blur-sm" />
                <div className="relative bg-black/80 border border-white/10 rounded-xl p-4 flex flex-col gap-2 backdrop-blur-xl transition-colors focus-within:border-neon-cyan/50 focus-within:shadow-[0_0_15px_rgba(0,243,255,0.15)]">

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your imagination... (e.g., 'A futuristic city with neon rain')"
                        className="w-full bg-transparent border-none outline-none text-white resize-none placeholder-gray-600 font-mono text-sm min-h-[60px]"
                        spellCheck={false}
                    />

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                                <Tag size={14} />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                                <Book size={14} />
                            </button>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || !!currentJob}
                            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{currentJob ? 'Processing...' : 'Generate'}</span>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* History Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                    <Clock size={12} />
                    <span>Recent Activity</span>
                </div>

                {history.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative pl-4 border-l-2 border-white/10 hover:border-neon-cyan transition-colors"
                    >
                        <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-gray-600 group-hover:bg-neon-cyan transition-colors" />
                        <div className="bg-zinc-900/50 rounded-lg p-3 hover:bg-zinc-800/80 transition-all cursor-pointer border border-transparent hover:border-white/5">
                            <p className="text-sm text-gray-200 line-clamp-2 font-light">{item.text}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex gap-1">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">#{tag}</span>
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-600 ml-auto">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                {item.status === 'success' ? (
                                    <CheckCircle2 size={12} className="text-neon-green" />
                                ) : (
                                    <Terminal size={12} className="text-gray-600" />
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default PromptConsole
