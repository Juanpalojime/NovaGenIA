import { describe, it, expect, beforeEach } from 'vitest'
import { useGenerationStore, STYLE_PRESETS, LIGHTING_PRESETS, CAMERA_PRESETS } from './useGenerationStore'

describe('useGenerationStore', () => {
    beforeEach(() => {
        useGenerationStore.setState({
            params: {
                mode: 'speed',
                aspectRatio: '1:1',
                seed: -1,
                seedLocked: false,
                numImages: 1,
                outputFormat: 'png',
                width: 1024,
                height: 1024,
                style: 'None',
                lighting: 'None',
                camera: 'None',
                aspect: '1:1',
                img2imgStrength: 0.75,
                controlNetModel: 'canny',
                controlNetWeight: 1.0
            },
            aspectRatioConfigs: [],
            magicPromptMode: 'preset'
        })
    })

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const state = useGenerationStore.getState()
            expect(state.params.mode).toBe('speed')
            expect(state.params.numImages).toBe(1)
            expect(state.params.aspectRatio).toBe('1:1')
        })

        it('should have default dimensions', () => {
            const state = useGenerationStore.getState()
            expect(state.params.width).toBe(1024)
            expect(state.params.height).toBe(1024)
        })
    })

    describe('Basic Parameter Updates', () => {
        it('should update mode', () => {
            useGenerationStore.getState().setMode('quality')
            expect(useGenerationStore.getState().params.mode).toBe('quality')
        })

        it('should update number of images', () => {
            useGenerationStore.getState().setNumImages(4)
            expect(useGenerationStore.getState().params.numImages).toBe(4)
        })

        it('should update output format', () => {
            useGenerationStore.getState().setOutputFormat('jpg')
            expect(useGenerationStore.getState().params.outputFormat).toBe('jpg')
        })

        it('should update steps', () => {
            useGenerationStore.getState().setSteps(50)
            expect(useGenerationStore.getState().params.steps).toBe(50)
        })

        it('should update guidance scale', () => {
            useGenerationStore.getState().setGuidanceScale(8.5)
            expect(useGenerationStore.getState().params.guidanceScale).toBe(8.5)
        })
    })

    describe('Seed Management', () => {
        it('should set seed value', () => {
            useGenerationStore.getState().setSeed(12345)
            expect(useGenerationStore.getState().params.seed).toBe(12345)
        })

        it('should toggle seed lock', () => {
            useGenerationStore.getState().toggleSeedLock()
            expect(useGenerationStore.getState().params.seedLocked).toBe(true)
        })

        it('should toggle seed lock back to false', () => {
            useGenerationStore.getState().toggleSeedLock()
            useGenerationStore.getState().toggleSeedLock()
            expect(useGenerationStore.getState().params.seedLocked).toBe(false)
        })

        it('should randomize seed', () => {
            const initialSeed = useGenerationStore.getState().params.seed
            useGenerationStore.getState().randomizeSeed()
            const newSeed = useGenerationStore.getState().params.seed

            expect(newSeed).not.toBe(initialSeed)
            expect(newSeed).toBeGreaterThan(0)
        })
    })

    describe('Aspect Ratio', () => {
        beforeEach(() => {
            // Set up aspect ratio configs
            useGenerationStore.getState().setAspectRatioConfigs([
                { id: '1:1', name: 'Square', ratio: '1:1', width: 1024, height: 1024, category: 'square', recommended_steps: 30 },
                { id: '16:9', name: 'Widescreen', ratio: '16:9', width: 1344, height: 768, category: 'horizontal', recommended_steps: 32 }
            ])
        })

        it('should update aspect ratio and dimensions', () => {
            useGenerationStore.getState().setAspectRatio('16:9')

            const params = useGenerationStore.getState().params
            expect(params.aspectRatio).toBe('16:9')
            expect(params.width).toBe(1344)
            expect(params.height).toBe(768)
        })

        it('should get aspect ratio config', () => {
            const config = useGenerationStore.getState().getAspectRatioConfig('1:1')
            expect(config?.name).toBe('Square')
            expect(config?.width).toBe(1024)
        })
    })

    describe('Preset System', () => {
        it('should update style preset', () => {
            useGenerationStore.getState().setStyle('Cinematic')
            expect(useGenerationStore.getState().params.style).toBe('Cinematic')
        })

        it('should update lighting preset', () => {
            useGenerationStore.getState().setLighting('Golden Hour')
            expect(useGenerationStore.getState().params.lighting).toBe('Golden Hour')
        })

        it('should update camera preset', () => {
            useGenerationStore.getState().setCamera('Wide Angle')
            expect(useGenerationStore.getState().params.camera).toBe('Wide Angle')
        })

        it('should generate full prompt with style preset', () => {
            useGenerationStore.getState().setStyle('Cinematic')
            const fullPrompt = useGenerationStore.getState().getFullPrompt('a beautiful landscape')

            expect(fullPrompt).toContain('a beautiful landscape')
            expect(fullPrompt).toContain(STYLE_PRESETS['Cinematic'])
        })

        it('should generate full prompt with multiple presets', () => {
            useGenerationStore.getState().setStyle('Photorealistic')
            useGenerationStore.getState().setLighting('Golden Hour')
            useGenerationStore.getState().setCamera('Portrait')

            const fullPrompt = useGenerationStore.getState().getFullPrompt('a portrait')

            expect(fullPrompt).toContain('a portrait')
            expect(fullPrompt).toContain(STYLE_PRESETS['Photorealistic'])
            expect(fullPrompt).toContain(LIGHTING_PRESETS['Golden Hour'])
            expect(fullPrompt).toContain(CAMERA_PRESETS['Portrait'])
        })

        it('should not add preset text when set to None', () => {
            useGenerationStore.getState().setStyle('None')
            const fullPrompt = useGenerationStore.getState().getFullPrompt('test prompt')

            expect(fullPrompt).toBe('test prompt')
        })
    })

    describe('Img2Img Parameters', () => {
        it('should set init image', () => {
            const imageData = 'data:image/png;base64,fake'
            useGenerationStore.getState().setInitImage(imageData)
            expect(useGenerationStore.getState().params.initImage).toBe(imageData)
        })

        it('should clear init image', () => {
            useGenerationStore.getState().setInitImage('data:image/png;base64,fake')
            useGenerationStore.getState().setInitImage(undefined)
            expect(useGenerationStore.getState().params.initImage).toBeUndefined()
        })

        it('should set img2img strength', () => {
            useGenerationStore.getState().setImg2ImgStrength(0.5)
            expect(useGenerationStore.getState().params.img2imgStrength).toBe(0.5)
        })
    })

    describe('ControlNet Parameters', () => {
        it('should set ControlNet model', () => {
            useGenerationStore.getState().setControlNetModel('depth')
            expect(useGenerationStore.getState().params.controlNetModel).toBe('depth')
        })

        it('should set ControlNet image', () => {
            const imageData = 'data:image/png;base64,control'
            useGenerationStore.getState().setControlNetImage(imageData)
            expect(useGenerationStore.getState().params.controlNetImage).toBe(imageData)
        })

        it('should set ControlNet weight', () => {
            useGenerationStore.getState().setControlNetWeight(0.8)
            expect(useGenerationStore.getState().params.controlNetWeight).toBe(0.8)
        })
    })

    describe('Face Swap Parameters', () => {
        it('should set face swap source image', () => {
            const sourceImage = 'data:image/png;base64,source'
            useGenerationStore.getState().setFaceSwapSource(sourceImage)
            expect(useGenerationStore.getState().params.faceSwapSource).toBe(sourceImage)
        })

        it('should set face swap target image', () => {
            const targetImage = 'data:image/png;base64,target'
            useGenerationStore.getState().setFaceSwapTarget(targetImage)
            expect(useGenerationStore.getState().params.faceSwapTarget).toBe(targetImage)
        })
    })

    describe('Upscale Parameters', () => {
        it('should set upscale image', () => {
            const imageData = 'data:image/png;base64,upscale'
            useGenerationStore.getState().setUpscaleImage(imageData)
            expect(useGenerationStore.getState().params.upscaleImage).toBe(imageData)
        })
    })

    describe('Magic Prompt Mode', () => {
        it('should set magic prompt mode to LLM', () => {
            useGenerationStore.getState().setMagicPromptMode('llm')
            expect(useGenerationStore.getState().magicPromptMode).toBe('llm')
        })

        it('should set magic prompt mode to preset', () => {
            useGenerationStore.getState().setMagicPromptMode('preset')
            expect(useGenerationStore.getState().magicPromptMode).toBe('preset')
        })
    })
})

