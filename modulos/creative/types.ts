export interface Project {
  id: string;
  title: string;
  imageUrl: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  RENDERING = 'RENDERING',
  FINISHING = 'FINISHING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9'
}

export const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  [AspectRatio.SQUARE]: 'Square (1:1)',
  [AspectRatio.PORTRAIT_3_4]: 'Portrait (3:4)',
  [AspectRatio.LANDSCAPE_4_3]: 'Landscape (4:3)',
  [AspectRatio.PORTRAIT_9_16]: 'Story (9:16)',
  [AspectRatio.LANDSCAPE_16_9]: 'Cinema (16:9)',
};

export const ART_STYLES = [
  "None",
  "Cyberpunk",
  "Realistic",
  "Oil Painting",
  "Anime",
  "3D Render",
  "Watercolor",
  "Sketch",
  "Synthwave"
];

export interface HistoryItem {
  id: string;
  prompt: string;
  style: string;
  ratio: AspectRatio;
  timestamp: number;
}
