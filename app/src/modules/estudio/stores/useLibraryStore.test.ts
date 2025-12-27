import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLibraryStore } from './useLibraryStore'
import type { Asset } from './useLibraryStore'

describe('useLibraryStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useLibraryStore.setState({
            assets: [],
            selectedAssetIds: [],
            viewMode: 'grid',
            searchTerm: '',
            activeTags: [],
            history: [],
            future: []
        })
    })

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const state = useLibraryStore.getState()
            expect(state.assets).toEqual([])
            expect(state.selectedAssetIds).toEqual([])
            expect(state.viewMode).toBe('grid')
            expect(state.searchTerm).toBe('')
        })
    })

    describe('Asset Management', () => {
        const mockAsset: Asset = {
            id: 'asset-1',
            url: '/outputs/test.png',
            prompt: 'Test prompt',
            width: 1024,
            height: 1024,
            createdAt: Date.now(),
            tags: ['test'],
            model: 'Juggernaut-XL v9',
            isFavorite: false,
            seed: 12345
        }

        it('should set assets', () => {
            useLibraryStore.getState().setAssets([mockAsset])
            expect(useLibraryStore.getState().assets).toHaveLength(1)
            expect(useLibraryStore.getState().assets[0].id).toBe('asset-1')
        })

        it('should add assets to beginning of list', () => {
            const asset1: Asset = { ...mockAsset, id: 'asset-1' }
            const asset2: Asset = { ...mockAsset, id: 'asset-2' }

            useLibraryStore.getState().setAssets([asset1])
            useLibraryStore.getState().addAssets([asset2])

            const assets = useLibraryStore.getState().assets
            expect(assets).toHaveLength(2)
            expect(assets[0].id).toBe('asset-2') // New asset should be first
            expect(assets[1].id).toBe('asset-1')
        })

        it('should remove asset by id', () => {
            useLibraryStore.getState().setAssets([mockAsset])
            useLibraryStore.getState().removeAsset('asset-1')

            expect(useLibraryStore.getState().assets).toHaveLength(0)
        })

        it('should delete multiple assets', () => {
            const assets: Asset[] = [
                { ...mockAsset, id: 'asset-1' },
                { ...mockAsset, id: 'asset-2' },
                { ...mockAsset, id: 'asset-3' }
            ]

            useLibraryStore.getState().setAssets(assets)
            useLibraryStore.getState().deleteAssets(['asset-1', 'asset-3'])

            const remaining = useLibraryStore.getState().assets
            expect(remaining).toHaveLength(1)
            expect(remaining[0].id).toBe('asset-2')
        })
    })

    describe('Selection Management', () => {
        const mockAssets: Asset[] = [
            {
                id: 'asset-1',
                url: '/test1.png',
                prompt: 'Test 1',
                width: 1024,
                height: 1024,
                createdAt: Date.now(),
                tags: [],
                model: 'Test',
                isFavorite: false,
                seed: 1
            },
            {
                id: 'asset-2',
                url: '/test2.png',
                prompt: 'Test 2',
                width: 1024,
                height: 1024,
                createdAt: Date.now(),
                tags: [],
                model: 'Test',
                isFavorite: false,
                seed: 2
            }
        ]

        beforeEach(() => {
            useLibraryStore.getState().setAssets(mockAssets)
        })

        it('should toggle single selection', () => {
            useLibraryStore.getState().toggleSelection('asset-1', false)
            expect(useLibraryStore.getState().selectedAssetIds).toEqual(['asset-1'])
        })

        it('should deselect when toggling same asset', () => {
            useLibraryStore.getState().toggleSelection('asset-1', false)
            useLibraryStore.getState().toggleSelection('asset-1', false)
            expect(useLibraryStore.getState().selectedAssetIds).toEqual([])
        })

        it('should support multi-selection', () => {
            useLibraryStore.getState().toggleSelection('asset-1', true)
            useLibraryStore.getState().toggleSelection('asset-2', true)

            const selected = useLibraryStore.getState().selectedAssetIds
            expect(selected).toHaveLength(2)
            expect(selected).toContain('asset-1')
            expect(selected).toContain('asset-2')
        })

        it('should clear all selections', () => {
            useLibraryStore.getState().toggleSelection('asset-1', true)
            useLibraryStore.getState().toggleSelection('asset-2', true)
            useLibraryStore.getState().clearSelection()

            expect(useLibraryStore.getState().selectedAssetIds).toEqual([])
        })
    })

    describe('Favorites', () => {
        const mockAsset: Asset = {
            id: 'asset-1',
            url: '/test.png',
            prompt: 'Test',
            width: 1024,
            height: 1024,
            createdAt: Date.now(),
            tags: [],
            model: 'Test',
            isFavorite: false,
            seed: 1
        }

        it('should toggle favorite status', () => {
            useLibraryStore.getState().setAssets([mockAsset])
            useLibraryStore.getState().toggleFavorite('asset-1')

            expect(useLibraryStore.getState().assets[0].isFavorite).toBe(true)
        })

        it('should toggle favorite back to false', () => {
            useLibraryStore.getState().setAssets([mockAsset])
            useLibraryStore.getState().toggleFavorite('asset-1')
            useLibraryStore.getState().toggleFavorite('asset-1')

            expect(useLibraryStore.getState().assets[0].isFavorite).toBe(false)
        })
    })

    describe('View Mode', () => {
        it('should set view mode to list', () => {
            useLibraryStore.getState().setViewMode('list')
            expect(useLibraryStore.getState().viewMode).toBe('list')
        })

        it('should set view mode to grid', () => {
            useLibraryStore.getState().setViewMode('grid')
            expect(useLibraryStore.getState().viewMode).toBe('grid')
        })
    })

    describe('Search and Filtering', () => {
        it('should set search term', () => {
            useLibraryStore.getState().setSearchTerm('landscape')
            expect(useLibraryStore.getState().searchTerm).toBe('landscape')
        })

        it('should set active tags', () => {
            const tags = ['nature', 'portrait']
            useLibraryStore.getState().setActiveTags(tags)
            expect(useLibraryStore.getState().activeTags).toEqual(tags)
        })
    })

    describe('Undo/Redo', () => {
        const mockAssets: Asset[] = [
            {
                id: 'asset-1',
                url: '/test.png',
                prompt: 'Test',
                width: 1024,
                height: 1024,
                createdAt: Date.now(),
                tags: [],
                model: 'Test',
                isFavorite: false,
                seed: 1
            }
        ]

        it('should support undo after deletion', () => {
            useLibraryStore.getState().setAssets(mockAssets)
            useLibraryStore.getState().removeAsset('asset-1')

            expect(useLibraryStore.getState().assets).toHaveLength(0)

            useLibraryStore.getState().undo()
            expect(useLibraryStore.getState().assets).toHaveLength(1)
        })

        it('should support redo after undo', () => {
            useLibraryStore.getState().setAssets(mockAssets)
            useLibraryStore.getState().removeAsset('asset-1')
            useLibraryStore.getState().undo()
            useLibraryStore.getState().redo()

            expect(useLibraryStore.getState().assets).toHaveLength(0)
        })

        it('should not undo when history is empty', () => {
            const initialAssets = useLibraryStore.getState().assets
            useLibraryStore.getState().undo()

            expect(useLibraryStore.getState().assets).toEqual(initialAssets)
        })
    })

    describe('Fetch Library', () => {
        it('should fetch library from API', async () => {
            const mockAssets = [
                {
                    id: 'gen_1',
                    url: '/outputs/gen_1.png',
                    prompt: 'Test',
                    width: 1024,
                    height: 1024,
                    createdAt: Date.now(),
                    tags: ['generated'],
                    model: 'Juggernaut-XL v9',
                    isFavorite: false,
                    seed: 0
                }
            ]

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockAssets
            })

            await useLibraryStore.getState().fetchLibrary()

            expect(useLibraryStore.getState().assets).toHaveLength(1)
        })

        it('should handle fetch errors gracefully', async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

            await useLibraryStore.getState().fetchLibrary()

            // Should not crash, assets remain empty
            expect(useLibraryStore.getState().assets).toEqual([])
        })
    })
})
