import React, { useState } from 'react'
import { User, Settings as SettingsIcon, Shield, Palette, HardDrive, Bell, Cpu } from 'lucide-react'
import AppearanceSection from './components/AppearanceSection'
import ConnectionsSection from './components/ConnectionsSection'
import ProfileSection from './components/ProfileSection'
import SystemInfoSection from './components/SystemInfoSection'
import NotificationsSection from './components/NotificationsSection'
import { GPUMonitor } from './components/GPUMonitor'
import { clsx } from 'clsx'

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'connections' | 'system' | 'gpu' | 'notifications'>('appearance')

    const tabs = [
        { id: 'profile', label: 'My Account', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'connections', label: 'Connections', icon: Shield },
        { id: 'system', label: 'System Info', icon: HardDrive },
        { id: 'gpu', label: 'GPU Status', icon: Cpu },
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
                        {activeTab === 'profile' && <ProfileSection />}
                        {activeTab === 'appearance' && <AppearanceSection />}
                        {activeTab === 'connections' && <ConnectionsSection />}
                        {activeTab === 'system' && <SystemInfoSection />}
                        {activeTab === 'gpu' && <GPUMonitor />}
                        {activeTab === 'notifications' && <NotificationsSection />}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SettingsPage
