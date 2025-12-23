import React from 'react'
import { Zap, Gauge, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { GenerationMode } from '../stores/useGenerationStore'

interface ModeSelectorProps {
    value: GenerationMode
    onChange: (mode: GenerationMode) => void
}

const MODES = [
    {
        id: 'extreme_speed' as GenerationMode,
        name: 'Extreme',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        description: '15 steps',
        badge: '⚡'
    },
    {
        id: 'speed' as GenerationMode,
        name: 'Speed',
        icon: Gauge,
        color: 'from-blue-500 to-cyan-500',
        description: '25 steps',
        badge: '🚀'
    },
    {
        id: 'quality' as GenerationMode,
        name: 'Quality',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        description: '40 steps',
        badge: '✨'
    }
]

export const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Generation Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
                {MODES.map((mode) => {
                    const Icon = mode.icon
                    const isActive = value === mode.id

                    return (
                        <motion.button
                            key={mode.id}
                            onClick={() => onChange(mode.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isActive
                                    ? 'border-white bg-white/10 shadow-lg'
                                    : 'border-white/10 hover:border-white/30'
                                }
              `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mode-indicator"
                                    className={`absolute inset-0 rounded-lg bg-gradient-to-br ${mode.color} opacity-20`}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className="relative flex flex-col items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-white' : 'text-gray-400'}
                                    />
                                    <span className="text-lg">{mode.badge}</span>
                                </div>
                                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    {mode.name}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {mode.description}
                                </span>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
