import React from 'react'
import DatasetUploader from './components/DatasetUploader'
import TrainingConfigPanel from './components/TrainingConfigPanel'
import TrainingMonitor from './components/TrainingMonitor'

const TrainingCenter: React.FC = () => {
    return (
        <div className="h-[calc(100vh-4rem)] p-6 bg-[#050505] overflow-hidden flex flex-col gap-6">
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Model Foundry</h1>
                    <p className="text-gray-500 text-sm">Train, fine-tune, and distill custom AI models.</p>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left Column: Data & Config */}
                <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 min-h-0">
                        <DatasetUploader />
                    </div>
                    <div className="h-[400px] shrink-0">
                        <TrainingConfigPanel />
                    </div>
                </div>

                {/* Right Column: Monitor & visualization */}
                <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 min-h-0">
                        <TrainingMonitor />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainingCenter
