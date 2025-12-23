import React, { useState } from 'react'
import { Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGenerationStore } from '../stores/useGenerationStore'
import { useSystemStore } from '@/store/useSystemStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { apiFetch, getApiUrl } from '@/lib/api'
import { ModeSelector } from './ModeSelector'
import { AspectRatioSelector } from './AspectRatioSelector'
import { SeedControl } from './SeedControl'
import { GenerationTabs } from './GenerationTabs'

export const GenerationPanel: React.FC = () => {
    const {
        params,
        aspectRatioConfigs,
        setMode,
        setAspectRatio,
        setSeed,
        toggleSeedLock,
        randomizeSeed
    } = useGenerationStore()

    const { addNotification } = useGlobalStore()
    const { startJob, updateJobProgress, completeJob, currentJob } = useSystemStore()
    const { addAssets } = useLibraryStore()

    const [activeTab, setActiveTab] = useState<'txt2img' | 'img2img' | 'controlnet' | 'faceswap' | 'upscale'>('txt2img')
    const [prompt, setPrompt] = useState('')
    const [negativePrompt, setNegativePrompt] = useState('')
    const [showNegative, setShowNegative] = useState(false)
    const [useMagicPrompt, setUseMagicPrompt] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)

    const handleGenerate = async () => {
        if ((!prompt.trim() && activeTab !== 'faceswap' && activeTab !== 'upscale') || currentJob) return

        let finalPrompt = prompt.trim()

        // Magic Prompt enhancement (skip for FaceSwap/Upscale)
        if (useMagicPrompt && activeTab !== 'faceswap' && activeTab !== 'upscale') {
            setIsEnhancing(true)
            try {
                const response = await apiFetch('/enhance-prompt', {
                    method: 'POST',
                    body: JSON.stringify({ prompt: finalPrompt })
                })
                const data = await response.json()
                if (data.enhanced_prompt) {
                    finalPrompt = data.enhanced_prompt
                    addNotification({ type: 'success', message: 'Prompt enhanced with AI!' })
                }
            } catch (error) {
                console.error('Enhancement error:', error)
                addNotification({ type: 'warning', message: 'Enhancement failed, using original prompt' })
            } finally {
                setIsEnhancing(false)
            }
        }

        // Start job
        const jobId = `job-${Date.now()}`
        startJob({
            id: jobId,
            type: activeTab,
            status: 'processing',
            progress: 0
        })

        addNotification({ type: 'info', message: `Generating (${activeTab})...` })

        try {
            const apiUrl = getApiUrl()
            let endpoint = '/generate'
            let body: any = {
                prompt: finalPrompt,
                negative_prompt: negativePrompt,
                mode: params.mode,
                aspect_ratio: params.aspectRatio,
                seed: params.seed,
                num_images: params.numImages,
                output_format: params.outputFormat
            }

            if (activeTab === 'img2img') {
                if (!params.initImage) throw new Error('Input image required for Img2Img')
                endpoint = '/img2img'
                body = {
                    ...body,
                    image: params.initImage,
                    strength: params.img2imgStrength
                }
            } else if (activeTab === 'controlnet') {
                if (!params.controlNetImage) throw new Error('Ref image required for ControlNet')
                endpoint = '/controlnet'
                body = {
                    ...body,
                    image: params.controlNetImage,
                    control_type: params.controlNetModel,
                    control_weight: params.controlNetWeight
                }
            } else if (activeTab === 'faceswap') {
                if (!params.faceSwapSource) throw new Error('Source face required')
                if (!params.faceSwapTarget) throw new Error('Target image required')
                endpoint = '/faceswap'
                body = {
                    source_image: params.faceSwapSource,
                    target_image: params.faceSwapTarget,
                    output_format: params.outputFormat
                }
            } else if (activeTab === 'upscale') {
                if (!params.upscaleImage) throw new Error('Input image required for Upscale')
                endpoint = '/upscale'
                body = {
                    image: params.upscaleImage,
                    prompt: finalPrompt || 'high quality, 8k',
                    output_format: params.outputFormat
                }
            }

            const response = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`)
            }

            const data = await response.json()

            updateJobProgress(100)
            completeJob()

            // Add to library
            if (data.images && data.images.length > 0) {
                const newAssets = data.images.map((imgData: any, idx: number) => ({
                    id: `gen-${Date.now()}-${idx}`,
                    url: imgData.url.startsWith('http') ? imgData.url : `${apiUrl}${imgData.url}`,
                    prompt: finalPrompt || (activeTab === 'upscale' ? 'Upscaled Image' : 'Generated Image'),
                    negativePrompt: negativePrompt,
                    width: imgData.width || params.width,
                    height: imgData.height || params.height,
                    createdAt: Date.now(),
                    tags: ['generated', activeTab, params.mode],
                    model: data.model || 'Juggernaut-XL v9',
                    isFavorite: false,
                    seed: imgData.seed || params.seed
                }))

                addAssets(newAssets)
                addNotification({ type: 'success', message: `Generated ${newAssets.length} image(s)!` })

                if (!params.seedLocked && data.images[0]?.seed) {
                    setSeed(data.images[0].seed)
                }

            } else if (data.image) {
                // Single image response handler (FaceSwap, Upscale, etc)
                const imgData = data.image
                const newAsset = {
                    id: `gen-${Date.now()}-0`,
                    url: imgData.url.startsWith('http') ? imgData.url : `${apiUrl}${imgData.url}`,
                    prompt: finalPrompt || (activeTab === 'upscale' ? 'Upscaled Image' : (activeTab === 'faceswap' ? 'Face Swap' : 'Generated Image')),
                    negativePrompt: negativePrompt,
                    width: params.width,
                    height: params.height,
                    createdAt: Date.now(),
                    tags: ['generated', activeTab, params.mode],
                    model: data.model || (activeTab === 'upscale' ? 'Esrgan/Stability' : 'Unknown'),
                    isFavorite: false,
                    seed: imgData.seed || params.seed
                }
                addAssets([newAsset])
                addNotification({ type: 'success', message: "Image generated!" })
                if (!params.seedLocked && imgData.seed) {
                    setSeed(imgData.seed)
                }
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
            handleGenerate()
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">

            <GenerationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Prompt Input */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-neon-magenta/10 rounded-xl blur-sm" />
                <div className="relative bg-black/80 border border-white/10 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-xl transition-colors focus-within:border-neon-cyan/50 focus-within:shadow-[0_0_15px_rgba(0,243,255,0.15)]">

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={activeTab === 'img2img' ? "Describe changes to the image..." : "Describe your imagination..."}
                        className="w-full bg-transparent border-none outline-none text-white resize-none placeholder-gray-600 font-mono text-sm min-h-[80px]"
                        spellCheck={false}
                    />

                    {/* Negative Prompt Toggle */}
                    <div className="border-t border-white/5 pt-3">
                        <button
                            onClick={() => setShowNegative(!showNegative)}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            {showNegative ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span>Negative Prompt</span>
                        </button>

                        <AnimatePresence>
                            {showNegative && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <textarea
                                        value={negativePrompt}
                                        onChange={(e) => setNegativePrompt(e.target.value)}
                                        placeholder="What to avoid..."
                                        className="w-full mt-2 bg-black/40 border border-white/10 rounded-lg p-3 text-white resize-none placeholder-gray-600 font-mono text-xs min-h-[60px] focus:outline-none focus:border-red-500/50"
                                        spellCheck={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseMagicPrompt(!useMagicPrompt)}
                                className={`
                                    p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2
                                    ${useMagicPrompt
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                                        : 'hover:bg-white/5 text-gray-400 border border-transparent'
                                    }
                                `}
                                title="AI-powered prompt enhancement"
                            >
                                <Sparkles size={14} />
                                <span>Magic Prompt</span>
                                {isEnhancing && <span className="animate-pulse">✨</span>}
                            </button>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || !!currentJob || isEnhancing}
                            className="
                                bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                                hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]
                                transition-all flex items-center gap-2
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <span>{isEnhancing ? 'Enhancing...' : currentJob ? 'Processing...' : 'Generate'}</span>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Generation Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                    <ModeSelector
                        value={params.mode}
                        onChange={setMode}
                    />

                    <SeedControl
                        seed={params.seed}
                        locked={params.seedLocked}
                        onSeedChange={setSeed}
                        onLockToggle={toggleSeedLock}
                        onRandomize={randomizeSeed}
                    />
                </div>

                {/* Right Column */}
                <div>
                    <AspectRatioSelector
                        value={params.aspectRatio}
                        onChange={setAspectRatio}
                        configs={aspectRatioConfigs}
                    />
                </div>
            </div>
        </div>
    )
}
