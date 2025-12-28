import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

interface UserProfile {
    username: string
    avatar: string
    role: 'Pro' | 'Free' | 'Enterprise'
    stats: {
        imagesGenerated: number
        modelsTrained: number
        hoursActive: number
    }
    badges: string[]
}

interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    timestamp: number
    read: boolean
}

interface GlobalState {
    // User Identity
    user: UserProfile
    notifications: Notification[]

    // APPEARANCE (UI State)
    themeMode: 'dark' | 'light' | 'system'
    accentColor: 'cyan' | 'magenta' | 'green' | 'custom'
    customTheme: {
        primary: string
        secondary: string
        background: string
    }
    uiDensity: 'compact' | 'comfortable' | 'spacious'
    reduceMotion: boolean

    // CONNECTIONS (Infrastructure)
    apiEndpoint: string
    huggingFaceToken: string
    civitaiApiKey: string
    connectionLogs: string[]

    // SYSTEM CONFIG
    autoSaveInterval: number
    notificationsEnabled: boolean

    // Actions
    updateSettings: (settings: Partial<GlobalState>) => void
    updateUser: (user: Partial<UserProfile>) => void
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAllRead: () => void
    logConnection: (message: string) => void
    resetDefaults: () => void
    fetchUserStats: () => Promise<void>
}

export const useGlobalStore = create<GlobalState>()(
    persist(
        (set) => ({
            // Initial State
            user: {
                username: 'NovaUser',
                avatar: '/avatar-default.png', // Local default avatar
                role: 'Pro',
                stats: { imagesGenerated: 1240, modelsTrained: 5, hoursActive: 48 },
                badges: ['Early Adopter', 'Model Creator', 'Power User']
            },
            notifications: [
                { id: '1', type: 'success', message: 'Welcome to NovaGen v2.0!', timestamp: Date.now(), read: false }
            ],

            themeMode: 'dark',
            accentColor: 'cyan',
            customTheme: { primary: '#00f3ff', secondary: '#7000ff', background: '#050505' },
            uiDensity: 'comfortable',
            reduceMotion: false,

            apiEndpoint: 'http://localhost:3000',
            huggingFaceToken: '',
            civitaiApiKey: '',
            connectionLogs: [],

            autoSaveInterval: 5,
            notificationsEnabled: true,

            // Actions
            updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),

            updateUser: (newUser) => set((state) => ({ user: { ...state.user, ...newUser } })),

            addNotification: (notif) => set((state) => ({
                notifications: [
                    { ...notif, id: Math.random().toString(36), timestamp: Date.now(), read: false },
                    ...state.notifications
                ]
            })),

            markAllRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            })),

            logConnection: (msg) => set((state) => ({
                connectionLogs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...state.connectionLogs].slice(0, 50)
            })),

            resetDefaults: () => set({
                themeMode: 'dark',
                accentColor: 'cyan',
                uiDensity: 'comfortable',
                reduceMotion: false,
                apiEndpoint: 'http://localhost:3000',
                notificationsEnabled: true
            }),

            fetchUserStats: async () => {
                try {
                    const stats = await apiFetch<any>('/stats');
                    if (stats) {
                        set((state) => ({
                            user: {
                                ...state.user,
                                stats: {
                                    ...state.user.stats,
                                    imagesGenerated: stats.total_generations || state.user.stats.imagesGenerated,
                                    // Other stats could be added here if backend supports them
                                }
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Error syncing user stats:', error);
                }
            }
        }),
        {
            name: 'novagen-global-storage',
        }
    )
)
