/**
 * React Hook for Generation Progress
 * 
 * Subscribes to WebSocket updates for a specific generation job
 * and provides real-time progress information.
 */

import { useEffect, useState, useCallback } from 'react';
import { wsManager, ProgressEvent } from '../lib/websocket';
import { useGlobalStore } from '../store/useGlobalStore';

export interface GenerationProgress {
    jobId: string | null;
    stage: string;
    message: string;
    step: number;
    totalSteps: number;
    progress: number;
    elapsed: number;
    eta: number;
    isComplete: boolean;
    isError: boolean;
    errorMessage?: string;
}

const initialProgress: GenerationProgress = {
    jobId: null,
    stage: 'idle',
    message: '',
    step: 0,
    totalSteps: 0,
    progress: 0,
    elapsed: 0,
    eta: 0,
    isComplete: false,
    isError: false,
};

export function useGenerationProgress(jobId: string | null) {
    const [progress, setProgress] = useState<GenerationProgress>(initialProgress);
    const apiUrl = useGlobalStore((state) => state.apiUrl);

    const handleProgressEvent = useCallback((event: ProgressEvent) => {
        setProgress((prev) => {
            const updated = { ...prev };

            switch (event.event) {
                case 'stage_change':
                    updated.stage = event.stage || prev.stage;
                    updated.message = event.message || '';
                    break;

                case 'step_complete':
                    updated.step = event.step || 0;
                    updated.totalSteps = event.total_steps || prev.totalSteps;
                    updated.progress = event.progress || 0;
                    updated.elapsed = event.elapsed || 0;
                    updated.eta = event.eta || 0;
                    break;

                case 'generation_complete':
                    updated.isComplete = true;
                    updated.progress = 100;
                    updated.message = event.message || 'Generation complete';
                    updated.elapsed = event.elapsed || prev.elapsed;
                    break;

                case 'error':
                    updated.isError = true;
                    updated.errorMessage = event.message || 'Unknown error';
                    break;
            }

            return updated;
        });
    }, []);

    useEffect(() => {
        if (!jobId) {
            setProgress(initialProgress);
            return;
        }

        setProgress((prev) => ({ ...prev, jobId }));

        const client = wsManager.getConnection(jobId, apiUrl);
        const unsubscribe = client.subscribe(handleProgressEvent);

        // Connect to WebSocket
        client.connect().catch((error) => {
            console.error('Failed to connect to WebSocket:', error);
            setProgress((prev) => ({
                ...prev,
                isError: true,
                errorMessage: 'Failed to connect to progress updates',
            }));
        });

        // Send periodic pings to keep connection alive
        const pingInterval = setInterval(() => {
            client.sendPing();
        }, 30000); // Every 30 seconds

        return () => {
            unsubscribe();
            clearInterval(pingInterval);
            // Don't disconnect immediately - keep connection for a bit
            // in case user wants to see final status
            setTimeout(() => {
                wsManager.removeConnection(jobId);
            }, 5000);
        };
    }, [jobId, apiUrl, handleProgressEvent]);

    const reset = useCallback(() => {
        setProgress(initialProgress);
    }, []);

    return { progress, reset };
}
