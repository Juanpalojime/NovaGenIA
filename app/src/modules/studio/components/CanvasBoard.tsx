import React, { useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { useCanvasStore } from '../stores/useCanvasStore'

const CanvasBoard: React.FC = () => {
    const { zoom, pan, setPan, setZoom, activeTool, setActiveTool, undo, redo, pushToHistory } = useCanvasStore()
    const isDragging = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })

    // Touch State
    const lastTouchDist = useRef<number | null>(null)
    const lastTouchCenter = useRef<{ x: number, y: number } | null>(null)

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            // Tools
            if (e.key.toLowerCase() === 'b') setActiveTool('brush')
            if (e.key.toLowerCase() === 'v') setActiveTool('select')
            if (e.key.toLowerCase() === 'h') setActiveTool('move')
            if (e.key.toLowerCase() === 'm') setActiveTool('mask')

            // Undo/Redo
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault()
                if (e.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setActiveTool, undo, redo])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'move' || e.button === 1) {
            isDragging.current = true
            lastPos.current = { x: e.clientX, y: e.clientY }
        } else if (activeTool === 'brush' || activeTool === 'mask') {
            // Start drawing action -> push current state to history first
            pushToHistory()
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        setPan({ x: pan.x + dx, y: pan.y + dy })
        lastPos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault()
            const delta = -e.deltaY * 0.001
            setZoom(Math.min(Math.max(0.1, zoom + delta), 5))
        }
    }

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            // Pan or Brush
            const touch = e.touches[0]
            if (activeTool === 'move') {
                isDragging.current = true
                lastPos.current = { x: touch.clientX, y: touch.clientY }
            } else if (activeTool === 'brush' || activeTool === 'mask') {
                pushToHistory()
            }
        } else if (e.touches.length === 2) {
            // Pinch / Zoom Start
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2

            lastTouchDist.current = dist
            lastTouchCenter.current = { x: centerX, y: centerY }
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            // Single finger pan (if move tool)
            if (activeTool === 'move' && isDragging.current) {
                const touch = e.touches[0]
                const dx = touch.clientX - lastPos.current.x
                const dy = touch.clientY - lastPos.current.y
                setPan({ x: pan.x + dx, y: pan.y + dy })
                lastPos.current = { x: touch.clientX, y: touch.clientY }
            }
            // Brush logic would go here mapping touch to drawing coords
        } else if (e.touches.length === 2 && lastTouchDist.current !== null && lastTouchCenter.current !== null) {
            // Pinch Zoom & Pan
            e.preventDefault() // Prevent page zoom

            // Calculate new distance for zoom
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )

            // Calculate new center for pan
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2

            // Apply Zoom
            const deltaZoom = dist / lastTouchDist.current
            const newZoom = Math.min(Math.max(0.1, zoom * deltaZoom), 5)
            setZoom(newZoom)

            // Apply Pan (move with fingers)
            const dx = centerX - lastTouchCenter.current.x
            const dy = centerY - lastTouchCenter.current.y
            setPan({ x: pan.x + dx, y: pan.y + dy })

            lastTouchDist.current = dist
            lastTouchCenter.current = { x: centerX, y: centerY }
        }
    }

    const handleTouchEnd = () => {
        isDragging.current = false
        lastTouchDist.current = null
        lastTouchCenter.current = null
    }

    return (
        <div
            className={clsx(
                "absolute inset-0 bg-[#080808] overflow-hidden cursor-crosshair touch-none", // touch-none is crucial
                (activeTool === 'move') && "cursor-grab active:cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Infinite Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    transform: `translate(${pan.x % (20 * zoom)}px, ${pan.y % (20 * zoom)}px)`
                }}
            />

            {/* Content Container */}
            <div
                className="absolute left-1/2 top-1/2 origin-center transition-transform duration-75 ease-out shadow-2xl"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    backgroundColor: '#1a1a1a' // Solid background instead of placeholder image
                }}
            >
                {/* Overlay for tool visualization */}
                {(activeTool === 'brush' || activeTool === 'mask') && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Dynamic Brush Preview would go here (tracking mouse) */}
                        <div className={clsx(
                            "absolute inset-0 opacity-10 transition-opacity duration-300",
                            activeTool === 'brush' ? "bg-neon-cyan/10" : "bg-neon-magenta/10"
                        )} />
                    </div>
                )}
            </div>

            {/* HUD Info */}
            <div className="absolute bottom-6 left-6 flex gap-3 z-10 pointer-events-none">
                <div className="px-3 py-1 bg-black/60 backdrop-blur rounded text-xs text-gray-400 font-mono border border-white/5 flex items-center gap-2">
                    <span>{Math.round(zoom * 100)}%</span>
                    <span className="w-px h-3 bg-white/10" />
                    <span>X: {Math.round(pan.x)} Y: {Math.round(pan.y)}</span>
                </div>
                {/* Shortcut hint - Hidden on Mobile maybe? */}
                <div className="px-2 py-1 bg-black/40 rounded text-[10px] text-gray-600 font-mono border border-white/5 hidden md:block">
                    B: Brush | V: Select | Ctrl+Z: Undo
                </div>
            </div>
        </div>
    )
}

export default CanvasBoard
