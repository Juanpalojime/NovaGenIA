import React from 'react'
import { Monitor, Moon, Sun, Layout, Zap, Eye } from 'lucide-react'
import { useGlobalStore } from '../../../store/useGlobalStore'
import { clsx } from 'clsx'

const AppearanceSection: React.FC = () => {
    const { themeMode, accentColor, uiDensity, reduceMotion, updateSettings, addNotification } = useGlobalStore()

    const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
        updateSettings({ themeMode: newTheme })
        addNotification({
            type: 'success',
            message: `Theme changed to ${newTheme}`
        })
        console.log('Theme updated to:', newTheme)
    }

    const handleAccentChange = (newAccent: 'cyan' | 'magenta' | 'green' | 'custom') => {
        updateSettings({ accentColor: newAccent })
        addNotification({
            type: 'success',
            message: `Accent color changed to ${newAccent}`
        })
        console.log('Accent color updated to:', newAccent)
    }

    const handleDensityChange = (newDensity: 'compact' | 'comfortable' | 'spacious') => {
        updateSettings({ uiDensity: newDensity })
        addNotification({
            type: 'success',
            message: `UI density changed to ${newDensity}`
        })
        console.log('UI density updated to:', newDensity)
    }

    const handleMotionToggle = () => {
        const newValue = !reduceMotion
        updateSettings({ reduceMotion: newValue })
        addNotification({
            type: 'success',
            message: `Reduce motion ${newValue ? 'enabled' : 'disabled'}`
        })
        console.log('Reduce motion updated to:', newValue)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-lg font-bold text-white mb-1">Theme Preferences</h3>
                <p className="text-sm text-gray-500 mb-4">Customize how NovaGen looks on your device.</p>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'dark', icon: Moon, label: 'Cyber Dark' },
                        { id: 'light', icon: Sun, label: 'Light (Beta)' },
                        { id: 'system', icon: Monitor, label: 'System' }
                    ].map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id as any)}
                            className={clsx(
                                "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                themeMode === theme.id
                                    ? "bg-white/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                                    : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/20"
                            )}
                        >
                            <theme.icon size={24} />
                            <span className="text-sm font-medium">{theme.label}</span>
                            {themeMode === theme.id && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(0,243,255,1)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div>
                <h3 className="text-lg font-bold text-white mb-4">Accent Color & Theme</h3>
                <div className="flex flex-wrap gap-4 mb-6">
                    {[
                        { id: 'cyan', color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50' },
                        { id: 'magenta', color: 'bg-fuchsia-500', shadow: 'shadow-fuchsia-500/50' },
                        { id: 'green', color: 'bg-green-500', shadow: 'shadow-green-500/50' },
                        { id: 'custom', color: 'bg-gradient-to-br from-yellow-400 to-red-500', shadow: 'shadow-orange-500/50', icon: true }
                    ].map((accent) => (
                        <button
                            key={accent.id}
                            onClick={() => handleAccentChange(accent.id as any)}
                            className={clsx(
                                "w-12 h-12 rounded-full border-2 transition-all relative group",
                                accentColor === accent.id ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <div className={clsx("absolute inset-1 rounded-full", accent.color, accentColor === accent.id && `shadow-lg ${accent.shadow}`)} />
                            {accent.icon && <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-[10px]">?</div>}
                        </button>
                    ))}
                </div>

                {/* Custom Theme Builder */}
                {accentColor === 'custom' && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-300 text-sm">Custom Palette</h4>
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">PRO FEATURE</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Primary</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" defaultValue="#FFD700" />
                                    <span className="text-xs font-mono text-gray-400">#FFD700</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Secondary</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" defaultValue="#FF4500" />
                                    <span className="text-xs font-mono text-gray-400">#FF4500</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Background</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" defaultValue="#0a0a0a" />
                                    <span className="text-xs font-mono text-gray-400">#0A0A0A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-white/5" />

            <div>
                <h3 className="text-lg font-bold text-white mb-4">Interface Density</h3>
                <div className="space-y-3">
                    {[
                        { id: 'compact', icon: Layout, label: 'Compact', desc: 'More information, less spacing.' },
                        { id: 'comfortable', icon: Layout, label: 'Comfortable', desc: 'Balanced spacing for best focus.' },
                        { id: 'spacious', icon: Layout, label: 'Spacious', desc: 'Large touch targets and airy layout.' }
                    ].map((density) => (
                        <button
                            key={density.id}
                            onClick={() => handleDensityChange(density.id as any)}
                            className={clsx(
                                "w-full flex items-center gap-4 p-3 rounded-lg border transition-all text-left",
                                uiDensity === density.id
                                    ? "bg-white/5 border-neon-cyan/50"
                                    : "bg-transparent border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div className={clsx(
                                "p-2 rounded-lg",
                                uiDensity === density.id ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/5 text-gray-400"
                            )}>
                                <density.icon size={20} />
                            </div>
                            <div>
                                <div className={clsx("text-sm font-bold", uiDensity === density.id ? "text-white" : "text-gray-300")}>{density.label}</div>
                                <div className="text-xs text-gray-500">{density.desc}</div>
                            </div>
                            {uiDensity === density.id && <div className="ml-auto w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_10px_0_rgba(0,243,255,1)]" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Eye size={20} /></div>
                    <div>
                        <div className="text-sm font-bold text-gray-200">Reduce Motion</div>
                        <div className="text-xs text-gray-500">Simplify animations for better performance.</div>
                    </div>
                </div>
                <div
                    className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", reduceMotion ? "bg-neon-cyan" : "bg-white/10")}
                    onClick={handleMotionToggle}
                >
                    <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", reduceMotion ? "translate-x-4" : "translate-x-0")} />
                </div>
            </div>

            {/* Debug Info */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl font-mono text-xs space-y-2">
                <div className="text-gray-500 mb-2">Current Settings (Debug):</div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Theme Mode:</span>
                    <span className="text-neon-cyan">{themeMode}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Accent Color:</span>
                    <span className="text-neon-cyan">{accentColor}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">UI Density:</span>
                    <span className="text-neon-cyan">{uiDensity}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Reduce Motion:</span>
                    <span className="text-neon-cyan">{reduceMotion ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    )
}

export default AppearanceSection
