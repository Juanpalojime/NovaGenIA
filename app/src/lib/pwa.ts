/**
 * PWA Utilities
 * 
 * Handles PWA installation prompts and service worker registration
 */

export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
    private deferredPrompt: BeforeInstallPromptEvent | null = null;
    private isInstalled = false;

    constructor() {
        this.init();
    }

    private init() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA is installed');
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e as BeforeInstallPromptEvent;
            console.log('Install prompt available');
        });

        // Register service worker
        this.registerServiceWorker();
    }

    private async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker available');
                                // Notify user about update
                                this.notifyUpdate();
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async showInstallPrompt(): Promise<boolean> {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return false;
        }

        try {
            await this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`Install prompt outcome: ${outcome}`);

            this.deferredPrompt = null;
            return outcome === 'accepted';
        } catch (error) {
            console.error('Error showing install prompt:', error);
            return false;
        }
    }

    canInstall(): boolean {
        return this.deferredPrompt !== null && !this.isInstalled;
    }

    isAppInstalled(): boolean {
        return this.isInstalled;
    }

    private notifyUpdate() {
        // You can implement a toast notification here
        console.log('App update available - reload to update');
    }

    async updateServiceWorker() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
            }
        }
    }
}

export const pwaManager = new PWAManager();

// Helper function to check if device is mobile
export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

// Helper function to check if device is iOS
export function isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Helper function to check if running in standalone mode
export function isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
}
