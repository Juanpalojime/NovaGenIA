import React, { useState } from 'react'
import CanvasBoard from './components/CanvasBoard'
import ToolBar from './components/ToolBar'
import LayerManager from './components/LayerManager'
import PropertiesPanel from './components/PropertiesPanel'
import { GenerationSettingsPanel } from './components/GenerationSettingsPanel'
import { LoRABrowser } from './components/LoRABrowser'
import { LoRAMixer } from './components/LoRAMixer'
import { MobileNav } from './components/MobileNav' // Import MobileNav
import { Layers, Sliders } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery' // Import hook

const ProStudio: React.FC = () => {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const [activeTab, setActiveTab] = useState<'canvas' | 'lora'>('canvas')
    const [mobileTab, setMobileTab] = useState<'canvas' | 'lora' | 'settings' | 'layers'>('canvas')
    // const [genSettings, setGenSettings] = useState<any>({}) // Unused for now, logic handled in components

    // Mobile View Logic
    if (isMobile) {
        return (
            <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    {/* Always render canvas in background if possible, or only when active */}
                    <CanvasBoard />

                    {/* Floating Mobile Toolbar (Tools) always visible on canvas */}
                    {mobileTab === 'canvas' && <ToolBar />}

                    {/* Overlays based on active tab */}
                    {mobileTab === 'settings' && (
                        <div className="absolute inset-0 bg-black/80 z-40 p-4 overflow-y-auto pb-20 animate-in slide-in-from-bottom-10">
                            <GenerationSettingsPanel onSettingsChange={() => { }} />
                        </div>
                    )}

                    {mobileTab === 'layers' && (
                        <div className="absolute inset-0 bg-black/80 z-40 p-4 overflow-y-auto pb-20 animate-in slide-in-from-bottom-10">
                            <LayerManager />
                        </div>
                    )}

                    {mobileTab === 'lora' && (
                        <div className="absolute inset-0 bg-black/90 z-40 p-4 overflow-y-auto pb-20 animate-in slide-in-from-bottom-10">
                            <LoRABrowser />
                        </div>
                    )}
                </div>

                <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />
            </div>
        )
    }

    // Desktop View (Existing)
    return (
        <div className="relative w-full h-full bg-[#050505] overflow-hidden">
            {/* Tab Switcher */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-gray-900/90 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
                <button
                    onClick={() => setActiveTab('canvas')}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'canvas'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    Canvas
                </button>
                <button
                    onClick={() => setActiveTab('lora')}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'lora'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <Sliders className="w-4 h-4" />
                    LoRA Studio
                </button>
            </div>

            {/* Canvas View */}
            {activeTab === 'canvas' && (
                <>
                    <CanvasBoard />
                    <ToolBar />{' '}
                    {/* Note: ToolBar needs to receive settings if it triggers generation */}
                    <GenerationSettingsPanel onSettingsChange={() => { }} />
                    <LayerManager />
                    <PropertiesPanel />
                </>
            )}

            {/* LoRA Studio View */}
            {activeTab === 'lora' && (
                <div className="w-full h-full overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-white mb-6">LoRA Studio</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LoRA Browser - 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                                    <h2 className="text-xl font-semibold text-white mb-4">Browse LoRAs</h2>
                                    <LoRABrowser />
                                </div>
                            </div>

                            {/* LoRA Mixer - 1 column */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Mix LoRAs</h2>
                                    <LoRAMixer />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProStudio
