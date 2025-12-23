import React from 'react'
import { Sliders, HelpCircle, Zap } from 'lucide-react'
import { useTrainingStore } from '../stores/useTrainingStore'
import { clsx } from 'clsx'

const ConfigField: React.FC<{ label: string; tooltip?: string; children: React.ReactNode }> = ({ label, tooltip, children }) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs font-medium">{label}</span>
            {tooltip && <HelpCircle size={10} className="text-gray-600 cursor-help" />}
        </div>
        {children}
    </div>
)

const TrainingConfigPanel: React.FC = () => {
    const { config, setConfig, startTraining, toggleMagicMode } = useTrainingStore()

    return (
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sliders size={18} className="text-neon-magenta" />
                    <span className="font-bold text-gray-200">Training Config</span>
                </div>
                {/* Magic Mode Button */}
                <button
                    onClick={toggleMagicMode}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                        config.isMagicMode
                            ? "bg-neon-magenta/20 border-neon-magenta text-neon-magenta shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    )}
                >
                    <Zap size={12} className={clsx(config.isMagicMode && "fill-current")} />
                    {config.isMagicMode ? "Magic Mode ON" : "Auto-Tune"}
                </button>
            </div>

            <div className="space-y-5">
                <ConfigField label="LoRA Name">
                    <input
                        type="text"
                        value={config.modelName}
                        onChange={(e) => setConfig({ modelName: e.target.value })}
                        placeholder="e.g., CyberPunk_V2"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-neon-magenta focus:outline-none placeholder:text-gray-600"
                    />
                </ConfigField>

                <ConfigField label="Base Model">
                    <select
                        value={config.baseModel}
                        onChange={(e) => setConfig({ baseModel: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-neon-magenta focus:outline-none"
                    >
                        <option value="sdxl-base-1.0">SDXL Base 1.0 (Recommended)</option>
                        <option value="stable-diffusion-1.5">Stable Diffusion 1.5</option>
                        <option value="flux-realism">Flux Realism (Beta)</option>
                    </select>
                </ConfigField>

                <ConfigField label="Trigger Word" tooltip="The magic word to activate your style">
                    <input
                        type="text"
                        value={config.triggerWord}
                        onChange={(e) => setConfig({ triggerWord: e.target.value })}
                        placeholder="e.g., ohwx style"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-neon-magenta focus:outline-none placeholder:text-gray-600"
                    />
                </ConfigField>

                {/* Advanced params - disabled in Magic Mode could be a nice touch, but let's keep editable but visually indicated */}
                <div className={clsx("grid grid-cols-2 gap-4 p-3 rounded-lg transition-colors", config.isMagicMode ? "bg-neon-magenta/5 border border-neon-magenta/20" : "")}>
                    <ConfigField label="Training Steps">
                        <input
                            type="number"
                            value={config.steps}
                            onChange={(e) => setConfig({ steps: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-neon-magenta focus:outline-none"
                        />
                    </ConfigField>
                    <ConfigField label="Batch Size">
                        <input
                            type="number"
                            value={config.batchSize}
                            onChange={(e) => setConfig({ batchSize: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-neon-magenta focus:outline-none"
                        />
                    </ConfigField>
                    <div className="col-span-2">
                        <ConfigField label="Learning Rate">
                            <input
                                type="text"
                                value={config.learningRate}
                                onChange={(e) => setConfig({ learningRate: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-neon-magenta focus:outline-none font-mono"
                            />
                        </ConfigField>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <button
                    onClick={startTraining}
                    className="w-full py-3 bg-neon-magenta hover:bg-neon-magenta/90 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transform active:scale-[0.98]"
                >
                    <Zap size={18} className="fill-current" />
                    Start Training
                </button>
                <div className="text-[10px] text-gray-500 text-center mt-2 flex justify-center gap-4">
                    <span>Ctrl+S: Save Config</span>
                    <span>Ctrl+Enter: Start</span>
                </div>
            </div>
        </div>
    )
}

export default TrainingConfigPanel
