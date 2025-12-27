import React from 'react'
import { Activity, Terminal } from 'lucide-react'
import { useTrainingStore } from '../stores/useTrainingStore'

const TrainingMonitor: React.FC = () => {
    const { activeJob, logs, metrics, systemStats, batchPreviews } = useTrainingStore()

    if (!activeJob) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 bg-black/20 rounded-xl border border-white/5 p-6 space-y-3">
                <Activity size={48} className="opacity-20" />
                <p className="text-sm">No active training job.</p>
                <p className="text-xs max-w-[200px] text-center opacity-50">Configure your parameters and press Start to begin LoRA training.</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-neon-green animate-ping opacity-75" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-200 leading-none">TRAINING IN PROGRESS</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">ID: {activeJob.id}</div>
                    </div>
                </div>

                {/* System Stats (Simulated) */}
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">VRAM</div>
                        <div className="text-xs font-mono text-neon-cyan">{systemStats.vramUsage}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">GPU Temp</div>
                        <div className="text-xs font-mono text-orange-400">{systemStats.gpuTemp}°C</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">Step Time</div>
                        <div className="text-xs font-mono text-white">0.4s/it</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/5 w-full relative group">
                <div
                    className="h-full bg-neon-green shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all duration-300"
                    style={{ width: `${activeJob.progress}%` }}
                />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeJob.progress.toFixed(1)}% Completed
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Advanced Metrics Visualization */}
                <div className="bg-black/40 rounded-lg p-3 border border-white/5 flex flex-col gap-4">
                    {/* Loss Graph */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-[10px] text-gray-500 font-mono uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-magenta rounded-full"></span> Loss History
                            </div>
                            <span className="text-[10px] text-neon-magenta font-mono">{activeJob.loss.toFixed(4)}</span>
                        </div>
                        <div className="flex-1 flex items-end gap-0.5 px-0 pb-0 relative overflow-hidden bg-black/20 rounded-md border border-white/5">
                            {metrics.loss.map((loss, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-neon-magenta/50 hover:bg-neon-magenta transition-all"
                                    style={{ height: `${Math.min(loss * 100, 100)}%` }}
                                    title={`Loss: ${loss.toFixed(4)}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Batch Previews (Simulated) */}
                    <div className="h-24 shrink-0 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {batchPreviews.map((url, i) => (
                            <div key={i} className="aspect-square h-full rounded border border-white/10 overflow-hidden relative group">
                                <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Batch Preview" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                    <span className="text-[10px] text-white font-mono">#{activeJob.currentStep}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Console Logs */}
                <div className="bg-black/90 rounded-lg p-3 border border-white/10 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
                    <div className="text-gray-500 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Terminal size={12} /> System Log</div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" title="Error" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" title="Warning" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" title="Info" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar font-mono">
                        {logs.map((log, i) => (
                            <div key={i} className="text-gray-300 border-l-2 border-transparent pl-2 hover:border-white/20 hover:bg-white/5 py-0.5 transition-colors">
                                <span className="text-gray-600 mr-2 select-none">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                        <div className="text-neon-green animate-pulse">_</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainingMonitor
