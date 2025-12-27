import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GenerationMode = 'extreme_speed' | 'speed' | 'quality'
export type AspectRatio = '1:1' | '16:9' | '3:2' | '4:3' | '9:16' | '2:3' | '3:4' | '21:9' | '4:5' | '1:2'
export type MagicPromptMode = 'preset' | 'llm'

// ==================== PRESET CONSTANTS ====================

export const STYLE_PRESETS: Record<string, string> = {
    'None': '',
    'Cinematic': 'cinematic lighting, dramatic composition, film grain, professional color grading',
    'Anime': 'anime style, vibrant colors, cel shaded, manga inspired',
    'Photorealistic': 'photorealistic, ultra detailed, 8k resolution, professional photography',
    'Oil Painting': 'oil painting style, brush strokes, artistic, classical art',
    'Watercolor': 'watercolor painting, soft colors, artistic, flowing',
    'Digital Art': 'digital art, concept art, trending on artstation, highly detailed',
    'Cyberpunk': 'cyberpunk style, neon lights, futuristic, dystopian',
    'Fantasy': 'fantasy art, magical, ethereal, enchanted',
    'Minimalist': 'minimalist style, clean, simple, modern',
    'Retro': 'retro style, vintage, nostalgic, classic'
}

export const LIGHTING_PRESETS: Record<string, string> = {
    'None': '',
    'Golden Hour': 'golden hour lighting, warm tones, soft shadows',
    'Studio': 'studio lighting, professional, well-lit, balanced',
    'Dramatic': 'dramatic lighting, high contrast, chiaroscuro',
    'Neon': 'neon lighting, vibrant colors, glowing',
    'Natural': 'natural lighting, soft, ambient',
    'Moody': 'moody lighting, dark atmosphere, mysterious',
    'Backlit': 'backlit, rim lighting, silhouette',
    'Volumetric': 'volumetric lighting, god rays, atmospheric',
    'Sunset': 'sunset lighting, warm orange glow, long shadows',
    'Night': 'night lighting, moonlight, dark with highlights'
}

export const CAMERA_PRESETS: Record<string, string> = {
    'None': '',
    'Wide Angle': 'wide angle shot, expansive view, 24mm lens',
    'Portrait': 'portrait shot, 85mm lens, shallow depth of field, bokeh',
    'Macro': 'macro photography, extreme close-up, detailed',
    'Aerial': 'aerial view, birds eye perspective, drone shot',
    'Low Angle': 'low angle shot, looking up, dramatic perspective',
    'High Angle': 'high angle shot, looking down, overhead view',
    'Dutch Angle': 'dutch angle, tilted perspective, dynamic',
    'Fisheye': 'fisheye lens, distorted, ultra wide',
    'Telephoto': 'telephoto lens, compressed perspective, 200mm',
    'Cinematic': 'cinematic camera angle, anamorphic, widescreen'
}

export const ASPECT_RATIOS: Record<string, string> = {
    '1:1': 'Square',
    '16:9': 'Widescreen',
    '3:2': 'Photo',
    '4:3': 'Classic',
    '9:16': 'Portrait',
    '2:3': 'Photo Portrait',
    '3:4': 'Classic Portrait',
    '21:9': 'Cinematic',
    '4:5': 'Instagram',
    '1:2': 'Story'
}

// ==================== INTERFACES ====================

export type ControlNetType = 'canny' | 'depth' | 'pyracanny' | 'cpds'

export interface AspectRatioConfig {
    id: string
    name: string
    ratio: string
    width: number
    height: number
    category: string
    recommended_steps: number
}

export interface GenerationParams {
    mode: GenerationMode
    aspectRatio: AspectRatio
    seed: number
    seedLocked: boolean
    steps?: number
    guidanceScale?: number
    numImages: number
    outputFormat: 'png' | 'jpg' | 'webp'
    width: number
    height: number
    // Preset params
    style: string
    lighting: string
    camera: string
    aspect: string
    // Img2Img & ControlNet
    initImage?: string // URL or Base64
    img2imgStrength?: number
    controlNetModel?: ControlNetType
    controlNetImage?: string
    controlNetWeight?: number
    // FaceSwap
    faceSwapSource?: string
    faceSwapTarget?: string
    // Upscale
    upscaleImage?: string
}

interface GenerationState {
    // Parameters
    params: GenerationParams

    // Magic Prompt
    magicPromptMode: MagicPromptMode
    setMagicPromptMode: (mode: MagicPromptMode) => void
    getFullPrompt: (basePrompt: string) => string

    // Setters
    setMode: (mode: GenerationMode) => void
    setAspectRatio: (ratio: AspectRatio) => void
    setSeed: (seed: number) => void
    toggleSeedLock: () => void
    randomizeSeed: () => void
    setSteps: (steps: number) => void
    setGuidanceScale: (scale: number) => void
    setNumImages: (num: number) => void
    setOutputFormat: (format: 'png' | 'jpg' | 'webp') => void

    // Img2Img & ControlNet Setters
    setInitImage: (image: string | undefined) => void
    setImg2ImgStrength: (strength: number) => void
    setControlNetModel: (model: ControlNetType) => void
    setControlNetImage: (image: string | undefined) => void
    setControlNetWeight: (weight: number) => void
    setFaceSwapSource: (image: string | undefined) => void
    setFaceSwapTarget: (image: string | undefined) => void
    setUpscaleImage: (image: string | undefined) => void

    // Preset setters
    setStyle: (style: string) => void
    setLighting: (lighting: string) => void
    setCamera: (camera: string) => void
    setAspect: (aspect: string) => void

    // Aspect ratio configs
    aspectRatioConfigs: AspectRatioConfig[]
    setAspectRatioConfigs: (configs: AspectRatioConfig[]) => void
    getAspectRatioConfig: (ratio: AspectRatio) => AspectRatioConfig | undefined
}

