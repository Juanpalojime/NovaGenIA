/**
 * Model Hub Store
 * 
 * Zustand store for managing Model Hub state including
 * search results, downloads, and installed models.
 */

import { create } from 'zustand';

export interface ModelInfo {
    id: string;
    name: string;
    author: string;
    downloads: number;
    likes: number;
    tags: string[];
    created_at?: string;
    last_modified?: string;
}

export interface InstalledModel {
    id: string;
    name: string;
    type: string;
    path: string;
    size_mb: number;
}

export interface DownloadProgress {
    model_id: string;
    progress: number;
    status: 'downloading' | 'complete' | 'error';
    error?: string;
}

interface ModelHubStore {
    // Search
    searchResults: ModelInfo[];
    searchQuery: string;
    modelType: string;
    searching: boolean;

    // Installed models
    installedModels: InstalledModel[];
    loadingInstalled: boolean;

    // Downloads
    activeDownloads: Map<string, DownloadProgress>;

    // Actions
    searchModels: (query: string, type: string) => Promise<void>;
    downloadModel: (modelId: string, type: string) => Promise<void>;
    fetchInstalled: () => Promise<void>;
    deleteModel: (path: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setModelType: (type: string) => void;
}

export const useModelHubStore = create<ModelHubStore>((set, get) => ({
    searchResults: [],
    searchQuery: '',
    modelType: 'all',
    searching: false,
    installedModels: [],
    loadingInstalled: false,
    activeDownloads: new Map(),

    searchModels: async (query: string, type: string) => {
        set({ searching: true });
        try {
            const response = await fetch('/api/hub/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, model_type: type, limit: 20 }),
            });
            if (!response.ok) throw new Error('Search failed');
            const results = await response.json();
            set({ searchResults: results, searching: false });
        } catch (error) {
            console.error('Search error:', error);
            set({ searching: false });
        }
    },

    downloadModel: async (modelId: string, type: string) => {
        const { activeDownloads } = get();

        // Add to active downloads
        activeDownloads.set(modelId, {
            model_id: modelId,
            progress: 0,
            status: 'downloading',
        });
        set({ activeDownloads: new Map(activeDownloads) });

        try {
            const response = await fetch('/api/hub/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_id: modelId, model_type: type }),
            });

            if (!response.ok) throw new Error('Download failed');
            const result = await response.json();

            if (result.success) {
                activeDownloads.set(modelId, {
                    model_id: modelId,
                    progress: 100,
                    status: 'complete',
                });
            } else {
                activeDownloads.set(modelId, {
                    model_id: modelId,
                    progress: 0,
                    status: 'error',
                    error: result.error,
                });
            }
            set({ activeDownloads: new Map(activeDownloads) });

            // Refresh installed models
            get().fetchInstalled();
        } catch (error) {
            activeDownloads.set(modelId, {
                model_id: modelId,
                progress: 0,
                status: 'error',
                error: (error as Error).message,
            });
            set({ activeDownloads: new Map(activeDownloads) });
        }
    },

    fetchInstalled: async () => {
        set({ loadingInstalled: true });
        try {
            const response = await fetch('/api/hub/installed');
            if (!response.ok) throw new Error('Failed to fetch installed models');
            const models = await response.json();
            set({ installedModels: models, loadingInstalled: false });
        } catch (error) {
            console.error('Error fetching installed models:', error);
            set({ loadingInstalled: false });
        }
    },

    deleteModel: async (path: string) => {
        try {
            const response = await fetch(`/api/hub/models/${encodeURIComponent(path)}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Delete failed');

            // Refresh installed models
            get().fetchInstalled();
        } catch (error) {
            console.error('Error deleting model:', error);
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    setModelType: (type: string) => {
        set({ modelType: type });
    },
}));
