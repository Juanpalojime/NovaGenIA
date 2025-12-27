import React, { useState, useRef } from 'react'
import { Send, Clock, Book, Tag, CheckCircle2, Terminal, Sparkles, Zap, Image as ImageIcon, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSystemStore } from '@/store/useSystemStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { apiFetch, getApiUrl } from '@/lib/api'
import { useGenerationStore } from '../stores/useGenerationStore'

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
    const { params, getFullPrompt, magicPromptMode, setMagicPromptMode, setOutputFormat } = useGenerationStore()

    // Local State
    const [input, setInput] = useState('')
    const [useMagicPrompt, setUseMagicPrompt] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Image-to-Prompt State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isInterrogating, setIsInterrogating] = useState(false)

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([])

    const handleSend = async () => {
        if (!input.trim() || currentJob) return

        const basePrompt = input.trim()
        let finalPrompt = basePrompt

        // Apply magic prompt enhancement if enabled
        if (useMagicPrompt) {
            if (magicPromptMode === 'llm') {
                // Use LLM enhancement
                setIsEnhancing(true)
                try {
                    const data = await apiFetch<any>('/enhance-prompt', {
                        method: 'POST',
                        body: JSON.stringify({ prompt: basePrompt })
                    })
                    if (data && data.enhanced_prompt) {
                        finalPrompt = data.enhanced_prompt
                        addNotification({ type: 'success', message: 'Prompt enhanced with AI!' })
                    }
                } catch (error) {
                    console.error('Enhancement error:', error)
                    addNotification({ type: 'warning', message: 'LLM enhancement failed, using original prompt' })
                } finally {
                    setIsEnhancing(false)
                }
            } else {
                // Use preset enhancement
                finalPrompt = getFullPrompt(basePrompt)
            }
        }

        // Add to history
        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            text: finalPrompt,
            tags: useMagicPrompt ? ['user', magicPromptMode === 'llm' ? 'ai-enhanced' : 'enhanced'] : ['user'],
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
            // Real API Call to Backend with generation parameters
            const apiUrl = getApiUrl()
            const data = await apiFetch<any>('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: finalPrompt,
                    negative_prompt: '',
                    width: params.width,
                    height: params.height,
                    num_images: 1,
                    steps: params.steps,
                    guidance_scale: params.guidanceScale,
                    seed: params.seed,
                    output_format: params.outputFormat
                })
            })

            // Update progress to complete
            updateJobProgress(100)
            completeJob()

            // Add generated images to library
            if (data.images && data.images.length > 0) {
                const newAssets = data.images.map((imgData: any, idx: number) => ({
                    id: `gen-${Date.now()}-${idx}`,
                    url: imgData.url.startsWith('http') ? imgData.url : `${apiUrl}${imgData.url}`,
                    prompt: finalPrompt,
                    negativePrompt: '',
                    width: params.width,
                    height: params.height,
                    createdAt: Date.now(),
                    tags: ['generated', 'txt2img', 'v2'],
                    model: data.model || 'SDXL 1.0',
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addNotification({ type: 'error', message: 'Please select an image file' })
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            addNotification({ type: 'error', message: 'Image size must be less than 10MB' })
            return
        }

        // Read and preview image
        const reader = new FileReader()
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            setUploadedImage(imageUrl)
            addNotification({ type: 'success', message: 'Image uploaded! Click "Interrogate" to extract prompt' })
        }
        reader.readAsDataURL(file)
    }

    const handleInterrogate = async () => {
        if (!uploadedImage) return

        setIsInterrogating(true)
        try {
            // Convert base64 to blob for API
            const data = await apiFetch<any>('/interrogate', {
                method: 'POST',
                body: JSON.stringify({
                    image: uploadedImage
                })
            })

            if (data.prompt) {
                setInput(data.prompt)
                addNotification({ type: 'success', message: 'Prompt extracted from image!' })
            } else {
                throw new Error('No prompt returned')
            }
        } catch (error) {
            console.error('Interrogation error:', error)
            addNotification({
                type: 'error',
                message: 'Image interrogation failed. Using placeholder prompt.'
            })
            // Fallback: set a generic prompt
            setInput('A detailed image with various elements and composition')
        } finally {
            setIsInterrogating(false)
        }
    }

    const handleRemoveImage = () => {
        setUploadedImage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
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
                            <button
                                onClick={() => setUseMagicPrompt(!useMagicPrompt)}
                                className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${useMagicPrompt
                                    ? 'bg-neon-cyan/20 text-neon-cyan'
                                    : 'hover:bg-white/5 text-gray-400'
                                    }`}
                                title={magicPromptMode === 'llm' ? 'AI-powered prompt enhancement' : 'Enhance with Style, Lighting, and Camera presets'}
                            >
                                <Sparkles size={14} />
                                <span>Magic Prompt</span>
                                {isEnhancing && <span className="animate-pulse">✨</span>}
                            </button>

                            {useMagicPrompt && (
                                <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                                    <button
                                        onClick={() => setMagicPromptMode('preset')}
                                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${magicPromptMode === 'preset'
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        title="Use preset combinations"
                                    >
                                        Preset
                                    </button>
                                    <button
                                        onClick={() => setMagicPromptMode('llm')}
                                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center gap-1 ${magicPromptMode === 'llm'
                                            ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 text-neon-cyan'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        title="Use Phi-3 Mini AI"
                                    >
                                        <Zap size={10} />
                                        LLM
                                    </button>
                                </div>
                            )}

                            {/* Quick Tags Button */}
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        const tags = ['portrait', 'landscape', 'anime', 'realistic', 'cinematic', '4k', 'detailed']
                                        const randomTag = tags[Math.floor(Math.random() * tags.length)]
                                        setInput(prev => prev + (prev ? ', ' : '') + randomTag)
                                        addNotification({ type: 'info', message: `Added tag: ${randomTag}` })
                                    }}
                                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
                                    title="Add quick tag"
                                >
                                    <Tag size={14} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Quick Tags
                                </div>
                            </div>

                            {/* Prompt Library Button */}
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        const templates = [
                                            'A beautiful landscape with mountains and a lake at sunset',
                                            'Portrait of a cyberpunk character with neon lights',
                                            'Futuristic city with flying cars and holographic displays',
                                            'Fantasy castle on a floating island in the clouds',
                                            'Underwater scene with colorful coral and tropical fish'
                                        ]
                                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
                                        setInput(randomTemplate)
                                        addNotification({ type: 'success', message: 'Loaded prompt template' })
                                    }}
                                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-neon-magenta transition-colors"
                                    title="Load prompt template"
                                >
                                    <Book size={14} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Prompt Library
                                </div>
                            </div>

                            {/* Output Format Selector */}
                            <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                                {(['png', 'jpg'] as const).map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setOutputFormat(fmt)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${params.outputFormat === fmt
                                            ? 'bg-neon-cyan/20 text-neon-cyan'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        title={fmt === 'png' ? 'Lossless quality' : 'Smaller file size'}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>

                            {/* Image Upload Button */}
                            <div className="relative group">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-green-500 transition-colors"
                                    title="Upload image to extract prompt"
                                >
                                    <ImageIcon size={14} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Image to Prompt
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || !!currentJob || isEnhancing}
                            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{isEnhancing ? 'Enhancing...' : currentJob ? 'Processing...' : 'Generate'}</span>
                            <Send size={14} />
                        </button>
                    </div>

                    {/* Image Preview */}
                    {uploadedImage && (
                        <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                    <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">Uploaded Image</div>
                                    <button
                                        onClick={handleInterrogate}
                                        disabled={isInterrogating}
                                        className="text-xs bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
                                    >
                                        {isInterrogating ? 'Interrogating...' : 'Extract Prompt'}
                                    </button>
                                </div>
                                <button
                                    onClick={handleRemoveImage}
                                    className="p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
