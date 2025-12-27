import { create } from 'zustand'

interface Job {
    id: string
    type: string
    status: 'processing' | 'complete' | 'failed'
    progress: number
}

interface SystemState {
    isConnected: boolean
    ngrokUrl: string | null
    gpuStatus: 'online' | 'offline' | 'busy'
    gpuName: string | null
    vramUsage: number // percentage 0-100
    currentJob: Job | null
    setConnected: (status: boolean) => void
    setNgrokUrl: (url: string) => void
    setGpuStatus: (status: 'online' | 'offline' | 'busy') => void
    setGpuName: (name: string | null) => void
    setVramUsage: (usage: number) => void
    setCurrentJob: (job: Job | null) => void

    // Job management
    startJob: (job: Job) => void
    updateJobProgress: (progress: number) => void
    completeJob: () => void

    // New Ultra-Pro Features
    runtimeSource: 'colab' | 'local' | 'remote'
    isReconnecting: boolean
    lastHeartbeat: number | null
    setRuntimeSource: (source: 'colab' | 'local' | 'remote') => void
    setIsReconnecting: (isReconnecting: boolean) => void
    setLastHeartbeat: (timestamp: number) => void
}

export const useSystemStore = create<SystemState>((set) => ({
    isConnected: false,
    ngrokUrl: null,
    gpuStatus: 'offline',
    gpuName: 'Loading...',
    vramUsage: 0,
    currentJob: null,

    runtimeSource: 'colab', // Default
    isReconnecting: false,
    lastHeartbeat: null,

    setConnected: (status: boolean) => set({ isConnected: status }),
    setNgrokUrl: (url: string) => set({ ngrokUrl: url }),
    setGpuStatus: (status: 'online' | 'offline' | 'busy') => set({ gpuStatus: status }),
    setGpuName: (name: string | null) => set({ gpuName: name }),
    setVramUsage: (usage: number) => set({ vramUsage: usage }),
    setCurrentJob: (job: Job | null) => set({ currentJob: job }),

    // Job management methods
    startJob: (job: Job) => set({ currentJob: job, gpuStatus: 'busy' }),
    updateJobProgress: (progress: number) => set((state) =>
        state.currentJob ? { currentJob: { ...state.currentJob, progress } } : {}
    ),
    completeJob: () => set({ currentJob: null, gpuStatus: 'online' }),

    setRuntimeSource: (source: 'colab' | 'local' | 'remote') => set({ runtimeSource: source }),
    setIsReconnecting: (isReconnecting: boolean) => set({ isReconnecting }),
    setLastHeartbeat: (timestamp: number) => set({ lastHeartbeat: timestamp }),
}))
