import React from 'react'
import { MoreHorizontal } from 'lucide-react'

const RecentProjects: React.FC = () => {
    // Placeholder data
    const projects = [1, 2, 3, 4]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Missions</h3>
                <button className="text-xs text-neon-cyan hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projects.map((i) => (
                    <div key={i} className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-neon-cyan/50 transition-all">
                        {/* Placeholder image pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 bg-black/50 backdrop-blur rounded text-white hover:text-neon-cyan">
                                <MoreHorizontal size={14} />
                            </button>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <div className="text-xs font-medium text-white truncate">Project Alpha {i}</div>
                            <div className="text-[10px] text-gray-400">2 mins ago</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentProjects
