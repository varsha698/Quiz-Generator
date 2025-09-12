import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizSharingService, ShareableQuiz, ShareLink, CollaborationInvite } from '../../services/quiz-sharing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-sharing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-sharing-container">
      <!-- Share Options -->
      <div class="share-options">
        <h3>Share Quiz</h3>
        
        <!-- Public/Private Toggle -->
        <div class="visibility-toggle">
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              [checked]="quiz?.isPublic" 
              (change)="toggleVisibility($event)"
              [disabled]="isLoading"
            >
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">
            {{ quiz?.isPublic ? 'Public' : 'Private' }}
          </span>
        </div>

        <!-- Share Code -->
        <div class="share-code-section" *ngIf="quiz?.shareCode">
          <label>Share Code:</label>
          <div class="share-code-input">
            <input 
              type="text" 
              [value]="getShareUrl()" 
              readonly 
              #shareInput
            >
            <button 
              class="copy-btn" 
              (click)="copyShareLink(shareInput)"
              [disabled]="isLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
              </svg>
              Copy
            </button>
          </div>
        </div>

        <!-- Native Share Button -->
        <button 
          class="native-share-btn" 
          (click)="shareQuiz()"
          [disabled]="isLoading || !canShare"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
          </svg>
          Share via App
        </button>

        <!-- Export/Import -->
        <div class="export-import-section">
          <button class="export-btn" (click)="exportQuiz()" [disabled]="isLoading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
            </svg>
            Export JSON
          </button>
          
          <label class="import-btn">
            <input 
              type="file" 
              accept=".json" 
              (change)="importQuiz($event)"
              [disabled]="isLoading"
              style="display: none;"
            >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
            </svg>
            Import JSON
          </label>
        </div>
      </div>

      <!-- Collaboration Section -->
      <div class="collaboration-section" *ngIf="quiz?.allowCollaboration">
        <h3>Collaboration</h3>
        
        <!-- Invite Collaborator -->
        <div class="invite-section">
          <div class="invite-form">
            <input 
              type="email" 
              placeholder="Enter email address" 
              [(ngModel)]="inviteEmail"
              [disabled]="isLoading"
            >
            <select [(ngModel)]="inviteRole" [disabled]="isLoading">
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button 
              class="invite-btn" 
              (click)="inviteCollaborator()"
              [disabled]="isLoading || !inviteEmail"
            >
              Invite
            </button>
          </div>
        </div>

        <!-- Collaborators List -->
        <div class="collaborators-list" *ngIf="quiz?.collaborators?.length">
          <h4>Collaborators</h4>
          <div class="collaborator-item" *ngFor="let collaborator of quiz.collaborators">
            <span class="collaborator-email">{{ collaborator }}</span>
            <button 
              class="remove-btn" 
              (click)="removeCollaborator(collaborator)"
              [disabled]="isLoading"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="statistics-section" *ngIf="quiz?.viewCount !== undefined">
        <h3>Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ quiz.viewCount || 0 }}</span>
            <span class="stat-label">Views</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ quiz.shareCount || 0 }}</span>
            <span class="stat-label">Shares</span>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-sharing-container {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .quiz-sharing-container h3 {
      color: #ffd700;
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .quiz-sharing-container h4 {
      color: #ccc;
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .share-options,
    .collaboration-section,
    .statistics-section {
      margin-bottom: 2rem;
    }

    .visibility-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #333;
      transition: 0.4s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: #ffd700;
    }

    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }

    .toggle-label {
      color: #ccc;
      font-weight: 500;
    }

    .share-code-section {
      margin-bottom: 1.5rem;
    }

    .share-code-section label {
      display: block;
      color: #ccc;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .share-code-input {
      display: flex;
      gap: 0.5rem;
    }

    .share-code-input input {
      flex: 1;
      padding: 0.75rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .copy-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .copy-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .native-share-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .native-share-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #66BB6A, #4CAF50);
      transform: translateY(-2px);
    }

    .native-share-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .export-import-section {
      display: flex;
      gap: 1rem;
    }

    .export-btn,
    .import-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .export-btn:hover:not(:disabled),
    .import-btn:hover:not(:disabled) {
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-1px);
    }

    .export-btn:disabled,
    .import-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .invite-section {
      margin-bottom: 1.5rem;
    }

    .invite-form {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .invite-form input {
      flex: 1;
      padding: 0.75rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
    }

    .invite-form select {
      padding: 0.75rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
    }

    .invite-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #2196F3, #42A5F5);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .invite-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #42A5F5, #2196F3);
      transform: translateY(-1px);
    }

    .invite-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .collaborators-list {
      background: #333;
      border-radius: 8px;
      padding: 1rem;
    }

    .collaborator-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #555;
    }

    .collaborator-item:last-child {
      border-bottom: none;
    }

    .collaborator-email {
      color: #ccc;
    }

    .remove-btn {
      padding: 0.5rem 1rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .remove-btn:hover:not(:disabled) {
      background: #d32f2f;
      transform: translateY(-1px);
    }

    .remove-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #333;
      border-radius: 8px;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #ccc;
      font-size: 0.9rem;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top: 4px solid #ffd700;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .quiz-sharing-container {
        padding: 1.5rem;
      }

      .invite-form {
        flex-direction: column;
        align-items: stretch;
      }

      .export-import-section {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .quiz-sharing-container {
        padding: 1rem;
      }

      .share-code-input {
        flex-direction: column;
      }

      .collaborator-item {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
      }

      .remove-btn {
        align-self: center;
      }
    }
  `]
})
export class QuizSharingComponent implements OnInit, OnDestroy {
  @Input() quiz: ShareableQuiz | null = null;
  
  isLoading = false;
  canShare = false;
  inviteEmail = '';
  inviteRole: 'editor' | 'viewer' = 'editor';
  
  private subscriptions: Subscription[] = [];

  constructor(private quizSharingService: QuizSharingService) {}

  ngOnInit(): void {
    this.canShare = this.quizSharingService.canShare();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async toggleVisibility(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    this.isLoading = true;

    try {
      if (target.checked) {
        await this.quizSharingService.makeQuizPublic(this.quiz!.id).toPromise();
      } else {
        await this.quizSharingService.makeQuizPrivate(this.quiz!.id).toPromise();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // Revert the checkbox state
      target.checked = !target.checked;
    } finally {
      this.isLoading = false;
    }
  }

  getShareUrl(): string {
    return `${window.location.origin}/quiz/${this.quiz?.shareCode}`;
  }

  async copyShareLink(input: HTMLInputElement): Promise<void> {
    this.isLoading = true;
    try {
      const success = await this.quizSharingService.copyShareLink(this.quiz!.shareCode);
      if (success) {
        // Show success feedback
        input.select();
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error copying share link:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async shareQuiz(): Promise<void> {
    this.isLoading = true;
    try {
      await this.quizSharingService.shareQuiz(this.quiz!);
    } catch (error) {
      console.error('Error sharing quiz:', error);
    } finally {
      this.isLoading = false;
    }
  }

  exportQuiz(): void {
    if (this.quiz) {
      this.quizSharingService.exportQuizAsJSON(this.quiz);
    }
  }

  importQuiz(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      this.isLoading = true;
      this.quizSharingService.importQuizFromJSON(file).subscribe({
        next: (quiz) => {
          // Handle imported quiz
          console.log('Quiz imported:', quiz);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error importing quiz:', error);
          this.isLoading = false;
        }
      });
    }
  }

  async inviteCollaborator(): Promise<void> {
    if (!this.inviteEmail) return;

    this.isLoading = true;
    try {
      await this.quizSharingService.inviteCollaborator(
        this.quiz!.id, 
        this.inviteEmail, 
        this.inviteRole
      ).toPromise();
      
      this.inviteEmail = '';
      // Show success feedback
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async removeCollaborator(email: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.quizSharingService.removeCollaborator(this.quiz!.id, email).toPromise();
    } catch (error) {
      console.error('Error removing collaborator:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
