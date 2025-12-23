import { create } from 'zustand'
import { useGlobalStore } from '@/store/useGlobalStore'

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
    startTraining: () => Promise<void>
    stopTraining: () => void
    previewCheckpoint: (checkpointId: string) => void
}

export const useTrainingStore = create<TrainingState>((set) => ({
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
        vramUsage: 0,
        gpuTemp: 0,
        gpuUtil: 0
    },
    batchPreviews: [],

    setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),

    toggleMagicMode: () => set((state) => {
        const newMode = !state.config.isMagicMode
        // Auto-tune parameters
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
        logs: [...state.logs, `[Dataset] Added ${images.length} new images.`]
    })),

    removeDatasetImage: (id) => set((state) => ({ dataset: state.dataset.filter(img => img.id !== id) })),

    startTraining: async () => {
        const state = useTrainingStore.getState()
        const { apiEndpoint } = useGlobalStore.getState()

        try {
            // Call real training API
            const response = await fetch(`${apiEndpoint}/train`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_name: state.config.modelName,
                    steps: state.config.steps,
                    learning_rate: state.config.learningRate,
                    batch_size: state.config.batchSize,
                    trigger_word: state.config.triggerWord
                })
            })

            if (!response.ok) {
                throw new Error('Training failed to start')
            }

            const data = await response.json()

            set({
                activeJob: {
                    id: data.job_id || `job-${Date.now()}`,
                    name: state.config.modelName,
                    status: 'training',
                    progress: 0,
                    currentStep: 0,
                    totalSteps: state.config.steps,
                    loss: 0,
                    elapsedTime: '00:00',
                    thumbnail: '',
                    type: 'lora',
                    checkpoints: []
                },
                logs: [`[${new Date().toLocaleTimeString()}] Training started: ${state.config.modelName}`]
            })

            // TODO: Implement real-time progress polling from backend

        } catch (error) {
            console.error('Training error:', error)
            set({
                logs: [`[${new Date().toLocaleTimeString()}] ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`],
                activeJob: {
                    id: `job-${Date.now()}`,
                    name: state.config.modelName,
                    status: 'failed',
                    progress: 0,
                    currentStep: 0,
                    totalSteps: state.config.steps,
                    loss: 0,
                    elapsedTime: '00:00',
                    thumbnail: '',
                    type: 'lora',
                    checkpoints: []
                }
            })
        }
    },

    stopTraining: () => set({ activeJob: null }),

    previewCheckpoint: (_checkpointId: string) => {
        // Logic to load checkpoint preview
        // TODO: Implement when backend supports it
    }
}))
