import React, { useEffect, useState } from 'react'
import { Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { useLibraryStore } from '@/modules/estudio/stores/useLibraryStore'
import { useSystemStore } from '@/store/useSystemStore'
import { apiFetch } from '@/lib/api'

const StatsWidget: React.FC = () => {
    const { assets, fetchLibrary } = useLibraryStore()
    const { currentJob } = useSystemStore()
    const [stats, setStats] = useState({
        avg_gen_time: '--',
        total_generations: 0,
        today_generations: 0
    })

    useEffect(() => {
        fetchLibrary()
    }, [fetchLibrary])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiFetch<any>('/stats')
                if (data) setStats(data)
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }
        fetchStats()
    }, [assets])

    const totalGenerations = stats.total_generations || assets.length
    const todayGenerations = stats.today_generations
    const avgGenTime = stats.avg_gen_time

    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <Activity size={16} className="text-neon-magenta" />
                    <span className="text-xs font-bold uppercase tracking-wider">System Insights</span>
                </div>

                <div className="space-y-3">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-start gap-3">
                            <TrendingUp size={16} className="text-neon-cyan mt-1" />
                            <div>
                                <div className="text-xs text-gray-400 mb-1">Status</div>
                                <div className="text-sm text-white leading-tight">
                                    {currentJob ? (
                                        <>System is <span className="text-neon-cyan">generating</span> your image...</>
                                    ) : (
                                        <>Ready to create. <span className="text-neon-cyan">{todayGenerations}</span> generations today.</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-yellow-500 mt-1" />
                            <div>
                                <div className="text-xs text-gray-400 mb-1">Tip</div>
                                <div className="text-sm text-white leading-tight">
                                    Try using <span className="text-neon-magenta">Magic Prompt</span> for enhanced results.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-center">
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">{avgGenTime}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Avg Gen Time</div>
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">{totalGenerations}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Total</div>
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">{todayGenerations}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Today</div>
                </div>
            </div>
        </div>
    )
}

export default StatsWidget
