// This file is now deprecated/refactored.
// Sub-components are being extracted to establish the Leonardo.ai layout.
import React, { useState } from 'react'
import { Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGenerationStore } from '../stores/useGenerationStore'
import { useSystemStore } from '@/store/useSystemStore'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { apiFetch, getApiUrl } from '@/lib/api'
import { AspectRatioSelector } from './AspectRatioSelector'
import { SeedControl } from './SeedControl'
import { GenerationTabs } from './GenerationTabs'

// SIDEBAR COMPONENT (Left Column)
export const GenerationSidebar: React.FC = () => {
    const {
        params,
        aspectRatioConfigs,
        setAspectRatio,
        setSeed,
        toggleSeedLock,
        randomizeSeed,
        setNumImages,
        setOutputFormat,
        setSteps,
        setGuidanceScale
    } = useGenerationStore()

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Image Dimensions */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Image Dimensions</span>
                    <span className="bg-brand-500/20 text-brand-400 text-[10px] px-1.5 py-0.5 rounded-token border border-brand-500/20">{params.width}x{params.height}</span>
                </div>
                <AspectRatioSelector
                    value={params.aspectRatio}
                    onChange={setAspectRatio}
                    configs={aspectRatioConfigs}
                />
            </section>

            {/* 2. Number of Images */}
            <section className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Number of Images</span>
                    <span className="text-xs font-mono text-white bg-neutral-800 px-2 py-0.5 rounded-token">{params.numImages}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => setNumImages(num)}
                            className={`
                                py-2 rounded-token text-xs font-bold transition-all border
                                ${params.numImages === num
                                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-primary'
                                    : 'bg-neutral-900/50 border-border text-neutral-600 hover:bg-neutral-800 hover:text-neutral-300'
                                }
                            `}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. Image Guidance (Steps / Guidance) */}
            <section className="space-y-4">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Advanced Settings</div>

                {/* Steps */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Steps</span>
                        <span className="text-white font-mono">{params.steps || 30}</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="50"
                        step="1"
                        value={params.steps || 30}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded-token appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-token-full"
                    />
                </div>

                {/* Guidance Scale */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Guidance Scale</span>
                        <span className="text-white font-mono">{params.guidanceScale || 7.5}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={params.guidanceScale || 7.5}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded-token appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-token-full"
                    />
                </div>
            </section>

            {/* 4. Seed & Format */}
            <section className="space-y-4 pt-2 border-t border-border">
                <SeedControl
                    seed={params.seed}
                    locked={params.seedLocked}
                    onSeedChange={setSeed}
                    onLockToggle={toggleSeedLock}
                    onRandomize={randomizeSeed}
                />

                <div className="grid grid-cols-2 gap-2 mt-4">
                    {(['png', 'jpg'] as const).map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={`
                                py-1.5 rounded-token text-[10px] font-bold uppercase transition-all border
                                ${params.outputFormat === fmt
                                    ? 'bg-brand-500/20 border-brand-500 text-white'
                                    : 'bg-neutral-900/30 border-transparent text-neutral-600 hover:text-neutral-300'
                                }
                            `}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    )
}


// MAIN PANEL COMPONENT (Top Input + Tabs)
export const GenerationPanel: React.FC = () => {
    // We need params here too for the API call
    const {
        params,
        setSeed
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
                const data = await apiFetch<any>('/enhance-prompt', {
                    method: 'POST',
                    body: JSON.stringify({ prompt: finalPrompt })
                })
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
            // Construct body based on params from store + local prompt
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

            const data = await apiFetch<any>(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            })


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
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-secondary-500/10 rounded-token-lg blur-sm" />
                <div className="relative bg-neutral-950/80 border border-border rounded-token-lg p-4 flex flex-col gap-3 backdrop-blur-xl transition-colors focus-within:border-brand-500/50 focus-within:shadow-glow-primary">

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={activeTab === 'img2img' ? "Describe changes to the image..." : "Describe your imagination..."}
                        className="w-full bg-transparent border-none outline-none text-white resize-none placeholder-neutral-700 font-mono text-sm min-h-[80px]"
                        spellCheck={false}
                    />

                    {/* Negative Prompt Toggle */}
                    <div className="border-t border-border pt-3">
                        <button
                            onClick={() => setShowNegative(!showNegative)}
                            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors"
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
                                        className="w-full mt-2 bg-black/40 border border-border rounded-token p-3 text-white resize-none placeholder-neutral-700 font-mono text-xs min-h-[60px] focus:outline-none focus:border-red-500/50"
                                        spellCheck={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseMagicPrompt(!useMagicPrompt)}
                                className={`
                                    p-2 rounded-token text-xs font-medium transition-all flex items-center gap-2
                                    ${useMagicPrompt
                                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/50'
                                        : 'hover:bg-neutral-900 text-neutral-500 border border-transparent'
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
                                bg-brand-500 text-white px-4 py-2 rounded-token text-xs font-bold uppercase tracking-wider
                                hover:bg-brand-600 hover:shadow-glow-primary
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

        </div>
    )
}
