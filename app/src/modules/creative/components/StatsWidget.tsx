import React from 'react'
import { Activity, TrendingUp, AlertCircle } from 'lucide-react'

const StatsWidget: React.FC = () => {
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
                                <div className="text-xs text-gray-400 mb-1">Recommendation</div>
                                <div className="text-sm text-white leading-tight">
                                    Increase CFG scale to <span className="text-neon-cyan">8.5</span> for better adherence to "cyberpunk" style.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-yellow-500 mt-1" />
                            <div>
                                <div className="text-xs text-gray-400 mb-1">Tokenizer</div>
                                <div className="text-sm text-white leading-tight">
                                    Prompt complexity is low. Try using the <span className="text-neon-magenta">Enhance</span> tool.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-center">
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">4.2s</div>
                    <div className="text-[10px] text-gray-500 uppercase">Avg Gen Time</div>
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">850</div>
                    <div className="text-[10px] text-gray-500 uppercase">Credits</div>
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-mono text-white">12</div>
                    <div className="text-[10px] text-gray-500 uppercase">Models</div>
                </div>
            </div>
        </div>
    )
}

export default StatsWidget
