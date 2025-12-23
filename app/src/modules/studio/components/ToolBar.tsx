import React from 'react'
import { MousePointer2, Move, Brush, Eraser, Layers, Maximize } from 'lucide-react'
import { clsx } from 'clsx'
import { useCanvasStore } from '../stores/useCanvasStore'

const ToolBar: React.FC = () => {
    const { activeTool, setActiveTool } = useCanvasStore()

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'move', icon: Move, label: 'Pan' },
        { id: 'brush', icon: Brush, label: 'Inpaint Brush' },
        { id: 'mask', icon: Eraser, label: 'Mask Eraser' },
    ] as const

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-30">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={clsx(
                        "p-3 rounded-xl transition-all duration-200 group relative",
                        activeTool === tool.id
                            ? "bg-neon-cyan text-black shadow-neon-cyan"
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title={tool.label}
                >
                    <tool.icon size={20} />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-4 px-2 py-1 bg-black border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {tool.label}
                    </span>
                </button>
            ))}

            <div className="w-full h-px bg-white/10 my-1" />

            <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Fit to Screen">
                <Maximize size={20} />
            </button>
        </div>
    )
}

export default ToolBar
