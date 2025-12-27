import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTrainingStore } from './useTrainingStore'
import type { DatasetImage } from './useTrainingStore'

describe('useTrainingStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useTrainingStore.setState({
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
            batchPreviews: []
        })
    })

    describe('Initial State', () => {
        it('should have correct default configuration', () => {
            const state = useTrainingStore.getState()
            expect(state.config.baseModel).toBe('sdxl-base-1.0')
            expect(state.config.steps).toBe(1000)
            expect(state.config.learningRate).toBe(0.0001)
            expect(state.config.isMagicMode).toBe(false)
        })

        it('should have no active job initially', () => {
            expect(useTrainingStore.getState().activeJob).toBeNull()
        })

        it('should have empty dataset initially', () => {
            expect(useTrainingStore.getState().dataset).toEqual([])
        })
    })

    describe('Configuration Management', () => {
        it('should update model name', () => {
            useTrainingStore.getState().setConfig({ modelName: 'my-custom-model' })
            expect(useTrainingStore.getState().config.modelName).toBe('my-custom-model')
        })

        it('should update training steps', () => {
            useTrainingStore.getState().setConfig({ steps: 2000 })
            expect(useTrainingStore.getState().config.steps).toBe(2000)
        })

        it('should update learning rate', () => {
            useTrainingStore.getState().setConfig({ learningRate: 0.0005 })
            expect(useTrainingStore.getState().config.learningRate).toBe(0.0005)
        })

        it('should update multiple config values at once', () => {
            useTrainingStore.getState().setConfig({
                modelName: 'test-model',
                steps: 1500,
                batchSize: 4
            })

            const config = useTrainingStore.getState().config
            expect(config.modelName).toBe('test-model')
            expect(config.steps).toBe(1500)
            expect(config.batchSize).toBe(4)
        })
    })

    describe('Magic Mode', () => {
        it('should toggle magic mode on', () => {
            useTrainingStore.getState().toggleMagicMode()
            expect(useTrainingStore.getState().config.isMagicMode).toBe(true)
        })

        it('should toggle magic mode off', () => {
            useTrainingStore.getState().toggleMagicMode()
            useTrainingStore.getState().toggleMagicMode()
            expect(useTrainingStore.getState().config.isMagicMode).toBe(false)
        })

        it('should auto-tune parameters when enabling magic mode', () => {
            useTrainingStore.getState().toggleMagicMode()

            const config = useTrainingStore.getState().config
            expect(config.learningRate).toBe(0.0004)
            expect(config.batchSize).toBe(4)
            expect(config.steps).toBe(2500)
        })
    })

    describe('Dataset Management', () => {
        const mockImage: DatasetImage = {
            id: 'img-1',
            url: 'data:image/png;base64,fake',
            caption: 'Test image',
            width: 512,
            height: 512
        }

        it('should add dataset images', () => {
            useTrainingStore.getState().addDatasetImages([mockImage])

            expect(useTrainingStore.getState().dataset).toHaveLength(1)
            expect(useTrainingStore.getState().dataset[0].id).toBe('img-1')
        })

        it('should add multiple images at once', () => {
            const images: DatasetImage[] = [
                { ...mockImage, id: 'img-1' },
                { ...mockImage, id: 'img-2' },
                { ...mockImage, id: 'img-3' }
            ]

            useTrainingStore.getState().addDatasetImages(images)
            expect(useTrainingStore.getState().dataset).toHaveLength(3)
        })

        it('should log when adding images', () => {
            useTrainingStore.getState().addDatasetImages([mockImage])

            const logs = useTrainingStore.getState().logs
            expect(logs).toHaveLength(1)
            expect(logs[0]).toContain('Added 1 new images')
        })

        it('should remove dataset image by id', () => {
            const images: DatasetImage[] = [
                { ...mockImage, id: 'img-1' },
                { ...mockImage, id: 'img-2' }
            ]

            useTrainingStore.getState().addDatasetImages(images)
            useTrainingStore.getState().removeDatasetImage('img-1')

            const dataset = useTrainingStore.getState().dataset
            expect(dataset).toHaveLength(1)
            expect(dataset[0].id).toBe('img-2')
        })
    })

    describe('Training Job Management', () => {
        it('should stop active training job', () => {
            // Set an active job first
            useTrainingStore.setState({
                activeJob: {
                    id: 'job-1',
                    name: 'test-job',
                    status: 'training',
                    progress: 50,
                    currentStep: 500,
                    totalSteps: 1000,
                    loss: 0.5,
                    elapsedTime: '10:00',
                    thumbnail: '',
                    type: 'lora',
                    checkpoints: []
                }
            })

            useTrainingStore.getState().stopTraining()
            expect(useTrainingStore.getState().activeJob).toBeNull()
        })
    })

    describe('Start Training', () => {
        beforeEach(() => {
            global.fetch = vi.fn()
        })

        it('should prepare dataset before training', async () => {
            const mockImage: DatasetImage = {
                id: 'img-1',
                url: 'data:image/png;base64,fakedata',
                caption: 'Test',
                width: 512,
                height: 512
            }

            useTrainingStore.getState().addDatasetImages([mockImage])
            useTrainingStore.getState().setConfig({ modelName: 'test-model' })

                ; (global.fetch as any).mockResolvedValue({
                    ok: true,
                    json: async () => ({ job_id: 'job-123', status: 'started' })
                })

            await useTrainingStore.getState().startTraining()

            // Should have called upload and train endpoints
            expect(global.fetch).toHaveBeenCalled()
        })

        it('should handle training errors gracefully', async () => {
            useTrainingStore.getState().setConfig({ modelName: 'test-model' })

                ; (global.fetch as any).mockRejectedValue(new Error('Network error'))

            await useTrainingStore.getState().startTraining()

            const state = useTrainingStore.getState()
            expect(state.activeJob?.status).toBe('failed')
            expect(state.logs.some(log => log.includes('ERROR'))).toBe(true)
        })

        it('should create active job when training starts successfully', async () => {
            const mockImage: DatasetImage = {
                id: 'img-1',
                url: 'data:image/png;base64,fake',
                caption: 'Test',
                width: 512,
                height: 512
            }

            useTrainingStore.getState().addDatasetImages([mockImage])
            useTrainingStore.getState().setConfig({ modelName: 'my-model', steps: 1000 })

                ; (global.fetch as any).mockResolvedValue({
                    ok: true,
                    json: async () => ({ job_id: 'job-123' })
                })

            await useTrainingStore.getState().startTraining()

            const activeJob = useTrainingStore.getState().activeJob
            expect(activeJob).not.toBeNull()
            expect(activeJob?.name).toBe('my-model')
            expect(activeJob?.status).toBe('training')
            expect(activeJob?.totalSteps).toBe(1000)
        })
    })
})
