import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallPrompt" class="pwa-install-prompt">
      <div class="install-content">
        <div class="install-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ffd700"/>
            <path d="M19 15L20.09 21.26L27 22L20.09 22.74L19 29L17.91 22.74L11 22L17.91 21.26L19 15Z" fill="#ffd700"/>
          </svg>
        </div>
        <div class="install-text">
          <h3>Install QuizMaster</h3>
          <p>Get the full app experience with offline access, push notifications, and more!</p>
        </div>
        <div class="install-actions">
          <button class="install-btn" (click)="installApp()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            Install App
          </button>
          <button class="dismiss-btn" (click)="dismissPrompt()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Not Now
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="showUpdatePrompt" class="pwa-update-prompt">
      <div class="update-content">
        <div class="update-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20H20V4H4V12Z" stroke="#ffd700" stroke-width="2" fill="none"/>
            <path d="M16 8L8 16M8 8L16 16" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="update-text">
          <h3>Update Available</h3>
          <p>A new version of QuizMaster is ready to install!</p>
        </div>
        <div class="update-actions">
          <button class="update-btn" (click)="updateApp()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Update Now
          </button>
          <button class="dismiss-btn" (click)="dismissUpdate()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Later
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-install-prompt,
    .pwa-update-prompt {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      margin: 0 auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .install-content,
    .update-content {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border: 2px solid #ffd700;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
    }

    .install-icon,
    .update-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .install-text h3,
    .update-text h3 {
      color: #ffd700;
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
    }

    .install-text p,
    .update-text p {
      color: #ccc;
      margin: 0 0 1.5rem 0;
      font-size: 0.9rem;
      text-align: center;
      line-height: 1.4;
    }

    .install-actions,
    .update-actions {
      display: flex;
      gap: 0.75rem;
    }

    .install-btn,
    .update-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }

    .install-btn:hover,
    .update-btn:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
    }

    .install-btn:active,
    .update-btn:active {
      transform: translateY(0);
    }

    .dismiss-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: transparent;
      color: #ccc;
      border: 1px solid #333;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dismiss-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border-color: #555;
    }

    .dismiss-btn:active {
      transform: translateY(1px);
    }

    @media (max-width: 480px) {
      .pwa-install-prompt,
      .pwa-update-prompt {
        left: 10px;
        right: 10px;
        bottom: 10px;
      }

      .install-content,
      .update-content {
        padding: 1.25rem;
      }

      .install-text h3,
      .update-text h3 {
        font-size: 1.1rem;
      }

      .install-text p,
      .update-text p {
        font-size: 0.85rem;
      }

      .install-actions,
      .update-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .install-btn,
      .update-btn,
      .dismiss-btn {
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 360px) {
      .install-content,
      .update-content {
        padding: 1rem;
      }

      .install-text h3,
      .update-text h3 {
        font-size: 1rem;
      }

      .install-text p,
      .update-text p {
        font-size: 0.8rem;
      }
    }
  `]
})
export class PwaInstallComponent implements OnInit, OnDestroy {
  showInstallPrompt = false;
  showUpdatePrompt = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    // Subscribe to install prompt
    this.subscriptions.push(
      this.pwaService.installPrompt$.subscribe(prompt => {
        this.showInstallPrompt = !!prompt;
      })
    );

    // Subscribe to update availability
    this.subscriptions.push(
      this.pwaService.updateAvailable$.subscribe(available => {
        this.showUpdatePrompt = available;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async installApp(): Promise<void> {
    const success = await this.pwaService.installApp();
    if (success) {
      this.showInstallPrompt = false;
    }
  }

  dismissPrompt(): void {
    this.pwaService.dismissInstallPrompt();
    this.showInstallPrompt = false;
  }

  async updateApp(): Promise<void> {
    await this.pwaService.updateApp();
    this.showUpdatePrompt = false;
  }

  dismissUpdate(): void {
    this.showUpdatePrompt = false;
  }
}
