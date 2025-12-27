import { apiFetch } from './api'
import { useSystemStore } from '../store/useSystemStore'

export interface HealthCheckResponse {
    status: 'online' | 'offline'
    gpu: {
        available: boolean
        name?: string
        vram_total?: number
        vram_used?: number
    }
    model_loaded: boolean
    version?: string
}

/**
 * Check backend health and GPU status
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse | null> {
    try {
        const response = await apiFetch('/health', {
            method: 'GET',
        })

        if (!response.ok) {
            console.error('Health check failed:', response.status)
            return null
        }

        const data = await response.json()
        return data as HealthCheckResponse
    } catch (error) {
        console.error('Health check error:', error)
        return null
    }
}

/**
 * Initialize connection monitoring
 * Checks backend health periodically and updates system store
 */
export function startConnectionMonitor(intervalMs: number = 30000) {
    const checkAndUpdate = async () => {
        const health = await checkBackendHealth()
        const store = useSystemStore.getState()

        if (health) {
            store.setConnected(true)
            store.setGpuStatus(health.gpu.available ? 'online' : 'offline')
            if (health.gpu.name) store.setGpuName(health.gpu.name)

            // Calculate VRAM usage percentage
            if (health.gpu.vram_total && health.gpu.vram_used) {
                const vramPercent = (health.gpu.vram_used / health.gpu.vram_total) * 100
                store.setVramUsage(Math.round(vramPercent))
            }

            store.setLastHeartbeat(Date.now())
        } else {
            store.setConnected(false)
            store.setGpuStatus('offline')
        }
    }

    // Initial check
    checkAndUpdate()

    // Periodic checks
    const intervalId = setInterval(checkAndUpdate, intervalMs)

    // Return cleanup function
    return () => clearInterval(intervalId)
}

/**
 * Test connection to backend
 * Returns true if backend is reachable
 */
export async function testConnection(): Promise<boolean> {
    const health = await checkBackendHealth()
    return health !== null && health.status === 'online'
}
