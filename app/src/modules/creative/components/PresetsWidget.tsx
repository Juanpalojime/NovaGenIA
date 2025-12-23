import React from 'react'
import { Aperture, Type, Sun, Monitor } from 'lucide-react'
import { clsx } from 'clsx'

const PresetsWidget: React.FC = () => {
    const [hoveredPreset, setHoveredPreset] = React.useState<string | null>(null)

    const categories = [
        { name: 'Style', icon: Type, current: 'Cyberpunk', previewColor: 'from-cyan-500 to-blue-500' },
        { name: 'Lighting', icon: Sun, current: 'Volumetric', previewColor: 'from-orange-500 to-yellow-500' },
        { name: 'Camera', icon: Aperture, current: '35mm', previewColor: 'from-purple-500 to-pink-500' },
        { name: 'Aspect', icon: Monitor, current: '16:9', previewColor: 'from-green-500 to-emerald-500' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {categories.map((cat) => (
                <button
                    key={cat.name}
                    onMouseEnter={() => setHoveredPreset(cat.name)}
                    onMouseLeave={() => setHoveredPreset(null)}
                    className="flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-neon-cyan/30 transition-all group relative overflow-hidden"
                >
                    {/* Hover Preview Background */}
                    <div className={clsx(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                        cat.previewColor
                    )} />

                    <div className="flex items-center gap-2 mb-1 w-full text-gray-500 group-hover:text-neon-cyan transition-colors z-10">
                        <cat.icon size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">{cat.name}</span>
                    </div>
                    <div className="text-sm font-medium text-white group-hover:text-shadow-neon z-10">{cat.current}</div>

                    {/* Mini Thumbnail (Simulated) */}
                    {hoveredPreset === cat.name && (
                        <div className="absolute top-2 right-2 w-8 h-8 rounded bg-black/50 border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20">
                            {/* This would be a real image preview in production */}
                            <div className={clsx("w-full h-full bg-gradient-to-tr", cat.previewColor)} />
                        </div>
                    )}
                </button>
            ))}
        </div>
    )
}

export default PresetsWidget
