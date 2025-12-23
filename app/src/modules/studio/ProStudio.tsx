import React from 'react'
import CanvasBoard from './components/CanvasBoard'
import ToolBar from './components/ToolBar'
import LayerManager from './components/LayerManager'
import PropertiesPanel from './components/PropertiesPanel'

const ProStudio: React.FC = () => {
    return (
        <div className="relative w-full h-full bg-[#050505] overflow-hidden">
            <CanvasBoard />

            {/* Floating Interface */}
            <ToolBar />
            <LayerManager />
            <PropertiesPanel />
        </div>
    )
}

export default ProStudio
