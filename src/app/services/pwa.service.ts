import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private installPromptSubject = new BehaviorSubject<PWAInstallPrompt | null>(null);
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private isInstalledSubject = new BehaviorSubject<boolean>(false);

  public installPrompt$ = this.installPromptSubject.asObservable();
  public updateAvailable$ = this.updateAvailableSubject.asObservable();
  public isOnline$ = this.isOnlineSubject.asObservable();
  public isInstalled$ = this.isInstalledSubject.asObservable();

  private deferredPrompt: PWAInstallPrompt | null = null;

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private initializePWA(): void {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }

    // Check if app is running as PWA
    this.checkPWAInstallStatus();
  }

  private setupEventListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      this.installPromptSubject.next(this.deferredPrompt);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalledSubject.next(true);
      this.installPromptSubject.next(null);
      this.deferredPrompt = null;
      console.log('PWA was installed');
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.updateAvailableSubject.next(true);
      });
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailableSubject.next(true);
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private checkPWAInstallStatus(): void {
    // Check if app is running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    this.isInstalledSubject.next(isStandalone || (isIOS && isInStandaloneMode));
  }

  private checkInstallStatus(): void {
    // Check if the app was previously installed
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    if (wasInstalled) {
      this.isInstalledSubject.next(true);
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.isInstalledSubject.next(true);
        localStorage.setItem('pwa-installed', 'true');
        this.installPromptSubject.next(null);
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }

  public dismissInstallPrompt(): void {
    this.installPromptSubject.next(null);
    this.deferredPrompt = null;
    localStorage.setItem('pwa-install-dismissed', 'true');
  }

  public async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  public async checkForUpdates(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return registration.waiting !== null;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
    return false;
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailableSubject.value;
  }

  public isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  public isInstalled(): boolean {
    return this.isInstalledSubject.value;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification(title, {
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/badge-72x72.png',
          ...options
        });
      }
    }
  }

  public async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing content:', error);
        return false;
      }
    }
    return false;
  }

  public canShare(): boolean {
    return 'share' in navigator;
  }

  public async addToHomeScreen(): Promise<void> {
    // This is handled by the browser's native prompt
    // We just need to ensure the manifest is properly configured
    console.log('Add to home screen functionality is handled by the browser');
  }

  public getDisplayMode(): string {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    } else if (window.matchMedia('(display-mode: browser)').matches) {
      return 'browser';
    }
    return 'unknown';
  }

  public isStandalone(): boolean {
    return this.getDisplayMode() === 'standalone';
  }

  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  public async getCacheSize(): Promise<number> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
      }
      
      return totalSize;
    }
    return 0;
  }
}
