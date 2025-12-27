/**
 * Progress Indicator Component
 * 
 * Displays real-time generation progress with animated progress bar,
 * current step, elapsed time, and estimated time remaining.
 */

import React from 'react';
import type { GenerationProgress } from '../hooks/useGenerationProgress';

interface ProgressIndicatorProps {
    progress: GenerationProgress;
    className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    progress,
    className = '',
}) => {
    if (!progress.jobId || progress.isComplete) {
        return null;
    }

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    const getStageLabel = (stage: string): string => {
        const labels: Record<string, string> = {
            initializing: '🔄 Initializing',
            generating: '🎨 Generating',
            saving: '💾 Saving',
            complete: '✅ Complete',
        };
        return labels[stage] || stage;
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Error State */}
            {progress.isError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{progress.errorMessage || 'An error occurred'}</span>
                </div>
            )}

            {/* Normal Progress */}
            {!progress.isError && (
                <>
                    {/* Stage and Message */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getStageLabel(progress.stage)}
                            </span>
                            {progress.message && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {progress.message}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {Math.round(progress.progress)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress.progress}%` }}
                        >
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                            {progress.totalSteps > 0 && (
                                <span>
                                    Step {progress.step}/{progress.totalSteps}
                                </span>
                            )}
                            {progress.elapsed > 0 && (
                                <span>⏱️ {formatTime(progress.elapsed)}</span>
                            )}
                        </div>
                        {progress.eta > 0 && (
                            <span className="text-gray-500 dark:text-gray-500">
                                ~{formatTime(progress.eta)} remaining
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Add shimmer animation to global CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
    const styleId = 'progress-indicator-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = shimmerKeyframes;
        document.head.appendChild(style);
    }
}
