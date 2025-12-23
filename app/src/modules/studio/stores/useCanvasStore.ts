import { create } from 'zustand'

interface Layer {
    id: string
    type: 'image' | 'mask' | 'controlnet'
    name: string
    visible: boolean
    locked: boolean
    opacity: number
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
    previewUrl?: string
}

interface CanvasState {
    zoom: number
    pan: { x: number; y: number }
    activeTool: 'select' | 'brush' | 'mask' | 'move'
    activeLayerId: string | null
    layers: Layer[]
    history: Layer[][]
    future: Layer[][]

    setZoom: (zoom: number) => void
    setPan: (pan: { x: number; y: number }) => void
    setActiveTool: (tool: 'select' | 'brush' | 'mask' | 'move') => void
    setActiveLayer: (id: string) => void

    toggleLayerVisibility: (id: string) => void
    toggleLayerLock: (id: string) => void
    setLayerOpacity: (id: string, opacity: number) => void
    setLayerBlendMode: (id: string, mode: Layer['blendMode']) => void
    reorderLayers: (dragIndex: number, hoverIndex: number) => void
    addLayer: (layer: Omit<Layer, 'id'>) => void
    resetView: () => void

    pushToHistory: () => void
    undo: () => void
    redo: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    zoom: 1,
    pan: { x: 0, y: 0 },
    activeTool: 'select',
    activeLayerId: '1',
    layers: [
        { id: '1', type: 'image', name: 'Base Generation', visible: true, locked: false, opacity: 100, blendMode: 'normal' },
        { id: '2', type: 'mask', name: 'Inpaint Mask', visible: true, locked: false, opacity: 100, blendMode: 'normal' },
    ],
    history: [],
    future: [],

    setZoom: (zoom) => set({ zoom }),
    setPan: (pan) => set({ pan }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setActiveLayer: (id) => set({ activeLayerId: id }),

    toggleLayerVisibility: (id) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l)
    })),

    toggleLayerLock: (id) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l)
    })),

    setLayerOpacity: (id, opacity) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, opacity } : l)
    })),

    setLayerBlendMode: (id, mode) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, blendMode: mode } : l)
    })),

    reorderLayers: (dragIndex, hoverIndex) => set((state) => {
        const newLayers = [...state.layers]
        const [removed] = newLayers.splice(dragIndex, 1)
        newLayers.splice(hoverIndex, 0, removed)
        return { layers: newLayers }
    }),

    addLayer: (layer) => set((state) => {
        const newLayer: Layer = {
            ...layer,
            id: `layer-${Date.now()}`
        }
        return {
            layers: [...state.layers, newLayer],
            activeLayerId: newLayer.id
        }
    }),

    resetView: () => set({
        zoom: 1,
        pan: { x: 0, y: 0 }
    }),

    pushToHistory: () => {
        const { layers, history } = get()
        // Limit history to 20 steps
        const newHistory = [layers, ...history].slice(0, 20)
        set({ history: newHistory, future: [] })
    },

    undo: () => {
        const { history, layers, future } = get()
        if (history.length === 0) return

        const previousLayers = history[0]
        const newHistory = history.slice(1)

        set({
            layers: previousLayers,
            history: newHistory,
            future: [layers, ...future]
        })
    },

    redo: () => {
        const { future, layers, history } = get()
        if (future.length === 0) return

        const nextLayers = future[0]
        const newFuture = future.slice(1)

        set({
            layers: nextLayers,
            history: [layers, ...history],
            future: newFuture
        })
    }
}))
