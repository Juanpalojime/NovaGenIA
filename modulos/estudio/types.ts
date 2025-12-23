export interface Asset {
  id: string;
  url: string;
  title: string;
  prompt: string;
  negativePrompt: string;
  dimensions: string;
  seed: string;
  sampler: string;
  steps: number;
  cfgScale: number;
  model: string;
  version: string;
  createdAt: string;
  isProcessing?: boolean;
  progress?: number; // 0 to 100
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  model?: string;
}
