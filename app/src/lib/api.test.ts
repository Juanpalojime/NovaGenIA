import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getApiUrl, apiFetch } from './api'
import { useGlobalStore } from '../store/useGlobalStore'

describe('API Utilities', () => {
    beforeEach(() => {
        // Reset store to default state
        useGlobalStore.setState({
            apiEndpoint: 'http://localhost:7860'
        })
    })

    describe('getApiUrl', () => {
        it('should return default localhost URL', () => {
            const url = getApiUrl()
            expect(url).toBe('http://localhost:7860')
        })

        it('should return custom API endpoint from store', () => {
            useGlobalStore.setState({
                apiEndpoint: 'https://custom-api.ngrok.io'
            })

            const url = getApiUrl()
            expect(url).toBe('https://custom-api.ngrok.io')
        })

        it('should fallback to localhost if endpoint is empty', () => {
            useGlobalStore.setState({
                apiEndpoint: ''
            })

            const url = getApiUrl()
            expect(url).toBe('http://localhost:7860')
        })
    })

    describe('apiFetch', () => {
        beforeEach(() => {
            // Mock global fetch
            global.fetch = vi.fn()
        })

        it('should make fetch request with correct URL', async () => {
            const mockResponse = { ok: true, json: async () => ({ data: 'test' }) }
                ; (global.fetch as any).mockResolvedValue(mockResponse)

            await apiFetch('/test-endpoint')

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:7860/test-endpoint',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json'
                    })
                })
            )
        })

        it('should include ngrok bypass header', async () => {
            const mockResponse = { ok: true }
                ; (global.fetch as any).mockResolvedValue(mockResponse)

            await apiFetch('/health')

            const callArgs = (global.fetch as any).mock.calls[0][1]
            expect(callArgs.headers['ngrok-skip-browser-warning']).toBe('true')
        })

        it('should merge custom headers with defaults', async () => {
            const mockResponse = { ok: true }
                ; (global.fetch as any).mockResolvedValue(mockResponse)

            await apiFetch('/test', {
                headers: {
                    'Authorization': 'Bearer token123'
                }
            })

            const callArgs = (global.fetch as any).mock.calls[0][1]
            expect(callArgs.headers['ngrok-skip-browser-warning']).toBe('true')
            expect(callArgs.headers['Authorization']).toBe('Bearer token123')
        })

        it('should use custom API endpoint from store', async () => {
            useGlobalStore.setState({
                apiEndpoint: 'https://my-ngrok.io'
            })

            const mockResponse = { ok: true }
                ; (global.fetch as any).mockResolvedValue(mockResponse)

            await apiFetch('/generate')

            expect(global.fetch).toHaveBeenCalledWith(
                'https://my-ngrok.io/generate',
                expect.any(Object)
            )
        })
    })
})
