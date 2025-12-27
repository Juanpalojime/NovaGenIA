/**
 * Get the current API endpoint URL from the global store (safely without circular dependency)
 */
export function getApiUrl(): string {
    try {
        const stored = localStorage.getItem('novagen-global-storage')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed && parsed.state && parsed.state.settings && parsed.state.settings.apiEndpoint) {
                return parsed.state.settings.apiEndpoint
            }
            // Try top-level apiEndpoint if settings structure differs
            if (parsed && parsed.state && parsed.state.apiEndpoint) {
                return parsed.state.apiEndpoint
            }
        }
    } catch (e) {
        console.warn('[getApiUrl] Error reading from localStorage:', e)
    }
    return 'http://localhost:7860'
}

/**
 * Make a fetch request to the API with the correct base URL
 * Includes ngrok-skip-browser-warning header to bypass Ngrok warning page
 */
export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
    const apiUrl = getApiUrl()

    // Merge headers to include ngrok bypass
    const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        ...options?.headers
    }

    try {
        const response = await fetch(`${apiUrl}${path}`, {
            ...options,
            headers
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    } catch (error) {
        console.error(`[apiFetch] Error fetching ${path}:`, error)
        throw error
    }
}
