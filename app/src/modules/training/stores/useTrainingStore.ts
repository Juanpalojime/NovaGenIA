import { create } from 'zustand'

export interface TrainingJob {
    id: string
    name: string
    status: 'idle' | 'preparing' | 'training' | 'completed' | 'failed'
    progress: number
    currentStep: number
    totalSteps: number
    loss: number
    elapsedTime: string
    thumbnail: string
    type: 'lora' | 'embedding' | 'hypernetwork'
    checkpoints: Checkpoint[]
}

export interface Checkpoint {
    id: string
    name: string
    step: number
    loss: number
    thumbnail: string
    createdAt: number
}

export interface DatasetImage {
    id: string
    url: string
    caption: string
    width: number
    height: number
}

interface TrainingState {
    activeJob: TrainingJob | null
    recentJobs: TrainingJob[]
    dataset: DatasetImage[]

    // Configuration
    config: {
        modelName: string
        baseModel: string
        triggerWord: string
        steps: number
        learningRate: number
        batchSize: number
        isMagicMode: boolean
    }

    // Monitor Data
    logs: string[]
    metrics: {
        loss: number[]
        learningRate: number[]
        accuracy: number[]
    }
    systemStats: {
        vramUsage: number // 0-100
        gpuTemp: number
        gpuUtil: number
    }
    batchPreviews: string[]

    // Actions
    setConfig: (config: Partial<TrainingState['config']>) => void
    toggleMagicMode: () => void
    addDatasetImages: (images: DatasetImage[]) => void
    removeDatasetImage: (id: string) => void
    startTraining: () => void
    stopTraining: () => void
    previewCheckpoint: (checkpointId: string) => void
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
    activeJob: null,
    recentJobs: [],
    dataset: [],

    config: {
        modelName: '',
        baseModel: 'sdxl-base-1.0',
        triggerWord: '',
        steps: 1000,
        learningRate: 0.0001,
        batchSize: 1,
        isMagicMode: false
    },

    logs: [],
    metrics: {
        loss: [],
        learningRate: [],
        accuracy: []
    },
    systemStats: {
        vramUsage: 45,
        gpuTemp: 62,
        gpuUtil: 30
    },
    batchPreviews: [],

    setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),

    toggleMagicMode: () => set((state) => {
        const newMode = !state.config.isMagicMode
        // Auto-tune simulation
        const autoConfig = newMode ? {
            learningRate: 0.0004,
            batchSize: 4,
            steps: 2500
        } : {}
        return {
            config: { ...state.config, isMagicMode: newMode, ...autoConfig }
        }
    }),

    addDatasetImages: (images) => set((state) => ({
        dataset: [...state.dataset, ...images],
        // Simulate analyzing dataset stats
        logs: [...state.logs, `[Dataset] Analyzed ${images.length} new images directly from drag & drop.`]
    })),

    removeDatasetImage: (id) => set((state) => ({ dataset: state.dataset.filter(img => img.id !== id) })),

    startTraining: () => {
        // ... (Existing start logic, plus init metrics)
        const mockMetrics = Array.from({ length: 50 }, (_, i) => ({
            loss: Math.max(0.01, 0.5 - i * 0.01 + Math.random() * 0.05),
            lr: 0.0001,
            acc: Math.min(0.99, 0.5 + i * 0.01)
        }))

        set({
            activeJob: {
                id: `job-${Date.now()}`,
                name: get().config.modelName || 'Untitled LoRA',
                status: 'preparing',
                progress: 0,
                currentStep: 0,
                totalSteps: get().config.steps,
                loss: 0,
                elapsedTime: '00:00',
                thumbnail: '',
                type: 'lora',
                checkpoints: []
            },
            metrics: {
                loss: mockMetrics.map(m => m.loss),
                learningRate: mockMetrics.map(m => m.lr),
                accuracy: mockMetrics.map(m => m.acc)
            },
            batchPreviews: [
                'https://picsum.photos/seed/batch1/256/256',
                'https://picsum.photos/seed/batch2/256/256',
                'https://picsum.photos/seed/batch3/256/256'
            ]
        })
    },

    stopTraining: () => set({ activeJob: null }),

    previewCheckpoint: (checkpointId) => {
        // Logic to load checkpoint preview
    }
}))
