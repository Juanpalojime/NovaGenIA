import { create } from 'zustand'

export interface Asset {
    id: string
    url: string
    prompt: string
    negativePrompt?: string
    width: number
    height: number
    createdAt: number
    tags: string[]
    model: string
    isFavorite: boolean
    seed: number
}

interface LibraryState {
    assets: Asset[]
    selectedAssetIds: string[]
    viewMode: 'grid' | 'list'
    searchTerm: string
    activeTags: string[]
    history: Asset[][]
    future: Asset[][]

    // Actions
    setAssets: (assets: Asset[]) => void
    addAssets: (assets: Asset[]) => void
    toggleSelection: (id: string, multi: boolean) => void
    clearSelection: () => void
    setViewMode: (mode: 'grid' | 'list') => void
    toggleFavorite: (id: string) => void
    deleteAssets: (ids: string[]) => void
    setSearchTerm: (term: string) => void

    // Advanced
    undo: () => void
    redo: () => void
}

// Mock Data
const generateMockAssets = (count: number): Asset[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `asset-${i}`,
        url: `https://picsum.photos/seed/${i * 123}/512/${i % 3 === 0 ? 768 : 512}`, // Random aspect ratios
        prompt: i % 2 === 0 ? "cyberpunk street scene, neon lights, rain, 8k" : "portrait of an android, cinematic lighting, detailed face",
        width: 512,
        height: i % 3 === 0 ? 768 : 512,
        createdAt: Date.now() - i * 1000000,
        tags: i % 2 === 0 ? ['cyberpunk', 'city'] : ['portrait', 'scifi'],
        model: 'SDXL 1.0',
        isFavorite: Math.random() > 0.8,
        seed: Math.floor(Math.random() * 1000000)
    }))
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    assets: generateMockAssets(20),
    selectedAssetIds: new Set(),
    viewMode: 'masonry',
    searchTerm: '',
    activeTags: [],
    history: [],
    future: [],

    setAssets: (assets) => set({ assets }),
    addAssets: (newAssets) => set((state) => ({ assets: [...newAssets, ...state.assets] })),
    toggleSelection: (id, multi = false) => set((state) => {
        const newSelection = new Set(multi ? state.selectedAssetIds : [])
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        return { selectedAssetIds: newSelection }
    }),

    clearSelection: () => set({ selectedAssetIds: new Set() }),

    setViewMode: (mode) => set({ viewMode: mode }),

    toggleFavorite: (id) => set((state) => ({
        assets: state.assets.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)
    })),

    deleteAssets: (ids) => {
        const { assets, history } = get()
        const newHistory = [assets, ...history].slice(0, 10)
        set({
            assets: assets.filter(a => !ids.includes(a.id)),
            selectedAssetIds: new Set(),
            history: newHistory,
            future: []
        })
    },

    setSearchTerm: (term) => set({ searchTerm: term }),

    undo: () => {
        const { history, assets, future } = get()
        if (history.length === 0) return

        const previousAssets = history[0]
        const newHistory = history.slice(1)

        set({
            assets: previousAssets,
            history: newHistory,
            future: [assets, ...future]
        })
    },

    redo: () => {
        const { future, assets, history } = get()
        if (future.length === 0) return

        const nextAssets = future[0]
        const newFuture = future.slice(1)

        set({
            assets: nextAssets,
            history: [assets, ...history],
            future: newFuture
        })
    }
}))
