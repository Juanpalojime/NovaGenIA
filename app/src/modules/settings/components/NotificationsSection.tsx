import React, { useState } from 'react'
import { Bell, Volume2, Mail, MessageSquare, Zap, Eye } from 'lucide-react'
import { useGlobalStore } from '../../../store/useGlobalStore'
import { clsx } from 'clsx'

const NotificationsSection: React.FC = () => {
    const { addNotification } = useGlobalStore()
    const [settings, setSettings] = useState({
        enableNotifications: true,
        enableSounds: true,
        enableEmailNotifications: false,
        notifyOnComplete: true,
        notifyOnError: true,
        notifyOnWarning: true
    })

    const updateSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        addNotification({
            type: 'success',
            message: `Notification setting updated`
        })
    }

    const testNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
        const messages = {
            success: 'This is a success notification!',
            error: 'This is an error notification!',
            warning: 'This is a warning notification!',
            info: 'This is an info notification!'
        }
        addNotification({ type, message: messages[type] })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Notification Preferences */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Enable Notifications</div>
                                <div className="text-xs text-gray-500">Show in-app notifications</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.enableNotifications ? "bg-neon-cyan" : "bg-white/10")}
                            onClick={() => updateSetting('enableNotifications')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.enableNotifications ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neon-magenta/10 rounded-lg text-neon-magenta">
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Notification Sounds</div>
                                <div className="text-xs text-gray-500">Play sound on notifications</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.enableSounds ? "bg-neon-magenta" : "bg-white/10")}
                            onClick={() => updateSetting('enableSounds')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.enableSounds ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Mail size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Email Notifications</div>
                                <div className="text-xs text-gray-500">Receive updates via email</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.enableEmailNotifications ? "bg-blue-500" : "bg-white/10")}
                            onClick={() => updateSetting('enableEmailNotifications')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.enableEmailNotifications ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Event Notifications */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Event Notifications</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <Zap size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Generation Complete</div>
                                <div className="text-xs text-gray-500">Notify when image generation finishes</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.notifyOnComplete ? "bg-green-500" : "bg-white/10")}
                            onClick={() => updateSetting('notifyOnComplete')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.notifyOnComplete ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Errors</div>
                                <div className="text-xs text-gray-500">Notify on errors and failures</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.notifyOnError ? "bg-red-500" : "bg-white/10")}
                            onClick={() => updateSetting('notifyOnError')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.notifyOnError ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Eye size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">Warnings</div>
                                <div className="text-xs text-gray-500">Notify on warnings and tips</div>
                            </div>
                        </div>
                        <div
                            className={clsx("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors", settings.notifyOnWarning ? "bg-yellow-500" : "bg-white/10")}
                            onClick={() => updateSetting('notifyOnWarning')}
                        >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", settings.notifyOnWarning ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Test Notifications */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Test Notifications</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => testNotification('success')}
                        className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium"
                    >
                        Test Success
                    </button>
                    <button
                        onClick={() => testNotification('error')}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                        Test Error
                    </button>
                    <button
                        onClick={() => testNotification('warning')}
                        className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 hover:bg-yellow-500/20 transition-colors text-sm font-medium"
                    >
                        Test Warning
                    </button>
                    <button
                        onClick={() => testNotification('info')}
                        className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    >
                        Test Info
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
