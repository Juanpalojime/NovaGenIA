import React, { useState } from 'react'
import { User, Settings as SettingsIcon, Shield, Palette, HardDrive, Bell } from 'lucide-react'
import AppearanceSection from './components/AppearanceSection'
import ConnectionsSection from './components/ConnectionsSection'
import { clsx } from 'clsx'

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'connections' | 'system'>('appearance')

    const tabs = [
        { id: 'profile', label: 'My Account', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'connections', label: 'Connections', icon: Shield },
        { id: 'system', label: 'System Info', icon: HardDrive },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ]

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-[#050505]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/20 shrink-0 flex flex-col pt-6">
                <div className="px-6 mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <SettingsIcon className="text-neon-cyan" />
                        Settings
                    </h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-neon-cyan/10 text-neon-cyan"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 text-[10px] text-gray-600 font-mono text-center">
                    NovaGen v2.0.0-alpha
                    <br />
                    Build 2025.12.23
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto p-12">
                    <header className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h2>
                        <p className="text-gray-400">Manage your global application preferences and configurations.</p>
                    </header>

                    <div className="min-h-[400px]">
                        {activeTab === 'appearance' && <AppearanceSection />}
                        {activeTab === 'connections' && <ConnectionsSection />}
                        {activeTab === 'profile' && (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/5 text-gray-500">
                                <User size={48} className="mb-4 opacity-20" />
                                <p>User Profile module coming in next update.</p>
                            </div>
                        )}
                        {/* More placeholders for other tabs */}
                        {['system', 'notifications'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/5 text-gray-500 animate-pulse">
                                <HardDrive size={48} className="mb-4 opacity-20" />
                                <p>System Diagnostics module loading...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SettingsPage
