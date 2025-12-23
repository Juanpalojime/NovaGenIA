import React, { useEffect, useState } from 'react'
import { Search, Command, Zap, Layers, Cpu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'

const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    if (!isOpen) return null

    const actions = [
        { name: 'Go to Dashboard', icon: Layers, action: () => navigate('/') },
        { name: 'Go to Library', icon: Layers, action: () => navigate('/library') },
        { name: 'Go to Studio', icon: Layers, action: () => navigate('/studio') },
        { name: 'Training Center', icon: Cpu, action: () => navigate('/training') },
        { name: 'System Settings', icon: Zap, action: () => navigate('/settings') },
    ]

    const filteredActions = actions.filter(action =>
        action.name.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm transition-all">
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-white/10 px-4 py-3">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-gray-600 font-mono text-sm"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredActions.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">No results found.</div>
                    )}

                    {filteredActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                action.action()
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-white/5 hover:text-neon-cyan transition-colors text-left group"
                        >
                            <action.icon className="w-4 h-4 mr-3 text-gray-500 group-hover:text-neon-cyan" />
                            <span className="text-gray-300 group-hover:text-white text-sm">{action.name}</span>
                        </button>
                    ))}
                </div>

                <div className="p-2 border-t border-white/5 bg-black/20 text-[10px] text-gray-600 flex justify-between px-4">
                    <span>NovaGen AI Command</span>
                    <span>v1.0.0-beta</span>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
