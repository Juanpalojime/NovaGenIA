import React from 'react'
import PromptConsole from './components/PromptConsole'
import PresetsWidget from './components/PresetsWidget'
import RecentProjects from './components/RecentProjects'
import StatsWidget from './components/StatsWidget'

const CreativeDashboard: React.FC = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Command Center</h2>
                <p className="text-gray-400 max-w-2xl">
                    Orchestrate your creative vision. Select style presets, input advanced commands, and monitor system generation metrics in real-time.
                </p>
            </div>

            {/* Main Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Console & Presets */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <PromptConsole />
                    </section>

                    <section>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Presets</div>
                        <PresetsWidget />
                    </section>
                </div>

                {/* Right Column: Stats & Insights */}
                <div className="lg:col-span-1">
                    <StatsWidget />
                </div>
            </div>

            {/* Recent Projects Layer */}
            <div className="pt-6 border-t border-white/5">
                <RecentProjects />
            </div>
        </div>
    )
}

export default CreativeDashboard
