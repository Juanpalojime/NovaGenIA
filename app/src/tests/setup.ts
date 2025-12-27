import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for Zustand persist middleware
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
})

    // Make vi available globally for tests
    ; (globalThis as any).vi = vi

