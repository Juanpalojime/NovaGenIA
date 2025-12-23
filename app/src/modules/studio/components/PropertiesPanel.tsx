import React from 'react'
import { Sliders, Zap } from 'lucide-react'
import { useCanvasStore } from '../stores/useCanvasStore'

const PropertiesPanel: React.FC = () => {
    const { activeTool } = useCanvasStore()

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-4 shadow-xl z-30">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <Sliders size={14} className="text-neon-cyan" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {activeTool === 'select' ? 'Canvas Settings' : `${activeTool} Options`}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {activeTool === 'brush' ? (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Size</span>
                            <input type="range" className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Hardness</span>
                            <input type="range" className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-yellow-500" />
                        <span className="text-xs text-gray-300">Fast Preview Mode Active</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertiesPanel
