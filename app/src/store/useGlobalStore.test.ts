import { describe, it, expect, beforeEach } from 'vitest'
import { useGlobalStore } from './useGlobalStore'

describe('useGlobalStore', () => {
    beforeEach(() => {
        // Reset to default state
        useGlobalStore.setState({
            user: {
                username: 'NovaUser',
                avatar: '/avatar-default.png',
                role: 'Pro',
                stats: { imagesGenerated: 1240, modelsTrained: 5, hoursActive: 48 },
                badges: ['Early Adopter', 'Model Creator', 'Power User']
            },
            notifications: [],
            themeMode: 'dark',
            accentColor: 'cyan',
            customTheme: { primary: '#00f3ff', secondary: '#7000ff', background: '#050505' },
            uiDensity: 'comfortable',
            reduceMotion: false,
            apiEndpoint: 'http://localhost:7860',
            huggingFaceToken: '',
            civitaiApiKey: '',
            connectionLogs: [],
            autoSaveInterval: 5,
            notificationsEnabled: true
        })
    })

    describe('Initial State', () => {
        it('should have correct default values', () => {
            const state = useGlobalStore.getState()
            expect(state.themeMode).toBe('dark')
            expect(state.accentColor).toBe('cyan')
            expect(state.apiEndpoint).toBe('http://localhost:7860')
            expect(state.uiDensity).toBe('comfortable')
        })

        it('should have default user profile', () => {
            const state = useGlobalStore.getState()
            expect(state.user.username).toBe('NovaUser')
            expect(state.user.role).toBe('Pro')
        })
    })

    describe('Settings Management', () => {
        it('should update theme mode', () => {
            useGlobalStore.getState().updateSettings({ themeMode: 'light' })
            expect(useGlobalStore.getState().themeMode).toBe('light')
        })

        it('should update accent color', () => {
            useGlobalStore.getState().updateSettings({ accentColor: 'magenta' })
            expect(useGlobalStore.getState().accentColor).toBe('magenta')
        })

        it('should update API endpoint', () => {
            useGlobalStore.getState().updateSettings({ apiEndpoint: 'https://my-api.ngrok.io' })
            expect(useGlobalStore.getState().apiEndpoint).toBe('https://my-api.ngrok.io')
        })

        it('should update multiple settings at once', () => {
            useGlobalStore.getState().updateSettings({
                themeMode: 'light',
                uiDensity: 'compact',
                reduceMotion: true
            })

            const state = useGlobalStore.getState()
            expect(state.themeMode).toBe('light')
            expect(state.uiDensity).toBe('compact')
            expect(state.reduceMotion).toBe(true)
        })
    })

    describe('User Profile', () => {
        it('should update username', () => {
            useGlobalStore.getState().updateUser({ username: 'NewUser' })
            expect(useGlobalStore.getState().user.username).toBe('NewUser')
        })

        it('should update user stats', () => {
            useGlobalStore.getState().updateUser({
                stats: { imagesGenerated: 2000, modelsTrained: 10, hoursActive: 100 }
            })

            const stats = useGlobalStore.getState().user.stats
            expect(stats.imagesGenerated).toBe(2000)
            expect(stats.modelsTrained).toBe(10)
        })

        it('should update user role', () => {
            useGlobalStore.getState().updateUser({ role: 'Enterprise' })
            expect(useGlobalStore.getState().user.role).toBe('Enterprise')
        })
    })

    describe('Notifications', () => {
        it('should add notification', () => {
            useGlobalStore.getState().addNotification({
                type: 'success',
                message: 'Test notification'
            })

            const notifications = useGlobalStore.getState().notifications
            expect(notifications).toHaveLength(1)
            expect(notifications[0].message).toBe('Test notification')
            expect(notifications[0].read).toBe(false)
        })

        it('should add multiple notifications', () => {
            useGlobalStore.getState().addNotification({ type: 'info', message: 'First' })
            useGlobalStore.getState().addNotification({ type: 'warning', message: 'Second' })

            const notifications = useGlobalStore.getState().notifications
            expect(notifications).toHaveLength(2)
            expect(notifications[0].message).toBe('Second') // Most recent first
        })

        it('should mark all notifications as read', () => {
            useGlobalStore.getState().addNotification({ type: 'info', message: 'Test 1' })
            useGlobalStore.getState().addNotification({ type: 'info', message: 'Test 2' })
            useGlobalStore.getState().markAllRead()

            const notifications = useGlobalStore.getState().notifications
            expect(notifications.every(n => n.read)).toBe(true)
        })

        it('should generate unique IDs for notifications', () => {
            useGlobalStore.getState().addNotification({ type: 'info', message: 'Test 1' })
            useGlobalStore.getState().addNotification({ type: 'info', message: 'Test 2' })

            const notifications = useGlobalStore.getState().notifications
            expect(notifications[0].id).not.toBe(notifications[1].id)
        })
    })

    describe('Connection Logs', () => {
        it('should log connection message', () => {
            useGlobalStore.getState().logConnection('Connected to backend')

            const logs = useGlobalStore.getState().connectionLogs
            expect(logs).toHaveLength(1)
            expect(logs[0]).toContain('Connected to backend')
        })

        it('should include timestamp in logs', () => {
            useGlobalStore.getState().logConnection('Test message')

            const logs = useGlobalStore.getState().connectionLogs
            // Check that log contains timestamp (handles both 24h and 12h formats)
            expect(logs[0]).toContain('Test message')
            expect(logs[0]).toMatch(/\[\d{1,2}:\d{2}/)
        })

        it('should limit logs to 50 entries', () => {
            // Add 60 logs
            for (let i = 0; i < 60; i++) {
                useGlobalStore.getState().logConnection(`Log ${i}`)
            }

            const logs = useGlobalStore.getState().connectionLogs
            expect(logs).toHaveLength(50)
        })

        it('should keep most recent logs', () => {
            useGlobalStore.getState().logConnection('First')
            useGlobalStore.getState().logConnection('Second')

            const logs = useGlobalStore.getState().connectionLogs
            expect(logs[0]).toContain('Second') // Most recent first
        })
    })

    describe('Reset Defaults', () => {
        it('should reset all settings to defaults', () => {
            // Change some settings
            useGlobalStore.getState().updateSettings({
                themeMode: 'light',
                accentColor: 'magenta',
                uiDensity: 'spacious',
                apiEndpoint: 'https://custom.com'
            })

            // Reset
            useGlobalStore.getState().resetDefaults()

            const state = useGlobalStore.getState()
            expect(state.themeMode).toBe('dark')
            expect(state.accentColor).toBe('cyan')
            expect(state.uiDensity).toBe('comfortable')
            expect(state.apiEndpoint).toBe('http://localhost:7860')
        })
    })

    describe('UI Preferences', () => {
        it('should toggle reduce motion', () => {
            useGlobalStore.getState().updateSettings({ reduceMotion: true })
            expect(useGlobalStore.getState().reduceMotion).toBe(true)
        })

        it('should update UI density', () => {
            useGlobalStore.getState().updateSettings({ uiDensity: 'compact' })
            expect(useGlobalStore.getState().uiDensity).toBe('compact')
        })

        it('should update custom theme colors', () => {
            useGlobalStore.getState().updateSettings({
                customTheme: {
                    primary: '#ff0000',
                    secondary: '#00ff00',
                    background: '#0000ff'
                }
            })

            const theme = useGlobalStore.getState().customTheme
            expect(theme.primary).toBe('#ff0000')
            expect(theme.secondary).toBe('#00ff00')
        })
    })
})
