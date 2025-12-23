import { create } from 'zustand'

interface SystemState {
    isConnected: boolean
    ngrokUrl: string | null
    gpuStatus: 'online' | 'offline' | 'busy'
    vramUsage: number // percentage 0-100
    currentJob: string | null // e.g., "Generating 512x512..."
    setConnected: (status: boolean) => void
    setNgrokUrl: (url: string) => void
    setGpuStatus: (status: 'online' | 'offline' | 'busy') => void
    setVramUsage: (usage: number) => void
    setCurrentJob: (job: string | null) => void

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
    vramUsage: 0,
    currentJob: null,

    runtimeSource: 'colab', // Default
    isReconnecting: false,
    lastHeartbeat: null,

    setConnected: (status: boolean) => set({ isConnected: status }),
    setNgrokUrl: (url: string) => set({ ngrokUrl: url }),
    setGpuStatus: (status: 'online' | 'offline' | 'busy') => set({ gpuStatus: status }),
    setVramUsage: (usage: number) => set({ vramUsage: usage }),
    setCurrentJob: (job: string | null) => set({ currentJob: job }),

    setRuntimeSource: (source: 'colab' | 'local' | 'remote') => set({ runtimeSource: source }),
    setIsReconnecting: (isReconnecting: boolean) => set({ isReconnecting }),
    setLastHeartbeat: (timestamp: number) => set({ lastHeartbeat: timestamp }),
}))
