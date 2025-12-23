import React from 'react'
import { Aperture, Type, Sun, Monitor } from 'lucide-react'
import { clsx } from 'clsx'

const PresetsWidget: React.FC = () => {

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
                    className="flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-neon-cyan/30 transition-all group relative overflow-hidden"
                >
                    {/* Hover Preview Background */}
                    <div className={clsx(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                        cat.previewColor
                    )} />

                    <div className="flex items-center gap-2">
                        <cat.icon size={14} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-300">{cat.name}</span>
                    </div>
                    <span className="text-xs text-neon-cyan font-mono">{cat.current}</span>
                </button>
            ))}
        </div>
    )
}

export default PresetsWidget