const DEFAULT_ASPECT_RATIOS: AspectRatioConfig[] = [
    { id: '1:1', name: 'Square', ratio: '1:1', width: 1024, height: 1024, category: 'square', recommended_steps: 30 },
    { id: '16:9', name: 'Widescreen', ratio: '16:9', width: 1344, height: 768, category: 'horizontal', recommended_steps: 32 },
    { id: '3:2', name: 'Photo', ratio: '3:2', width: 1216, height: 832, category: 'horizontal', recommended_steps: 30 },
    { id: '4:3', name: 'Classic', ratio: '4:3', width: 1152, height: 896, category: 'horizontal', recommended_steps: 30 },
    { id: '9:16', name: 'Portrait', ratio: '9:16', width: 768, height: 1344, category: 'vertical', recommended_steps: 32 },
    { id: '2:3', name: 'Photo Portrait', ratio: '2:3', width: 832, height: 1216, category: 'vertical', recommended_steps: 30 },
    { id: '3:4', name: 'Classic Portrait', ratio: '3:4', width: 896, height: 1152, category: 'vertical', recommended_steps: 30 },
    { id: '21:9', name: 'Cinematic', ratio: '21:9', width: 1536, height: 640, category: 'cinematic', recommended_steps: 35 },
    { id: '4:5', name: 'Instagram', ratio: '4:5', width: 896, height: 1088, category: 'social', recommended_steps: 28 },
    { id: '1:2', name: 'Story', ratio: '1:2', width: 640, height: 1280, category: 'social', recommended_steps: 32 },
]

export const useGenerationStore = create<GenerationState>()(
    persist(
        (set, get) => ({
            // Initial state
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

            aspectRatioConfigs: DEFAULT_ASPECT_RATIOS,
            magicPromptMode: 'preset',

            // Magic Prompt
            setMagicPromptMode: (mode) => set({ magicPromptMode: mode }),

            getFullPrompt: (basePrompt: string) => {
                const { params } = get()
                const parts = [basePrompt]

                // Add style preset
                if (params.style && params.style !== 'None' && STYLE_PRESETS[params.style]) {
                    parts.push(STYLE_PRESETS[params.style])
                }

                // Add lighting preset
                if (params.lighting && params.lighting !== 'None' && LIGHTING_PRESETS[params.lighting]) {
                    parts.push(LIGHTING_PRESETS[params.lighting])
                }

                // Add camera preset
                if (params.camera && params.camera !== 'None' && CAMERA_PRESETS[params.camera]) {
                    parts.push(CAMERA_PRESETS[params.camera])
                }

                return parts.filter(p => p.trim()).join(', ')
            },

            // Setters
            setMode: (mode) => set((state) => ({
                params: { ...state.params, mode }
            })),

            setAspectRatio: (ratio) => {
                const config = get().getAspectRatioConfig(ratio)
                if (config) {
                    set((state) => ({
                        params: {
                            ...state.params,
                            aspectRatio: ratio,
                            width: config.width,
                            height: config.height
                        }
                    }))
                }
            },

            setSeed: (seed) => set((state) => ({
                params: { ...state.params, seed }
            })),

            toggleSeedLock: () => set((state) => ({
                params: { ...state.params, seedLocked: !state.params.seedLocked }
            })),

            randomizeSeed: () => {
                const newSeed = Math.floor(Math.random() * 2 ** 32)
                set((state) => ({
                    params: { ...state.params, seed: newSeed }
                }))
            },

            setSteps: (steps) => set((state) => ({
                params: { ...state.params, steps }
            })),

            setGuidanceScale: (scale) => set((state) => ({
                params: { ...state.params, guidanceScale: scale }
            })),

            // Img2Img & ControlNet
            setInitImage: (image) => set((state) => ({
                params: { ...state.params, initImage: image }
            })),

            setImg2ImgStrength: (strength) => set((state) => ({
                params: { ...state.params, img2imgStrength: strength }
            })),

            setControlNetModel: (model) => set((state) => ({
                params: { ...state.params, controlNetModel: model }
            })),

            setControlNetImage: (image) => set((state) => ({
                params: { ...state.params, controlNetImage: image }
            })),

            setControlNetWeight: (weight) => set((state) => ({
                params: { ...state.params, controlNetWeight: weight }
            })),

            // Advanced & FaceSwap
            setNumImages: (num) => set((state) => ({
                params: { ...state.params, numImages: num }
            })),
            setOutputFormat: (format) => set((state) => ({
                params: { ...state.params, outputFormat: format }
            })),
            setFaceSwapSource: (image) => set((state) => ({
                params: { ...state.params, faceSwapSource: image }
            })),
            setFaceSwapTarget: (image) => set((state) => ({
                params: { ...state.params, faceSwapTarget: image }
            })),
            setUpscaleImage: (image) => set((state) => ({
                params: { ...state.params, upscaleImage: image }
            })),

            // Preset setters
            setStyle: (style) => set((state) => ({
                params: { ...state.params, style }
            })),

            setLighting: (lighting) => set((state) => ({
                params: { ...state.params, lighting }
            })),

            setCamera: (camera) => set((state) => ({
                params: { ...state.params, camera }
            })),

            setAspect: (aspect) => set((state) => ({
                params: { ...state.params, aspect }
            })),

            setAspectRatioConfigs: (configs) => set({ aspectRatioConfigs: configs }),

            getAspectRatioConfig: (ratio) => {
                return get().aspectRatioConfigs.find(c => c.id === ratio)
            },
        }),
        {
            name: 'generation-storage',
            partialize: (state) => ({
                params: state.params,
                magicPromptMode: state.magicPromptMode,
            }),
        }
    )
)
