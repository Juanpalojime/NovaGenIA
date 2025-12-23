import React from 'react'
import { Link, Cloud, Key, CheckCircle, XCircle } from 'lucide-react'
import { useGlobalStore } from '../../../store/useGlobalStore'
import { clsx } from 'clsx'
import { useSystemStore } from '../../../store/useSystemStore'

const ConnectionsSection: React.FC = () => {
    const { apiEndpoint, huggingFaceToken, civitaiApiKey, updateSettings } = useGlobalStore()
    const { isConnected, ngrokUrl } = useSystemStore()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-lg font-bold text-white mb-1">Compute Backend</h3>
                <p className="text-sm text-gray-500 mb-4">Manage connection to your AI generation engine.</p>

                <div className="bg-black/20 border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className={clsx("p-2 rounded-lg", isConnected ? "bg-neon-green/20 text-neon-green" : "bg-red-500/20 text-red-500")}>
                                <Cloud size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-200">Status: {isConnected ? "Connected" : "Disconnected"}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">{isConnected ? ngrokUrl : "No active backend detected"}</div>
                            </div>
                        </div>
                        <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors">
                            Check Status
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Custom API Endpoint</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={apiEndpoint}
                                    onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-neon-cyan font-mono"
                                    placeholder="http://localhost:7860 or Ngrok URL"
                                />
                            </div>
                            <button className="px-4 py-2 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-lg text-sm font-bold hover:bg-neon-cyan/20 transition-colors">
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Connection Logs */}
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[10px]">
                        <div className="flex justify-between items-center mb-2 text-gray-500">
                            <span>CONNECTION LOGS</span>
                            <span className="text-green-500">● LIVE</span>
                        </div>
                        <div className="h-24 overflow-y-auto custom-scrollbar space-y-1">
                            <div className="text-gray-400">[System] Checking connectivity to endpoint...</div>
                            <div className="text-green-400">[Success] Handshake established with NovaEngine v2.1</div>
                            <div className="text-gray-400">[Latency] 45ms ping</div>
                            <div className="text-gray-400">[Auth] Token validated</div>
                            <div className="text-blue-400">[Info] Ready for generation tasks</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div>
                <h3 className="text-lg font-bold text-white mb-4">API Keys</h3>
                <div className="space-y-4">
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 bg-[#FFD21E]/10 rounded text-[#FFD21E]"><Key size={16} /></div>
                            <span className="font-medium text-gray-200">HuggingFace Token</span>
                        </div>
                        <input
                            type="password"
                            value={huggingFaceToken}
                            onChange={(e) => updateSettings({ huggingFaceToken: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD21E] font-mono"
                            placeholder="hf_..."
                        />
                        <p className="text-[10px] text-gray-500 mt-2">Required for downloading private models.</p>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 bg-blue-500/10 rounded text-blue-500"><Key size={16} /></div>
                            <span className="font-medium text-gray-200">CivitAI API Key</span>
                        </div>
                        <input
                            type="password"
                            value={civitaiApiKey}
                            onChange={(e) => updateSettings({ civitaiApiKey: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                            placeholder="api_..."
                        />
                        <p className="text-[10px] text-gray-500 mt-2">Required for accessing NSFW or limited models.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConnectionsSection
