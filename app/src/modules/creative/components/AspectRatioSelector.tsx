import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AspectRatio, AspectRatioConfig } from '../stores/useGenerationStore'

interface AspectRatioSelectorProps {
    value: AspectRatio
    onChange: (ratio: AspectRatio) => void
    configs: AspectRatioConfig[]
}

const CATEGORIES = [
    { id: 'square', name: 'Square', icon: '⬜' },
    { id: 'horizontal', name: 'Horizontal', icon: '▬' },
    { id: 'vertical', name: 'Vertical', icon: '▮' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'social', name: 'Social', icon: '📱' },
]

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange, configs }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('square')

    const filteredRatios = configs.filter(r => r.category === selectedCategory)
    const selectedRatio = configs.find(r => r.id === value)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Aspect Ratio
                </label>
                {selectedRatio && (
                    <span className="text-xs text-gray-500 font-mono">
                        {selectedRatio.width} × {selectedRatio.height}
                    </span>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
              flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all
              ${selectedCategory === cat.id
                                ? 'bg-white/10 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                            }
            `}
                    >
                        <span className="mr-1">{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Ratio Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-3 gap-2"
                >
                    {filteredRatios.map((ratio) => {
                        const isActive = value === ratio.id
                        const aspectValue = ratio.width / ratio.height

                        return (
                            <motion.button
                                key={ratio.id}
                                onClick={() => onChange(ratio.id as AspectRatio)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${isActive
                                        ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                        : 'border-white/10 hover:border-white/30'
                                    }
                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {/* Visual representation */}
                                    <div className="w-full h-8 flex items-center justify-center">
                                        <div
                                            className={`
                        border-2 rounded-sm transition-colors
                        ${isActive ? 'border-neon-cyan' : 'border-gray-600'}
                      `}
                                            style={{
                                                width: aspectValue > 1 ? '100%' : `${aspectValue * 100}%`,
                                                height: aspectValue < 1 ? '100%' : `${(1 / aspectValue) * 100}%`,
                                                maxWidth: '100%',
                                                maxHeight: '100%'
                                            }}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                            {ratio.ratio}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {ratio.name}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
