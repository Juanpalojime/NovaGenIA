import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Image, Palette, BrainCircuit, Settings, Menu, X, Command } from 'lucide-react'
import { clsx } from 'clsx'
import { useSystemStore } from '@/store/useSystemStore'
import CommandPalette from '@/components/ui/CommandPalette'

const MainLayout: React.FC = () => {
    const { isConnected, gpuStatus, gpuName, vramUsage } = useSystemStore()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Library', path: '/library', icon: Image },
        { name: 'Pro Studio', path: '/studio', icon: Palette },
        { name: 'Training', path: '/training', icon: BrainCircuit },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    return (
        <div className="flex h-screen bg-background text-white overflow-hidden relative font-sans selection:bg-neon-cyan/30 selection:text-neon-cyan">
            <CommandPalette />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neon-cyan rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                            <span className="font-mono font-bold text-black text-lg">N</span>
                        </div>
                        <span className="font-bold tracking-wider text-neon-cyan text-shadow-neon">NOVAGEN</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 py-6 space-y-1 px-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }: { isActive: boolean }) => clsx(
                                "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-white/5 text-neon-cyan shadow-neon-cyan border border-white/5"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {({ isActive }: { isActive: boolean }) => (
                                <>
                                    {isActive && <div className="absolute inset-0 bg-neon-cyan/5 animate-pulse" />}
                                    <item.icon size={20} className={clsx("relative z-10 transition-transform group-hover:scale-110", isActive && "text-neon-cyan")} />
                                    <span className="relative z-10 ml-3 font-medium">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Connection Widget */}
                <div className="p-4 border-t border-white/5">
                    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg relative overflow-hidden">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold">System Status</span>
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    "text-[10px] font-mono",
                                    isConnected ? "text-neon-green" : "text-red-500"
                                )}>
                                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                                </span>
                                <div className={clsx(
                                    "w-2 h-2 rounded-full",
                                    isConnected ? "bg-neon-green animate-pulse-neon" : "bg-red-500"
                                )} />
                            </div>
                        </div>

                        {/* VRAM Bar */}
                        <div className="space-y-2 relative z-10">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>VRAM Usage</span>
                                <span className="font-mono text-neon-cyan">{vramUsage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-500 ease-out"
                                    style={{ width: `${vramUsage}%` }}
                                />
                            </div>
                        </div>

                        {/* GPU Info */}
                        <div className="mt-3 flex justify-between text-xs font-mono relative z-10">
                            <span className="text-gray-500">GPU</span>
                            <span className="text-white uppercase truncate flex-1 text-right ml-2">{gpuStatus === 'online' ? gpuName : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-300">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neon-cyan/5 via-background to-background pointer-events-none opacity-50" />

                {/* Header */}
                <header className="h-16 flex items-center px-4 md:px-8 border-b border-white/5 z-20 backdrop-blur-md bg-background/50 sticky top-0">
                    <button
                        onClick={toggleSidebar}
                        className="mr-4 md:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white/90 flex items-center gap-2">
                        Command Center
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-400 font-mono">BETA v0.9</span>
                    </h1>

                    <div className="ml-auto flex items-center space-x-2 md:space-x-4">
                        {/* Quick Command Trigger Hint */}
                        <button
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        >
                            <Command size={12} />
                            <span>Command</span>
                            <span className="bg-white/10 px-1 rounded text-[10px]">⌘K</span>
                        </button>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-cyan to-neon-magenta p-[1px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
                                US
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8 z-10 relative scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
