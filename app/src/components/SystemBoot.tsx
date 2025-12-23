import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, CheckCircle2, Cpu, Database, Wifi, Shield } from 'lucide-react'
import { useSystemStore } from '../store/useSystemStore'
import { clsx } from 'clsx'

interface SystemBootProps {
    onComplete: () => void
}

const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
    const [logs, setLogs] = useState<string[]>([])
    const [progress, setProgress] = useState(0)
    const { setConnected, setGpuStatus } = useSystemStore()

    const addLog = (msg: string) => setLogs(prev => [...prev, msg])

    useEffect(() => {
        const sequence = async () => {
            addLog("[INIT] NovaGen Kernel v2.5.0 initializing...")
            await new Promise(r => setTimeout(r, 600))
            setProgress(10)

            addLog("[CHECK] Verifying secure environment...")
            await new Promise(r => setTimeout(r, 500))
            setProgress(30)

            addLog("[CONN] Establishing handshake with Neural Engine...")
            // Simulate handshake
            await new Promise(r => setTimeout(r, 800))
            setConnected(true)
            setProgress(50)
            addLog("[SUCCESS] Connected to Localhost:7860")

            addLog("[GPU] Detecting CUDA capabilities...")
            await new Promise(r => setTimeout(r, 600))
            setGpuStatus('online')
            setProgress(80)
            addLog("[GPU] NVIDIA RTX 4090 detected (24GB VRAM)")

            addLog("[LOAD] Loading User Identity & Presets...")
            await new Promise(r => setTimeout(r, 400))
            setProgress(100)
            addLog("[READY] System fully operational.")

            await new Promise(r => setTimeout(r, 800))
            onComplete()
        }

        sequence()
    }, [])

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[100] font-mono p-10">
            <div className="w-full max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 bg-neon-cyan/20 rounded-lg flex items-center justify-center border border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                        <Cpu size={32} className="text-neon-cyan animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tighter">NOVAGEN <span className="text-neon-cyan">AI</span></h1>
                        <p className="text-neon-cyan/60 text-sm">INITIALIZATION SEQUENCE</p>
                    </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-xl p-6 h-64 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={clsx(
                                    "text-sm flex items-center gap-3",
                                    log.includes("[SUCCESS]") || log.includes("[READY]") ? "text-neon-green" :
                                        log.includes("[GPU]") ? "text-neon-magenta" :
                                            "text-gray-400"
                                )}
                            >
                                <span className="opacity-50">{new Date().toLocaleTimeString()}</span>
                                <span>{log}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        <span>System Loading</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemBoot
