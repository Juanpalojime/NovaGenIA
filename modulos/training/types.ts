export interface TrainingParams {
    projectName: string;
    baseModel: string;
    triggerWord: string;
    steps: number;
    loraRank: number;
    learningRate: number;
    gradientCheckpointing: boolean;
    mixedPrecision: boolean;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface TrainingState {
    status: 'idle' | 'training' | 'completed';
    progress: number;
    logs: LogEntry[];
    currentLoss: number;
    currentAccuracy: number;
}
