import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollaborationInvite, ShareableQuiz } from '../../services/quiz-sharing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collaboration-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="collaboration-management">
      <!-- Header -->
      <div class="management-header">
        <h2>Collaboration Management</h2>
        <p>Manage your quiz collaborations and invitations</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'invites'"
          (click)="setActiveTab('invites')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          My Invites
          <span class="tab-badge" *ngIf="pendingInvitesCount > 0">{{ pendingInvitesCount }}</span>
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'collaborations'"
          (click)="setActiveTab('collaborations')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.37" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13C16.8 3.34 17.5033 3.8047 18.0094 4.4611C18.5155 5.1175 18.8 5.9279 18.8 6.7634C18.8 7.5989 18.5155 8.4093 18.0094 9.0657C17.5033 9.7221 16.8 10.1868 16 10.3968" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          My Collaborations
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ff6b35"/>
        </svg>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadData()">Try Again</button>
      </div>

      <!-- Invites Tab -->
      <div class="tab-content" *ngIf="activeTab === 'invites' && !isLoading && !error">
        <div class="invites-section">
          <h3>Pending Invitations</h3>
          
          <div class="empty-state" *ngIf="collaborationInvites.length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h4>No pending invitations</h4>
            <p>You don't have any collaboration invitations at the moment.</p>
          </div>

          <div class="invite-list" *ngIf="collaborationInvites.length > 0">
            <div class="invite-card" *ngFor="let invite of collaborationInvites">
              <div class="invite-header">
                <div class="invite-info">
                  <h4>{{ getQuizTitle(invite.quizId) }}</h4>
                  <p>Invited by {{ invite.invitedBy }}</p>
                </div>
                <div class="invite-status">
                  <span class="status-badge" [class]="'status-' + invite.status">
                    {{ invite.status | titlecase }}
                  </span>
                </div>
              </div>

              <div class="invite-details">
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>Role: {{ invite.role | titlecase }}</span>
                </div>
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Invited: {{ formatDate(invite.createdAt) }}</span>
                </div>
                <div class="detail-item" *ngIf="invite.expiresAt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>Expires: {{ formatDate(invite.expiresAt) }}</span>
                </div>
              </div>

              <div class="invite-actions" *ngIf="invite.status === 'pending'">
                <button 
                  class="accept-btn" 
                  (click)="acceptInvite(invite.id)"
                  [disabled]="isProcessing"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Accept
                </button>
                <button 
                  class="decline-btn" 
                  (click)="declineInvite(invite.id)"
                  [disabled]="isProcessing"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaborations Tab -->
      <div class="tab-content" *ngIf="activeTab === 'collaborations' && !isLoading && !error">
        <div class="collaborations-section">
          <h3>Active Collaborations</h3>
          
          <div class="empty-state" *ngIf="mySharedQuizzes.length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="#ffd700" stroke-width="2"/>
            </svg>
            <h4>No active collaborations</h4>
            <p>You're not currently collaborating on any quizzes.</p>
          </div>

          <div class="collaboration-list" *ngIf="mySharedQuizzes.length > 0">
            <div class="collaboration-card" *ngFor="let quiz of mySharedQuizzes">
              <div class="collaboration-header">
                <div class="quiz-info">
                  <h4>{{ quiz.title }}</h4>
                  <p>{{ quiz.description }}</p>
                </div>
                <div class="collaboration-status">
                  <span class="status-badge" [class]="quiz.isPublic ? 'status-public' : 'status-private'">
                    {{ quiz.isPublic ? 'Public' : 'Private' }}
                  </span>
                  <span class="collaboration-badge" *ngIf="quiz.allowCollaboration">
                    Collaboration Enabled
                  </span>
                </div>
              </div>

              <div class="collaboration-stats">
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ quiz.viewCount || 0 }} views</span>
                </div>
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ quiz.shareCount || 0 }} shares</span>
                </div>
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ quiz.collaborators?.length || 0 }} collaborators</span>
                </div>
              </div>

              <div class="collaborators-list" *ngIf="quiz.collaborators?.length">
                <h5>Collaborators:</h5>
                <div class="collaborator-tags">
                  <span class="collaborator-tag" *ngFor="let collaborator of quiz.collaborators">
                    {{ collaborator }}
                    <button 
                      class="remove-collaborator-btn" 
                      (click)="removeCollaborator(quiz.id, collaborator)"
                      [disabled]="isProcessing"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <div class="collaboration-actions">
                <button 
                  class="action-btn primary" 
                  [routerLink]="['/quiz', quiz.shareCode]"
                >
                  View Quiz
                </button>
                <button 
                  class="action-btn secondary" 
                  (click)="toggleCollaboration(quiz)"
                  [disabled]="isProcessing"
                >
                  {{ quiz.allowCollaboration ? 'Disable' : 'Enable' }} Collaboration
                </button>
                <button 
                  class="action-btn secondary" 
                  (click)="toggleVisibility(quiz)"
                  [disabled]="isProcessing"
                >
                  Make {{ quiz.isPublic ? 'Private' : 'Public' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collaboration-management {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .management-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .management-header h2 {
      color: #ffd700;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }

    .management-header p {
      color: #ccc;
      font-size: 1.1rem;
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #333;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: transparent;
      color: #ccc;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .tab-button:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-button.active {
      color: #ffd700;
      border-bottom-color: #ffd700;
    }

    .tab-badge {
      background: #ff6b35;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .tab-content {
      min-height: 400px;
    }

    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top: 4px solid #ffd700;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state h3,
    .empty-state h4 {
      color: #ff6b35;
      margin: 1rem 0;
    }

    .empty-state h4 {
      color: #ffd700;
    }

    .retry-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .invites-section,
    .collaborations-section {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .invites-section h3,
    .collaborations-section h3 {
      color: #ffd700;
      margin: 0 0 2rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .invite-list,
    .collaboration-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .invite-card,
    .collaboration-card {
      background: #333;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #555;
      transition: all 0.3s ease;
    }

    .invite-card:hover,
    .collaboration-card:hover {
      border-color: #ffd700;
      transform: translateY(-2px);
    }

    .invite-header,
    .collaboration-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .invite-info h4,
    .quiz-info h4 {
      color: #fff;
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .invite-info p,
    .quiz-info p {
      color: #ccc;
      margin: 0;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-pending {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }

    .status-accepted {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }

    .status-declined {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .status-public {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }

    .status-private {
      background: rgba(158, 158, 158, 0.2);
      color: #9E9E9E;
    }

    .collaboration-badge {
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-left: 0.5rem;
    }

    .invite-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.9rem;
    }

    .invite-actions {
      display: flex;
      gap: 1rem;
    }

    .accept-btn,
    .decline-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .accept-btn {
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
    }

    .accept-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #66BB6A, #4CAF50);
      transform: translateY(-1px);
    }

    .decline-btn {
      background: transparent;
      color: #f44336;
      border: 1px solid #f44336;
    }

    .decline-btn:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.1);
      transform: translateY(-1px);
    }

    .accept-btn:disabled,
    .decline-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .collaboration-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.9rem;
    }

    .collaborators-list {
      margin-bottom: 1.5rem;
    }

    .collaborators-list h5 {
      color: #ccc;
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .collaborator-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .collaborator-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 215, 0, 0.1);
      color: #ffd700;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .remove-collaborator-btn {
      background: none;
      border: none;
      color: #ff6b35;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: bold;
      padding: 0;
      margin-left: 0.5rem;
    }

    .remove-collaborator-btn:hover:not(:disabled) {
      color: #f44336;
    }

    .collaboration-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
    }

    .action-btn.primary:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .action-btn.secondary {
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-1px);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .collaboration-management {
        padding: 1rem;
      }

      .management-header h2 {
        font-size: 2rem;
      }

      .tabs {
        flex-direction: column;
        gap: 0;
      }

      .tab-button {
        border-bottom: 1px solid #555;
        border-radius: 0;
      }

      .invite-header,
      .collaboration-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .collaboration-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .invite-actions,
      .collaboration-actions {
        flex-direction: column;
      }

      .collaborator-tags {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .invite-card,
      .collaboration-card {
        padding: 1rem;
      }

      .detail-item {
        font-size: 0.8rem;
      }

      .stat-item {
        font-size: 0.8rem;
      }
    }
  `]
})
export class CollaborationManagementComponent implements OnInit, OnDestroy {
  activeTab: 'invites' | 'collaborations' = 'invites';
  
  collaborationInvites: CollaborationInvite[] = [];
  mySharedQuizzes: ShareableQuiz[] = [];
  
  isLoading = false;
  isProcessing = false;
  error: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private quizSharingService: QuizSharingService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setActiveTab(tab: 'invites' | 'collaborations'): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    if (this.activeTab === 'invites') {
      this.loadCollaborationInvites();
    } else {
      this.loadMySharedQuizzes();
    }
  }

  loadCollaborationInvites(): void {
    this.subscriptions.push(
      this.quizSharingService.getMyCollaborationInvites().subscribe({
        next: (invites) => {
          this.collaborationInvites = invites;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load collaboration invites.';
          this.isLoading = false;
          console.error('Error loading collaboration invites:', error);
        }
      })
    );
  }

  loadMySharedQuizzes(): void {
    this.subscriptions.push(
      this.quizSharingService.getMySharedQuizzes().subscribe({
        next: (quizzes) => {
          this.mySharedQuizzes = quizzes;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load shared quizzes.';
          this.isLoading = false;
          console.error('Error loading shared quizzes:', error);
        }
      })
    );
  }

  async acceptInvite(inviteId: string): Promise<void> {
    this.isProcessing = true;
    try {
      await this.quizSharingService.acceptCollaborationInvite(inviteId).toPromise();
      this.loadCollaborationInvites();
    } catch (error) {
      console.error('Error accepting invite:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async declineInvite(inviteId: string): Promise<void> {
    this.isProcessing = true;
    try {
      await this.quizSharingService.declineCollaborationInvite(inviteId).toPromise();
      this.loadCollaborationInvites();
    } catch (error) {
      console.error('Error declining invite:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async removeCollaborator(quizId: string, email: string): Promise<void> {
    this.isProcessing = true;
    try {
      await this.quizSharingService.removeCollaborator(quizId, email).toPromise();
      this.loadMySharedQuizzes();
    } catch (error) {
      console.error('Error removing collaborator:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async toggleCollaboration(quiz: ShareableQuiz): Promise<void> {
    this.isProcessing = true;
    try {
      if (quiz.allowCollaboration) {
        await this.quizSharingService.disableCollaboration(quiz.id).toPromise();
      } else {
        await this.quizSharingService.enableCollaboration(quiz.id).toPromise();
      }
      this.loadMySharedQuizzes();
    } catch (error) {
      console.error('Error toggling collaboration:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async toggleVisibility(quiz: ShareableQuiz): Promise<void> {
    this.isProcessing = true;
    try {
      if (quiz.isPublic) {
        await this.quizSharingService.makeQuizPrivate(quiz.id).toPromise();
      } else {
        await this.quizSharingService.makeQuizPublic(quiz.id).toPromise();
      }
      this.loadMySharedQuizzes();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  getQuizTitle(quizId: string): string {
    // This would typically fetch the quiz title from the quiz service
    // For now, return a placeholder
    return `Quiz ${quizId.substring(0, 8)}...`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get pendingInvitesCount(): number {
    return this.collaborationInvites.filter(invite => invite.status === 'pending').length;
  }
}
