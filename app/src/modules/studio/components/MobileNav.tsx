import React from 'react'
import { Layers, Sliders, Settings2, Image as ImageIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface MobileNavProps {
    activeTab: 'canvas' | 'lora' | 'settings' | 'layers'
    onTabChange: (tab: 'canvas' | 'lora' | 'settings' | 'layers') => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'canvas', icon: ImageIcon, label: 'Canvas' },
        { id: 'lora', icon: Sliders, label: 'LoRA' },
        { id: 'settings', icon: Settings2, label: 'Settings' },
        { id: 'layers', icon: Layers, label: 'Layers' },
    ] as const

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50 safe-area-bottom">
            <div className="flex justify-around items-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            activeTab === tab.id
                                ? "text-neon-cyan"
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <tab.icon size={20} />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
