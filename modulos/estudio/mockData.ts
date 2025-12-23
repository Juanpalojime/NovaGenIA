import { Asset } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWvuRux_A2Sryt6i5KiEkPV5XcyTkwNRA8SToeqoSGayFXx3qIUdhLjeG-G8EiCnplrqRT24m2f5tTE_8pXVOOuM5wIjc2iOFwVaec6Zt5AAKxJq5PBojk0UkSVGvBjrgBnX5ZcX8WZlsMjnLgvg6GCk8hqe8782S1jic3tbj8GHb9T--3E1nqhj-d8rv3ZmW7mEjY3XGrX1tZjYQGpM3vDvEEbEx6LCAEQkxjp5Ya4DAJ5-ujO8vWW6mLIgD6xxrtK8_Qdxyc8sM',
    title: 'Neon Fluid Waves V4',
    prompt: 'Abstract fluid simulation, bioluminescent neon blue and purple waves, cinematic lighting, octane render, 8k resolution, photorealistic, depth of field --ar 1:1 --v 4',
    negativePrompt: 'blur, noise, watermark, text, low quality, distorted',
    dimensions: '1024 x 1024',
    seed: '39284102',
    sampler: 'Euler a',
    steps: 50,
    cfgScale: 7.5,
    model: 'Flux V1.5',
    version: 'v4.2',
    createdAt: 'Just now'
  },
  {
    id: '2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLjXsgSwlCQPuhfCjuX-u72pajhF1QGNq7N1vM7uuU8D4rERVB6Y3lTG8a66kqmiybhBpKkTJFvxEtvpNBO4IJAYuGj8OfQkiVR6_iB7v7N7S9j6BnyrsAl61dd1C8LHyryX4BbHjGXyyyr5_4diFeh_T0fOUzmyDiFAqjDKs90v5TCDCiyUgONQ2cTgVbgUO8TRXYBf0fMokNtpEzRI1th2bxTB1AAmQKPCxV2-yvLJhIf5MVzWhf9RCTy2MR0SjYtYlvc-YcfbI',
    title: 'Cyber Geo Patterns',
    prompt: 'Cyberpunk geometric pattern, orange and pink gradients, isometric view, high contrast, 4k',
    negativePrompt: 'organic, dull, low res',
    dimensions: '1024 x 1024',
    seed: '88273611',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfgScale: 7.0,
    model: 'Flux V1.5',
    version: 'v4.1',
    createdAt: '5 mins ago'
  },
  {
    id: '3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_UnOsk5dDlKQL7jqFz-6GfGeU9vMCIgmo9bEMcCcOaLnahYgGXp-4mtlb2SDDHaP5D3IUfscxe7SN74_wtxvnyfhYwNRkoh6iJREQmfyzQijn5A9cumo0CY-SvcRA3IxcaL_N-A6qaDvYRBcjR0yDaH7mZgoZtLCDXLcYODB7EzddMq5WgH5b562pzElDx7opGhCMQWoheGpC_kyMf5sjjAtB_YI31db2Xt6gWr1qOihHiwrIURHQGZP8pey0olKFgbgx9wHgnOQ',
    title: 'Metallic Texture',
    prompt: 'Dark abstract metallic texture with purple light strips, brushed steel, industrial sci-fi texture',
    negativePrompt: 'rust, dirt, bright',
    dimensions: '1024 x 1024',
    seed: '11029384',
    sampler: 'Euler a',
    steps: 40,
    cfgScale: 8.0,
    model: 'Flux V1.5',
    version: 'v4.0',
    createdAt: '15 mins ago'
  },
  {
    id: '4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu-F-TTEFjVVWaaw9Gc3vQv0o2JjaXLAZZ8F44leaUgdaw15uxDyweiyBGbb5vEYzq_jQXitG_pqOCTorrKgbzetGpitnIjuD1ChDFMjKT6UJoS9FCsRCKVs0Bl9VJtdUIM1cYu9jsgDY-JJKBMLrFIXv8F3AIzRfUPSn2xvUsNHkAFQvMNRMnCxLIOrCBpYG5hRiJp4sch3dzBsQmtv-QXYLcfMyHvcoFxUGrAs-JsRM_yBI2nomRAwZ3y-yFn4sDcAC4q_RV3gE',
    title: 'Retro Sunset',
    prompt: 'Synthwave sunset, retro futurism, grid landscape, mountains, neon sun, 80s style',
    negativePrompt: 'modern, realistic, photo',
    dimensions: '1024 x 1024',
    seed: '55667788',
    sampler: 'DDIM',
    steps: 60,
    cfgScale: 9.0,
    model: 'Flux V1.5',
    version: 'v3.5',
    createdAt: '1 hour ago'
  }
];
