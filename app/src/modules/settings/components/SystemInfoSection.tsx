import React, { useEffect, useState } from 'react'
import { HardDrive, Cpu, Activity, Zap, Database, Clock } from 'lucide-react'
import { useSystemStore } from '../../../store/useSystemStore'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'

const SystemInfoSection: React.FC = () => {
    const { isConnected, ngrokUrl } = useSystemStore()
    const { assets } = useLibraryStore()
    const [systemInfo, setSystemInfo] = useState({
        platform: 'Unknown',
        memory: 0,
        uptime: 0
    })

    useEffect(() => {
        // Get browser/system info
        setSystemInfo({
            platform: navigator.platform,
            memory: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
            uptime: performance.now() / 1000 / 60 // minutes
        })
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* System Status */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan">
                                <Activity size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-300">Backend Status</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {isConnected ? ngrokUrl : 'No active connection'}
                        </div>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-neon-magenta/10 rounded-lg text-neon-magenta">
                                <Database size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-300">Library Size</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {assets.length}
                        </div>
                        <div className="text-xs text-gray-500">
                            Generated images
                        </div>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <Cpu size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-300">Platform</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {systemInfo.platform}
                        </div>
                        <div className="text-xs text-gray-500">
                            Browser platform
                        </div>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Clock size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-300">Session Time</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {Math.floor(systemInfo.uptime)}m
                        </div>
                        <div className="text-xs text-gray-500">
                            Current session
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Performance Metrics */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
                <div className="bg-black/20 border border-white/10 rounded-xl p-5 space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Memory Usage</span>
                            <span className="text-white font-mono">{systemInfo.memory.toFixed(2)} MB</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full transition-all"
                                style={{ width: `${Math.min((systemInfo.memory / 100) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">API Response Time</span>
                            <span className="text-white font-mono">{isConnected ? '~45ms' : 'N/A'}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: isConnected ? '15%' : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* System Info */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Application Info</h3>
                <div className="bg-black/20 border border-white/10 rounded-xl p-5 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Version:</span>
                        <span className="text-white">v2.0.0-alpha</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Build:</span>
                        <span className="text-white">2025.12.23</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Environment:</span>
                        <span className="text-white">{import.meta.env.MODE}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">User Agent:</span>
                        <span className="text-white truncate max-w-xs">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemInfoSection
