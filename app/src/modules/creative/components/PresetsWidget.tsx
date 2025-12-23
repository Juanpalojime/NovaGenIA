import React, { useState } from 'react'
import { Aperture, Type, Sun, Monitor, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useGenerationStore, STYLE_PRESETS, LIGHTING_PRESETS, CAMERA_PRESETS, ASPECT_RATIOS } from '../stores/useGenerationStore'
import { motion, AnimatePresence } from 'framer-motion'

const PresetsWidget: React.FC = () => {
    const { params, setStyle, setLighting, setCamera, setAspect } = useGenerationStore()
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    const categories = [
        {
            name: 'Style',
            icon: Type,
            current: params.style,
            options: Object.keys(STYLE_PRESETS),
            onChange: setStyle,
            previewColor: 'from-cyan-500 to-blue-500'
        },
        {
            name: 'Lighting',
            icon: Sun,
            current: params.lighting,
            options: Object.keys(LIGHTING_PRESETS),
            onChange: setLighting,
            previewColor: 'from-orange-500 to-yellow-500'
        },
        {
            name: 'Camera',
            icon: Aperture,
            current: params.camera,
            options: Object.keys(CAMERA_PRESETS),
            onChange: setCamera,
            previewColor: 'from-purple-500 to-pink-500'
        },
        {
            name: 'Aspect',
            icon: Monitor,
            current: params.aspect,
            options: Object.keys(ASPECT_RATIOS),
            onChange: setAspect,
            previewColor: 'from-green-500 to-emerald-500'
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {categories.map((cat) => (
                <div key={cat.name} className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === cat.name ? null : cat.name)}
                        className="w-full flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-neon-cyan/30 transition-all group relative overflow-hidden"
                    >
                        {/* Hover Preview Background */}
                        <div className={clsx(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                            cat.previewColor
                        )} />

                        <div className="flex items-center justify-between w-full relative z-10">
                            <div className="flex items-center gap-2">
                                <cat.icon size={14} className="text-gray-500" />
                                <span className="text-xs font-medium text-gray-300">{cat.name}</span>
                            </div>
                            <ChevronDown size={12} className={clsx(
                                "text-gray-500 transition-transform",
                                openDropdown === cat.name && "rotate-180"
                            )} />
                        </div>
                        <span className="text-xs text-neon-cyan font-mono mt-1 relative z-10">{cat.current}</span>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {openDropdown === cat.name && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 w-full bg-black/95 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-md"
                            >
                                {cat.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            cat.onChange(option)
                                            setOpenDropdown(null)
                                        }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 text-xs transition-colors",
                                            option === cat.current
                                                ? "bg-neon-cyan/20 text-neon-cyan font-medium"
                                                : "text-gray-300 hover:bg-white/10"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}

export default PresetsWidget
