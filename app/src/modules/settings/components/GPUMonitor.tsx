/**
 * GPU Monitor Component
 * 
 * Displays real-time GPU status, VRAM usage, and active jobs
 * for multi-GPU systems.
 */

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface GPUInfo {
    id: number;
    name: string;
    total_vram_gb: number;
    allocated_vram_gb: number;
    cached_vram_gb: number;
    free_vram_gb: number;
    utilization: number;
    active_jobs: number;
}

interface GPUStatus {
    available: boolean;
    count: number;
    gpus: GPUInfo[];
}

export const GPUMonitor: React.FC = () => {
    const [status, setStatus] = useState<GPUStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await apiFetch<GPUStatus>('/gpu/status');
                setStatus(data);
            } catch (error) {
                console.error('Error fetching GPU status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Update every 5s

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    if (!status?.available) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ No GPUs detected or CUDA not available
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    GPU Status
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {status.count} GPU{status.count !== 1 ? 's' : ''} available
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {status.gpus.map((gpu) => (
                    <div
                        key={gpu.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                        {/* GPU Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    GPU {gpu.id}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {gpu.name}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {gpu.active_jobs} {gpu.active_jobs === 1 ? 'job' : 'jobs'}
                                </div>
                            </div>
                        </div>

                        {/* VRAM Usage Bar */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>VRAM Usage</span>
                                <span>{gpu.utilization.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${gpu.utilization > 80
                                        ? 'bg-red-500'
                                        : gpu.utilization > 50
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                    style={{ width: `${gpu.utilization}%` }}
                                />
                            </div>
                        </div>

                        {/* VRAM Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {gpu.total_vram_gb.toFixed(1)} GB
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Free:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {gpu.free_vram_gb.toFixed(1)} GB
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Used:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {gpu.allocated_vram_gb.toFixed(1)} GB
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Cached:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {gpu.cached_vram_gb.toFixed(1)} GB
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
