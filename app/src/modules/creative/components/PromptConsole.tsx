```
import React, { useState, useRef, useEffect } from 'react'
import { Send, Clock, Book, Sparkles, Terminal, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '@/store/useSystemStore'

interface HistoryItem {
    id: string
    text: string
    tags: string[]
    timestamp: number
    status: 'success' | 'failed'
}

const PromptConsole: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', text: "portrait of a cyborg girl, neon city background, cinematic lighting --v 5.2", tags: ['portrait', 'scifi'], timestamp: Date.now(), status: 'success' },
    { id: '2', text: "futuristic cityscape, rain, dark atmosphere, 8k resolution", tags: ['landscape', 'dark'], timestamp: Date.now() - 100000, status: 'success' }
  ])
    const [input, setInput] = useState('')
    const { user, addNotification } = useGlobalStore()
    const { startJob, updateJobProgress, completeJob, currentJob } = useSystemStore()
    const { addAssets } = useLibraryStore()
    
    // Mock suggestions
    const suggestions = [
        "/imagine", "/settings", "/upscale", "cyberpunk city", "portrait of a warrior", "abstract neon flow"
    ]
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Mock history
    const [history, setHistory] = useState<string[]>([
        "portrait of a cyborg girl, neon lights, 8k --v 5.2",
        "isometric view of a futuristic laboratory, clay render"
    ])

    const handleSend = () => {
        if (!input.trim() || currentJob) return

        const promptText = input.trim()
        setHistory(prev => [promptText, ...prev])
        setInput('')

        // 1. Start System Job
        startJob({ 
            id: `job - ${ Date.now() } `, 
            type: 'text-to-image', 
            status: 'processing', 
            progress: 0 
        })
        
        addNotification({ type: 'info', message: 'Generating image...' })

        // 2. Simulate Backend Processing
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 15
            if (progress > 100) progress = 100
            
            updateJobProgress(progress)
            
            if (progress >= 100) {
                clearInterval(interval)
                completeJob() // Reset job
                
                // 3. Add to Asset Library
                const newAsset = {
                    id: `gen - ${ Date.now() } `,
                    url: `https://picsum.photos/seed/${Math.random()}/1024/1024`, // Mock image
prompt: promptText,
    width: 1024,
        height: 1024,
            createdAt: Date.now(),
                tags: ['generated', 'txt2img', 'v2'],
                    model: 'NovaGen XL',
                        isFavorite: false,
                            seed: Math.floor(Math.random() * 999999)
                }
// @ts-ignore - Ensuring type compat logic later if needed
addAssets([newAsset])
addNotification({ type: 'success', message: 'Generation complete!' })
            }
        }, 300)
    }

const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
    }
}
const parseCommand = (text: string) => {
    if (text.startsWith('!')) {
        const [cmd, ...args] = text.slice(1).split(' ')
        return { isCommand: true, cmd, args }
    }
    return { isCommand: false }
}


const { isCommand, cmd } = parseCommand(prompt)
let jobsTitle = prompt.slice(0, 20) + "..."

if (isCommand) {
    // Handle commands
    if (cmd === 'upscale') jobsTitle = "Upscaling Image..."
    if (cmd === 'blend') jobsTitle = "Blending Concepts..."
    if (cmd === 'save') jobsTitle = "Saving Project..."
}

const newHistoryItem: HistoryItem = {
    id: Date.now().toString(),
    text: prompt,
    tags: isCommand ? ['command', cmd as string] : ['generation', 'draft'],
    timestamp: Date.now(),
    status: 'success'
}

setHistory([newHistoryItem, ...history])
setPrompt('')
setCurrentJob(jobsTitle)
setGpuStatus('busy')

// Simulate Progress & VRAM
let p = 0
let u = 0
const interval = setInterval(() => {
    p += 5
    u += 10
    if (u > 90) u = 90
    if (p >= 100) {
        clearInterval(interval)
        setVramUsage(10)
        setGpuStatus('online')
        setCurrentJob(null)
        setProgress(0)
    } else {
        setProgress(p)
        setVramUsage(Math.round(u))
    }
}, 200)
  }

return (
    <div className={clsx(
        "relative rounded-xl border transition-all duration-300 bg-black/40 backdrop-blur-md overflow-hidden group",
        isFocused ? "border-neon-cyan shadow-neon-cyan ring-1 ring-neon-cyan/20" : "border-white/10 hover:border-white/20"
    )}>
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <Terminal size={12} className="text-neon-cyan" />
                <span>AI_COMMAND_INPUT</span>
                {currentJob && <span className="text-neon-cyan animate-pulse">| PROCESSING</span>}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={clsx("p-1 rounded hover:bg-white/10 transition-colors", showHistory && "text-neon-cyan bg-white/10")}
                    title="History"
                >
                    <Clock size={14} />
                </button>
                <button className="p-1 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Prompt Library">
                    <Book size={14} />
                </button>
            </div>
        </div>

        {/* Progress Bar Layer */}
        {currentJob && (
            <div className="absolute top-0 left-0 h-[2px] bg-neon-cyan transition-all duration-200 z-50" style={{ width: `${progress}% ` }} />
        )}

        {/* Console Input */}
        <div className="relative p-4">
            <div className="absolute left-4 top-4 text-neon-cyan font-mono select-none pointer-events-none">{'>'}</div>
            <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white font-mono text-sm leading-relaxed pl-6 resize-none min-h-[80px] placeholder:text-gray-700 custom-scrollbar"
                placeholder="Enter prompt or command e.g. !upscale..."
                spellCheck={false}
            />

            {/* Mini Live Preview (Simulated) */}
            {currentJob && (
                <div className="absolute bottom-4 left-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-12 h-12 rounded bg-white/5 border border-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-neon-cyan/20 animate-pulse" />
                    </div>
                    <div className="text-[10px] font-mono text-neon-cyan">
                        Generating preview... {progress}%
                    </div>
                </div>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-3">
                {/* Suggestion Bubble */}
                <AnimatePresence>
                    {suggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1"
                        >
                            <Sparkles size={10} />
                            {suggestion}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || !!currentJob}
                    className="p-2 bg-neon-cyan text-black rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-neon-cyan"
                >
                    <Send size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        {/* Enhanced History Dropdown */}
        <AnimatePresence>
            {showHistory && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 bg-black/60 max-h-60 overflow-y-auto custom-scrollbar"
                >
                    <div className="p-2 space-y-1">
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setPrompt(item.text)
                                    setShowHistory(false)
                                    inputRef.current?.focus()
                                }}
                                className="w-full text-left px-3 py-3 hover:bg-white/5 rounded transition-colors group border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("text-xs font-mono px-1.5 py-0.5 rounded",
                                            item.text.startsWith('!') ? "bg-neon-magenta/20 text-neon-magenta" : "bg-neon-cyan/20 text-neon-cyan"
                                        )}>
                                            {item.text.startsWith('!') ? 'CMD' : 'GEN'}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    {item.status === 'success' && <CheckCircle2 size={12} className="text-neon-green" />}
                                </div>
                                <div className="text-xs text-gray-300 font-mono truncate">{item.text}</div>
                                <div className="flex gap-2 mt-2">
                                    {item.tags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                                            <Tag size={8} /> {tag}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
)
}

export default PromptConsole
    ```
