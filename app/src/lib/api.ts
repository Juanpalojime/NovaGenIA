import { useGlobalStore } from '../store/useGlobalStore'

/**
 * Get the current API endpoint URL from the global store
 */
export function getApiUrl(): string {
    const { apiEndpoint } = useGlobalStore.getState()
    return apiEndpoint || 'http://localhost:7860'
}

/**
 * Make a fetch request to the API with the correct base URL
 * Includes ngrok-skip-browser-warning header to bypass Ngrok warning page
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const apiUrl = getApiUrl()

    // Merge headers to include ngrok bypass
    const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        ...options?.headers
    }

    return fetch(`${apiUrl}${path}`, {
        ...options,
        headers
    })
}
