import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, Sliders, Repeat, Settings2, UserSquare2 } from 'lucide-react'
import { useGenerationStore } from '../stores/useGenerationStore'

interface TabProps {
    activeTab: 'txt2img' | 'img2img' | 'controlnet' | 'faceswap' | 'upscale'
    setActiveTab: (tab: 'txt2img' | 'img2img' | 'controlnet' | 'faceswap' | 'upscale') => void
}

export const GenerationTabs: React.FC<TabProps> = ({ activeTab, setActiveTab }) => {
    const {
        params,
        setInitImage,
        setControlNetImage,
        setControlNetModel,
        setImg2ImgStrength,
        setControlNetWeight,
        setFaceSwapSource,
        setFaceSwapTarget,
        setUpscaleImage,
        setNumImages,
        setOutputFormat
    } = useGenerationStore()

    const [showAdvanced, setShowAdvanced] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadType, setUploadType] = useState<'init' | 'control' | 'source' | 'target' | 'upscale'>('init')

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large (max 5MB)')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result as string
            if (activeTab === 'img2img') {
                setInitImage(result)
            } else if (activeTab === 'controlnet') {
                setControlNetImage(result)
            } else if (activeTab === 'faceswap') {
                if (uploadType === 'source') setFaceSwapSource(result)
                if (uploadType === 'target') setFaceSwapTarget(result)
            } else if (activeTab === 'upscale') {
                setUpscaleImage(result)
            }
        }
        reader.readAsDataURL(file)
    }

    const triggerUpload = (type: 'init' | 'control' | 'source' | 'target' | 'upscale') => {
        setUploadType(type)
        setTimeout(() => fileInputRef.current?.click(), 0)
    }

    return (
        <div className="w-full mb-6 max-w-sm mx-auto sm:max-w-full">
            <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/5 overflow-x-auto no-scrollbar gap-1">
                {(['txt2img', 'img2img', 'controlnet', 'faceswap', 'upscale'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            flex-1 py-2 px-3 rounded-lg text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap
                            ${activeTab === tab
                                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }
                        `}
                    >
                        {tab === 'txt2img' ? 'Create' : tab === 'img2img' ? 'Remix' : tab === 'controlnet' ? 'Control' : tab === 'faceswap' ? 'Face Swap' : 'Upscale'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Img2Img Panel */}
                {activeTab === 'img2img' && (
                    <motion.div
                        key="img2img"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-black/20 rounded-xl border border-white/5"
                    >
                        <div className="flex gap-4">
                            <div
                                className="w-24 h-24 bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative overflow-hidden group flex-shrink-0"
                                onClick={() => triggerUpload('init')}
                            >
                                {params.initImage ? (
                                    <>
                                        <img src={params.initImage} alt="Init" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload size={16} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-500">
                                        <ImageIcon size={16} />
                                        <span className="text-[10px]">Upload</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Strength: {params.img2imgStrength}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.05"
                                    value={params.img2imgStrength}
                                    onChange={(e) => setImg2ImgStrength(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <p className="text-[10px] text-gray-600">
                                    Determines how much to change the original image.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ControlNet Panel */}
                {activeTab === 'controlnet' && (
                    <motion.div
                        key="controlnet"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-black/20 rounded-xl border border-white/5"
                    >
                        <div className="flex gap-4 mb-3">
                            <div
                                className="w-24 h-24 bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative overflow-hidden group flex-shrink-0"
                                onClick={() => triggerUpload('control')}
                            >
                                {params.controlNetImage ? (
                                    <>
                                        <img src={params.controlNetImage} alt="Control" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload size={16} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-500">
                                        <Sliders size={16} />
                                        <span className="text-[10px]">Reference</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col gap-3">
                                {/* Model Selector with new options */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Control Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['canny', 'depth', 'pyracanny', 'cpds'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setControlNetModel(type)}
                                                className={`
                                                    px-2 py-1.5 rounded text-[10px] border transition-colors truncate
                                                    ${params.controlNetModel === type
                                                        ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                                                        : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'
                                                    }
                                                `}
                                            >
                                                {type === 'pyracanny' ? 'PyraCanny' : type.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Weight Control */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Weight: {params.controlNetWeight}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.0"
                                        max="2.0"
                                        step="0.1"
                                        value={params.controlNetWeight}
                                        onChange={(e) => setControlNetWeight(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Face Swap Panel */}
                {activeTab === 'faceswap' && (
                    <motion.div
                        key="faceswap"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {/* Source Face */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 block text-center">Source Face</label>
                                <div
                                    className="aspect-square bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative overflow-hidden group"
                                    onClick={() => triggerUpload('source')}
                                >
                                    {params.faceSwapSource ? (
                                        <img src={params.faceSwapSource} alt="Source" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-500">
                                            <UserSquare2 size={24} />
                                            <span className="text-[10px]">Select Face</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Target Image */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 block text-center">Target Image</label>
                                <div
                                    className="aspect-square bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative overflow-hidden group"
                                    onClick={() => triggerUpload('target')}
                                >
                                    {params.faceSwapTarget ? (
                                        <img src={params.faceSwapTarget} alt="Target" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-500">
                                            <ImageIcon size={24} />
                                            <span className="text-[10px]">Select Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-500">
                            The face from the left image will be swapped into the right image.
                        </p>
                    </motion.div>
                )}

                {/* Upscale Panel */}
                {activeTab === 'upscale' && (
                    <motion.div
                        key="upscale"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4"
                    >
                        <div className="flex gap-4">
                            <div
                                className="w-32 h-32 bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative overflow-hidden group flex-shrink-0"
                                onClick={() => triggerUpload('upscale')}
                            >
                                {params.upscaleImage ? (
                                    <>
                                        <img src={params.upscaleImage} alt="Upscale" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload size={20} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500 px-2 text-center">
                                        <ImageIcon size={24} />
                                        <span className="text-[10px]">Upload Image to Upscale</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <h3 className="text-sm font-medium text-white">4x AI Upscaler</h3>
                                <p className="text-xs text-gray-400">
                                    Enhance image resolution and details using StabilityAI's x4 upscaler.
                                    Ideal for restoring old photos or increasing quality of generated images.
                                </p>
                                <div className="mt-2 text-[10px] text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/20 p-2 rounded">
                                    Result will be 4x the original resolution.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Advanced Settings (Global) */}
            {activeTab !== 'faceswap' && activeTab !== 'upscale' && (
                <div className="mt-4 border-t border-white/5 pt-4">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors w-full"
                    >
                        <Settings2 size={12} />
                        <span>Advanced Settings</span>
                        <span className="ml-auto text-[10px] opacity-50">{showAdvanced ? 'Hide' : 'Show'}</span>
                    </button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    {/* Batch Size */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-bold">Batch Size</label>
                                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                            <Repeat size={14} className="text-gray-400" />
                                            <input
                                                type="range"
                                                min="1"
                                                max="4"
                                                step="1"
                                                value={params.numImages}
                                                onChange={(e) => setNumImages(parseInt(e.target.value))}
                                                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                            />
                                            <span className="text-xs font-mono w-4">{params.numImages}</span>
                                        </div>
                                    </div>

                                    {/* Output Format */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-bold">Format</label>
                                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                                            {(['png', 'jpg', 'webp'] as const).map(fmt => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => setOutputFormat(fmt)}
                                                    className={`
                                                        flex-1 py-1 text-[10px] uppercase rounded transition-colors
                                                        ${params.outputFormat === fmt
                                                            ? 'bg-white/10 text-white'
                                                            : 'text-gray-500 hover:text-gray-300'
                                                        }
                                                    `}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}
