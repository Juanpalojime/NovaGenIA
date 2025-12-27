import React, { useEffect, useState } from 'react'
import { Zap, Palette, ChevronDown, ChevronUp, Settings2, Play, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { apiFetch } from '../../../lib/api' // Use api.ts directly if it has what we need, or utils if we moved it
// Just use api.ts as seen in PromptConsole

interface GenerationSettingsPanelProps {
    onSettingsChange: (settings: any) => void
}

export const GenerationSettingsPanel: React.FC<GenerationSettingsPanelProps> = ({ onSettingsChange }) => {
    // API Data
    const [presets, setPresets] = useState<any[]>([])
    const [styles, setStyles] = useState<any[]>([])
    const [samplers, setSamplers] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])

    // Generation State
    const [prompt, setPrompt] = useState('')
    const [activePreset, setActivePreset] = useState<string>('quality')
    const [activeStyle, setActiveStyle] = useState<string>('')
    const [activeSampler, setActiveSampler] = useState<string>('dpm_2m_karras')
    const [steps, setSteps] = useState<number>(30)
    const [cfg, setCfg] = useState<number>(7.0)
    const [wildcards, setWildcards] = useState<boolean>(true)
    const [isGenerating, setIsGenerating] = useState(false)

    // UI State
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('All')

    // Load Data
    useEffect(() => {
        const loadFeatures = async () => {
            try {
                // We use direct fetch here or apiFetch
                const [presetsData, stylesData, catsData, samplersData] = await Promise.all([
                    apiFetch<any[]>('/features/presets'),
                    apiFetch<any[]>('/features/styles'),
                    apiFetch<string[]>('/features/styles/categories'),
                    apiFetch<any[]>('/features/samplers')
                ])

                setPresets(presetsData)
                setStyles(stylesData)
                setCategories(['All', ...catsData])
                setSamplers(samplersData)
            } catch (error) {
                console.error("Failed to load features:", error)
            }
        }
        loadFeatures()
    }, [])

    // Update Parent (optional if we handle generation internally)
    useEffect(() => {
        onSettingsChange({
            prompt,
            preset_id: activePreset,
            style_id: activeStyle || undefined,
            sampler: activeSampler,
            steps,
            guidance_scale: cfg,
            use_wildcards: wildcards
        })
    }, [prompt, activePreset, activeStyle, activeSampler, steps, cfg, wildcards])

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setIsGenerating(true)

        try {
            const response = await apiFetch('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt,
                    preset_id: activePreset,
                    style_id: activeStyle || undefined,
                    sampler: activeSampler,
                    steps,
                    guidance_scale: cfg,
                    use_wildcards: wildcards,
                    // Default dimensions for now or grab from canvas store if possible
                    width: 1024,
                    height: 1024
                })
            })

            if (response.ok) {
                // Trigger global event or store update
                // For now just log
                console.log("Generation started")
            }
        } catch (e) {
            console.error("Generation failed", e)
        } finally {
            setIsGenerating(false)
        }
    }

    const filteredStyles = selectedCategory === 'All'
        ? styles
        : styles.filter(s => s.category === selectedCategory)

    return (
        <div className={clsx(
            "bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]",
            "md:absolute md:left-20 md:top-6 md:w-80", // Desktop fixed position
            "w-full h-full static" // Mobile fill
        )}>
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                    <Settings2 size={14} className="text-neon-cyan" />
                    Generation Control
                </span>
            </div>

            <div className="overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Prompt Input */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium">Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your creation..."
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 resize-none focus:border-neon-cyan/50 outline-none"
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-2 bg-gradient-to-r from-neon-cyan to-blue-600 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Sparkles size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>

                {/* Presets */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                    <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <Zap size={12} className="text-yellow-500" />
                        Quality Preset
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {presets.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setActivePreset(preset.id)}
                                className={clsx(
                                    "flex flex-col items-start p-2 rounded-lg border transition-all text-left",
                                    activePreset === preset.id
                                        ? "bg-neon-cyan/10 border-neon-cyan text-white"
                                        : "bg-white/5 border-transparent hover:bg-white/10 text-gray-400"
                                )}
                            >
                                <span className="text-sm font-medium">{preset.icon || '⚡'} {preset.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Styles */}
                <div className="space-y-3">
                    <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <Palette size={12} className="text-neon-magenta" />
                        Style
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors",
                                    selectedCategory === cat
                                        ? "bg-white text-black font-bold"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <select
                        value={activeStyle}
                        onChange={(e) => setActiveStyle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-sm text-gray-200 rounded-lg px-3 py-2 outline-none focus:border-neon-cyan/50"
                    >
                        <option value="">No Style (Raw)</option>
                        {filteredStyles.map(style => (
                            <option key={style.id} value={style.id}>
                                {style.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-white transition-colors pt-2 border-t border-white/10"
                >
                    Advanced Configuration
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Sampler</label>
                            <select
                                value={activeSampler}
                                onChange={(e) => setActiveSampler(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-xs text-gray-300 rounded px-2 py-1.5 outline-none"
                            >
                                {samplers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-400">Steps</label>
                                <span className="text-xs text-neon-cyan">{steps}</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="60"
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-400">CFG Scale</label>
                                <span className="text-xs text-neon-cyan">{cfg}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="15"
                                step="0.5"
                                value={cfg}
                                onChange={(e) => setCfg(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-400">Enable Wildcards</span>
                            <button
                                onClick={() => setWildcards(!wildcards)}
                                className={clsx(
                                    "w-8 h-4 rounded-full transition-colors relative",
                                    wildcards ? "bg-neon-cyan" : "bg-white/10"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                    wildcards ? "left-4.5" : "left-0.5"
                                )} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
