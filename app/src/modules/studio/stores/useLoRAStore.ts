/**
 * LoRA Store
 * 
 * Zustand store for managing LoRA state including
 * selected LoRAs, weights, and search filters.
 */

import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

export interface LoRAMetadata {
    id: string;
    name: string;
    path: string;
    description: string;
    tags: string[];
    preview_image?: string;
    trigger_words: string[];
    base_model: string;
    version: string;
    author: string;
}

export interface SelectedLoRA {
    id: string;
    weight: number;
}

interface LoRAStore {
    // Available LoRAs
    loras: LoRAMetadata[];
    loading: boolean;
    error: string | null;

    // Selected LoRAs for mixing
    selectedLoras: SelectedLoRA[];

    // Search/filter
    searchQuery: string;
    selectedTags: string[];

    // Actions
    fetchLoras: () => Promise<void>;
    searchLoras: (query: string, tags?: string[]) => Promise<void>;
    addLoRA: (loraId: string, weight?: number) => void;
    removeLoRA: (loraId: string) => void;
    updateWeight: (loraId: string, weight: number) => void;
    clearSelection: () => void;
    setSearchQuery: (query: string) => void;
    setSelectedTags: (tags: string[]) => void;
}

export const useLoRAStore = create<LoRAStore>((set, get) => ({
    loras: [],
    loading: false,
    error: null,
    selectedLoras: [],
    searchQuery: '',
    selectedTags: [],

    fetchLoras: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiFetch<LoRAMetadata[]>('/loras');
            set({ loras: data, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    searchLoras: async (query: string, tags?: string[]) => {
        set({ loading: true, error: null });
        try {
            const data = await apiFetch<LoRAMetadata[]>('/loras/search', {
                method: 'POST',
                body: JSON.stringify({ query, tags })
            });
            set({ loras: data, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addLoRA: (loraId: string, weight = 1.0) => {
        const { selectedLoras } = get();
        if (selectedLoras.find((l) => l.id === loraId)) return;
        set({ selectedLoras: [...selectedLoras, { id: loraId, weight }] });
    },

    removeLoRA: (loraId: string) => {
        const { selectedLoras } = get();
        set({ selectedLoras: selectedLoras.filter((l) => l.id !== loraId) });
    },

    updateWeight: (loraId: string, weight: number) => {
        const { selectedLoras } = get();
        set({
            selectedLoras: selectedLoras.map((l) =>
                l.id === loraId ? { ...l, weight } : l
            ),
        });
    },

    clearSelection: () => {
        set({ selectedLoras: [] });
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    setSelectedTags: (tags: string[]) => {
        set({ selectedTags: tags });
    },
}));
