export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE = "1:1",
  LANDSCAPE = "4:3", // Using 4:3 to map closely to standard photo while being supported by API
  PORTRAIT = "9:16"
}

export interface GenerationSettings {
  model: string;
  aspectRatio: AspectRatio;
  guidanceScale: number;
  steps: number;
  seed: number;
  negativePrompt: string;
}
