import { create } from 'zustand'
import { apiFetch, getApiUrl } from '@/lib/api'

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
    selectedAssetIds: string[] // Changed to string[] to match usage in components
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
    toggleFavorite: (id: string) => void
    setViewMode: (mode: 'grid' | 'list') => void
    deleteAssets: (ids: string[]) => void
    removeAsset: (id: string) => void
    setSearchTerm: (term: string) => void
    setActiveTags: (tags: string[]) => void
    fetchLibrary: () => Promise<void>

    // Advanced
    undo: () => void
    redo: () => void
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    assets: [],
    selectedAssetIds: [],
    viewMode: 'grid',
    searchTerm: '',
    activeTags: [],
    history: [],
    future: [],

    setAssets: (assets) => set({ assets }),

    fetchLibrary: async () => {
        try {
            const apiUrl = getApiUrl();
            const data = await apiFetch('/gallery');

            // Prepend API URL to relative image paths
            const assetsWithFullUrls = data.map((asset: Asset) => ({
                ...asset,
                url: asset.url.startsWith('http') ? asset.url : `${apiUrl}${asset.url}`
            }));
            set({ assets: assetsWithFullUrls });
        } catch (error) {
            console.error("Error fetching library:", error);
        }
    },

    addAssets: (newAssets) => set((state) => ({
        assets: [...newAssets, ...state.assets]
    })),

    toggleSelection: (id, multi = false) => set((state) => {
        const currentSelection = state.selectedAssetIds;
        let newSelection: string[];

        if (multi) {
            if (currentSelection.includes(id)) {
                newSelection = currentSelection.filter(item => item !== id);
            } else {
                newSelection = [...currentSelection, id];
            }
        } else {
            // Single selection behavior: toggle if same, else select only new one
            if (currentSelection.length === 1 && currentSelection[0] === id) {
                newSelection = [];
            } else {
                newSelection = [id];
            }
        }

        return { selectedAssetIds: newSelection };
    }),

    clearSelection: () => set({ selectedAssetIds: [] }),

    setViewMode: (mode) => set({ viewMode: mode }),

    toggleFavorite: (id) => set((state) => ({
        assets: state.assets.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)
    })),

    deleteAssets: async (ids) => {
        const { assets, history } = get()

        // 1. Call backend for each
        for (const id of ids) {
            try {
                await apiFetch(`/gallery/asset/${id}`, { method: 'DELETE' })
            } catch (e) {
                console.error(`Failed to delete asset ${id} from server`, e)
            }
        }

        // 2. Update local state
        const newHistory = [assets, ...history].slice(0, 10)
        set({
            assets: assets.filter(a => !ids.includes(a.id)),
            selectedAssetIds: [],
            history: newHistory,
            future: []
        })
    },

    removeAsset: (id) => {
        const { assets, history } = get()
        // Save current state to history before deleting
        const newHistory = [assets, ...history].slice(0, 10)

        set({
            assets: assets.filter(a => a.id !== id),
            history: newHistory,
            future: []
        })
    },

    setSearchTerm: (term) => set({ searchTerm: term }),

    setActiveTags: (tags) => set({ activeTags: tags }),

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
