import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { OfflineStorageService } from '../../services/offline-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOffline" class="offline-indicator">
      <div class="offline-content">
        <div class="offline-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.93 4.93C3.12 6.74 2 9.24 2 12C2 15.87 5.13 19 9 19H15C18.87 19 22 15.87 22 12C22 9.24 20.88 6.74 19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 12H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 12H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 12H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="offline-text">
          <span class="offline-title">You're offline</span>
          <span class="offline-subtitle">Some features may be limited</span>
        </div>
        <div class="offline-actions">
          <button class="retry-btn" (click)="retryConnection()" [disabled]="isRetrying">
            <svg *ngIf="!isRetrying" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg *ngIf="isRetrying" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isRetrying ? 'Retrying...' : 'Retry' }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="showOfflineData" class="offline-data-indicator">
      <div class="offline-data-content">
        <div class="offline-data-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="offline-data-text">
          <span class="offline-data-title">Offline Data Available</span>
          <span class="offline-data-subtitle">{{ offlineSubmissionsCount }} submissions, {{ offlineQuizzesCount }} quizzes</span>
        </div>
        <div class="offline-data-actions">
          <button class="sync-btn" (click)="syncOfflineData()" [disabled]="isSyncing">
            <svg *ngIf="!isSyncing" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg *ngIf="isSyncing" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isSyncing ? 'Syncing...' : 'Sync' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      max-width: 400px;
      width: calc(100% - 40px);
      animation: slideDown 0.3s ease-out;
    }

    .offline-data-indicator {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      max-width: 400px;
      width: calc(100% - 40px);
      animation: slideDown 0.3s ease-out 0.1s both;
    }

    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    .offline-content,
    .offline-data-content {
      background: linear-gradient(145deg, #2a1810, #3a2818);
      border: 2px solid #ff6b35;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .offline-data-content {
      background: linear-gradient(145deg, #0f2a1a, #1a3a2a);
      border-color: #00d4aa;
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }

    .offline-icon,
    .offline-data-icon {
      flex-shrink: 0;
      color: #ff6b35;
    }

    .offline-data-icon {
      color: #00d4aa;
    }

    .offline-text,
    .offline-data-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .offline-title,
    .offline-data-title {
      color: #ff6b35;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .offline-data-title {
      color: #00d4aa;
    }

    .offline-subtitle,
    .offline-data-subtitle {
      color: #ccc;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .offline-actions,
    .offline-data-actions {
      flex-shrink: 0;
    }

    .retry-btn,
    .sync-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      color: #ff6b35;
      border: 1px solid #ff6b35;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .sync-btn {
      color: #00d4aa;
      border-color: #00d4aa;
    }

    .retry-btn:hover,
    .sync-btn:hover {
      background: rgba(255, 107, 53, 0.1);
      transform: translateY(-1px);
    }

    .sync-btn:hover {
      background: rgba(0, 212, 170, 0.1);
    }

    .retry-btn:disabled,
    .sync-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 480px) {
      .offline-indicator,
      .offline-data-indicator {
        left: 10px;
        right: 10px;
        width: auto;
        transform: none;
      }

      .offline-content,
      .offline-data-content {
        padding: 0.875rem 1rem;
        gap: 0.75rem;
      }

      .offline-title,
      .offline-data-title {
        font-size: 0.85rem;
      }

      .offline-subtitle,
      .offline-data-subtitle {
        font-size: 0.75rem;
      }

      .retry-btn,
      .sync-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.75rem;
      }
    }

    @media (max-width: 360px) {
      .offline-content,
      .offline-data-content {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .offline-actions,
      .offline-data-actions {
        width: 100%;
      }

      .retry-btn,
      .sync-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = false;
  showOfflineData = false;
  offlineSubmissionsCount = 0;
  offlineQuizzesCount = 0;
  isRetrying = false;
  isSyncing = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private pwaService: PwaService,
    private offlineStorageService: OfflineStorageService
  ) {}

  ngOnInit(): void {
    // Subscribe to online/offline status
    this.subscriptions.push(
      this.pwaService.isOnline$.subscribe(isOnline => {
        this.isOffline = !isOnline;
      })
    );

    // Subscribe to offline data
    this.subscriptions.push(
      this.offlineStorageService.offlineSubmissions$.subscribe(submissions => {
        this.offlineSubmissionsCount = submissions.length;
        this.updateOfflineDataVisibility();
      })
    );

    this.subscriptions.push(
      this.offlineStorageService.offlineQuizzes$.subscribe(quizzes => {
        this.offlineQuizzesCount = quizzes.length;
        this.updateOfflineDataVisibility();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateOfflineDataVisibility(): void {
    this.showOfflineData = this.isOffline && (this.offlineSubmissionsCount > 0 || this.offlineQuizzesCount > 0);
  }

  async retryConnection(): Promise<void> {
    this.isRetrying = true;
    
    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if we're back online
    if (navigator.onLine) {
      this.isOffline = false;
    }
    
    this.isRetrying = false;
  }

  async syncOfflineData(): Promise<void> {
    this.isSyncing = true;
    
    try {
      await this.offlineStorageService.syncOfflineData();
      this.showOfflineData = false;
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}
