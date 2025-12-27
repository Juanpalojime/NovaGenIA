import React from 'react'
import { Eye, EyeOff, GripVertical, Image as ImageIcon, Wand2, Lock, Unlock } from 'lucide-react'
import { clsx } from 'clsx'
import { useCanvasStore } from '../stores/useCanvasStore'

const LayerManager: React.FC = () => {
    const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility, toggleLayerLock, setLayerBlendMode, addLayer } = useCanvasStore()

    const handleAddLayer = () => {
        addLayer({
            type: 'image',
            name: `Reference Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal'
        })
    }

    return (
        <div className={clsx(
            "bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]",
            "md:absolute md:right-6 md:top-6 md:w-72", // Desktop fixed
            "w-full h-full static" // Mobile fill
        )}>
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Layers</span>
                    <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-1.5 py-0.5 rounded font-mono">{layers.length}</span>
                </div>
                {/* Blend Mode Selector for Active Layer */}
                <select
                    className="bg-black/40 border border-white/10 text-[10px] text-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-neon-cyan"
                    value={layers.find(l => l.id === activeLayerId)?.blendMode || 'normal'}
                    onChange={(e) => activeLayerId && setLayerBlendMode(activeLayerId, e.target.value as any)}
                >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                </select>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id)}
                        className={clsx(
                            "relative flex flex-col gap-1 p-2 rounded-lg border transition-all cursor-pointer group",
                            layer.id === activeLayerId
                                ? "bg-white/5 border-neon-cyan/30 shadow-neon-cyan/5"
                                : "hover:bg-white/5 border-transparent hover:border-white/5"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical size={14} className="text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }}
                                className={clsx("transition-colors", !layer.visible ? "text-gray-600" : "text-gray-400 hover:text-white")}
                            >
                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id) }}
                                className={clsx("transition-colors", layer.locked ? "text-neon-magenta" : "text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100")}
                            >
                                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>

                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {layer.type === 'mask' ? <Wand2 size={14} className="text-neon-magenta" /> : <ImageIcon size={14} className="text-neon-cyan" />}
                                <span className={clsx("text-sm truncate font-medium", layer.visible ? "text-gray-200" : "text-gray-500")}>
                                    {layer.name}
                                </span>
                            </div>
                        </div>

                        {/* Selected Layer Properties */}
                        {layer.id === activeLayerId && (
                            <div className="flex items-center gap-2 pl-8 pr-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                <span className="text-[10px] text-gray-500">Op</span>
                                <input type="range" className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                                <span className="text-[10px] text-gray-500 w-6 text-right">{layer.opacity}%</span>
                            </div>
                        )}

                        {/* Active Indicator Glow */}
                        {layer.id === activeLayerId && (
                            <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.1)] pointer-events-none" />
                        )}
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-white/10">
                <button
                    onClick={handleAddLayer}
                    className="w-full py-1.5 text-xs font-medium text-center text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                    + Add Reference Layer
                </button>
            </div>
        </div>
    )
}

export default LayerManager
