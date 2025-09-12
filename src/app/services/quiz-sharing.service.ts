import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PwaService } from './pwa.service';

export interface ShareableQuiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  category: string;
  difficulty: string;
  timeLimit: number;
  createdBy: string;
  createdAt: string;
  shareCode: string;
  isPublic: boolean;
  allowCollaboration: boolean;
  collaborators: string[];
  viewCount: number;
  shareCount: number;
}

export interface ShareLink {
  id: string;
  quizId: string;
  shareCode: string;
  shortUrl: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CollaborationInvite {
  id: string;
  quizId: string;
  invitedBy: string;
  invitedUser: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizSharingService {
  private readonly API_BASE_URL = 'http://localhost:4000/api';
  private shareableQuizzesSubject = new BehaviorSubject<ShareableQuiz[]>([]);
  private shareLinksSubject = new BehaviorSubject<ShareLink[]>([]);
  private collaborationInvitesSubject = new BehaviorSubject<CollaborationInvite[]>([]);

  public shareableQuizzes$ = this.shareableQuizzesSubject.asObservable();
  public shareLinks$ = this.shareLinksSubject.asObservable();
  public collaborationInvites$ = this.collaborationInvitesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private pwaService: PwaService
  ) {}

  // Generate share code for quiz
  generateShareCode(quizId: string): Observable<{ shareCode: string; shortUrl: string }> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{ shareCode: string; shortUrl: string }>(
      `${this.API_BASE_URL}/quizzes/${quizId}/share`,
      {},
      { headers }
    );
  }

  // Get quiz by share code
  getQuizByShareCode(shareCode: string): Observable<ShareableQuiz> {
    return this.http.get<ShareableQuiz>(`${this.API_BASE_URL}/quizzes/share/${shareCode}`);
  }

  // Make quiz public
  makeQuizPublic(quizId: string): Observable<ShareableQuiz> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ShareableQuiz>(
      `${this.API_BASE_URL}/quizzes/${quizId}/public`,
      { isPublic: true },
      { headers }
    ).pipe(
      tap(quiz => this.updateShareableQuiz(quiz))
    );
  }

  // Make quiz private
  makeQuizPrivate(quizId: string): Observable<ShareableQuiz> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ShareableQuiz>(
      `${this.API_BASE_URL}/quizzes/${quizId}/private`,
      { isPublic: false },
      { headers }
    ).pipe(
      tap(quiz => this.updateShareableQuiz(quiz))
    );
  }

  // Enable collaboration for quiz
  enableCollaboration(quizId: string): Observable<ShareableQuiz> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ShareableQuiz>(
      `${this.API_BASE_URL}/quizzes/${quizId}/collaboration`,
      { allowCollaboration: true },
      { headers }
    ).pipe(
      tap(quiz => this.updateShareableQuiz(quiz))
    );
  }

  // Disable collaboration for quiz
  disableCollaboration(quizId: string): Observable<ShareableQuiz> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ShareableQuiz>(
      `${this.API_BASE_URL}/quizzes/${quizId}/collaboration`,
      { allowCollaboration: false },
      { headers }
    ).pipe(
      tap(quiz => this.updateShareableQuiz(quiz))
    );
  }

  // Invite collaborator
  inviteCollaborator(quizId: string, email: string, role: 'editor' | 'viewer'): Observable<CollaborationInvite> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<CollaborationInvite>(
      `${this.API_BASE_URL}/quizzes/${quizId}/collaborators/invite`,
      { email, role },
      { headers }
    ).pipe(
      tap(invite => this.addCollaborationInvite(invite))
    );
  }

  // Accept collaboration invite
  acceptCollaborationInvite(inviteId: string): Observable<CollaborationInvite> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<CollaborationInvite>(
      `${this.API_BASE_URL}/collaboration-invites/${inviteId}/accept`,
      {},
      { headers }
    ).pipe(
      tap(invite => this.updateCollaborationInvite(invite))
    );
  }

  // Decline collaboration invite
  declineCollaborationInvite(inviteId: string): Observable<CollaborationInvite> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<CollaborationInvite>(
      `${this.API_BASE_URL}/collaboration-invites/${inviteId}/decline`,
      {},
      { headers }
    ).pipe(
      tap(invite => this.updateCollaborationInvite(invite))
    );
  }

  // Remove collaborator
  removeCollaborator(quizId: string, userId: string): Observable<ShareableQuiz> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<ShareableQuiz>(
      `${this.API_BASE_URL}/quizzes/${quizId}/collaborators/${userId}`,
      { headers }
    ).pipe(
      tap(quiz => this.updateShareableQuiz(quiz))
    );
  }

  // Get public quizzes
  getPublicQuizzes(page: number = 1, limit: number = 20, category?: string, difficulty?: string): Observable<{ quizzes: ShareableQuiz[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/quizzes/public?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    return this.http.get<{ quizzes: ShareableQuiz[]; total: number; page: number; totalPages: number }>(url);
  }

  // Get my shared quizzes
  getMySharedQuizzes(): Observable<ShareableQuiz[]> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ShareableQuiz[]>(`${this.API_BASE_URL}/quizzes/my-shared`, { headers }).pipe(
      tap(quizzes => this.shareableQuizzesSubject.next(quizzes))
    );
  }

  // Get my collaboration invites
  getMyCollaborationInvites(): Observable<CollaborationInvite[]> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<CollaborationInvite[]>(`${this.API_BASE_URL}/collaboration-invites/my-invites`, { headers }).pipe(
      tap(invites => this.collaborationInvitesSubject.next(invites))
    );
  }

  // Get share links for quiz
  getShareLinks(quizId: string): Observable<ShareLink[]> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ShareLink[]>(`${this.API_BASE_URL}/quizzes/${quizId}/share-links`, { headers }).pipe(
      tap(links => this.shareLinksSubject.next(links))
    );
  }

  // Create custom share link
  createShareLink(quizId: string, expiresAt?: string, maxUses?: number): Observable<ShareLink> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ShareLink>(
      `${this.API_BASE_URL}/quizzes/${quizId}/share-links`,
      { expiresAt, maxUses },
      { headers }
    ).pipe(
      tap(link => this.addShareLink(link))
    );
  }

  // Deactivate share link
  deactivateShareLink(linkId: string): Observable<ShareLink> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ShareLink>(
      `${this.API_BASE_URL}/share-links/${linkId}/deactivate`,
      {},
      { headers }
    ).pipe(
      tap(link => this.updateShareLink(link))
    );
  }

  // Share quiz via native share API
  async shareQuiz(quiz: ShareableQuiz): Promise<boolean> {
    const shareData = {
      title: `Check out this quiz: ${quiz.title}`,
      text: quiz.description,
      url: `${window.location.origin}/quiz/${quiz.shareCode}`
    };

    return await this.pwaService.shareContent(shareData);
  }

  // Copy share link to clipboard
  async copyShareLink(shareCode: string): Promise<boolean> {
    const shareUrl = `${window.location.origin}/quiz/${shareCode}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Failed to copy share link:', error);
      return false;
    }
  }

  // Export quiz as JSON
  exportQuizAsJSON(quiz: ShareableQuiz): void {
    const dataStr = JSON.stringify(quiz, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import quiz from JSON
  importQuizFromJSON(file: File): Observable<ShareableQuiz> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const quiz = JSON.parse(e.target?.result as string);
          observer.next(quiz);
          observer.complete();
        } catch (error) {
          observer.error(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => observer.error(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Get quiz statistics
  getQuizStatistics(quizId: string): Observable<{
    viewCount: number;
    shareCount: number;
    completionCount: number;
    averageScore: number;
    averageTime: number;
    topPerformers: Array<{ username: string; score: number; time: number }>;
  }> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{
      viewCount: number;
      shareCount: number;
      completionCount: number;
      averageScore: number;
      averageTime: number;
      topPerformers: Array<{ username: string; score: number; time: number }>;
    }>(`${this.API_BASE_URL}/quizzes/${quizId}/statistics`, { headers });
  }

  // Private helper methods
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  private updateShareableQuiz(quiz: ShareableQuiz): void {
    const currentQuizzes = this.shareableQuizzesSubject.value;
    const index = currentQuizzes.findIndex(q => q.id === quiz.id);
    if (index !== -1) {
      currentQuizzes[index] = quiz;
      this.shareableQuizzesSubject.next([...currentQuizzes]);
    } else {
      this.shareableQuizzesSubject.next([quiz, ...currentQuizzes]);
    }
  }

  private addCollaborationInvite(invite: CollaborationInvite): void {
    const currentInvites = this.collaborationInvitesSubject.value;
    this.collaborationInvitesSubject.next([invite, ...currentInvites]);
  }

  private updateCollaborationInvite(invite: CollaborationInvite): void {
    const currentInvites = this.collaborationInvitesSubject.value;
    const index = currentInvites.findIndex(i => i.id === invite.id);
    if (index !== -1) {
      currentInvites[index] = invite;
      this.collaborationInvitesSubject.next([...currentInvites]);
    }
  }

  private addShareLink(link: ShareLink): void {
    const currentLinks = this.shareLinksSubject.value;
    this.shareLinksSubject.next([link, ...currentLinks]);
  }

  private updateShareLink(link: ShareLink): void {
    const currentLinks = this.shareLinksSubject.value;
    const index = currentLinks.findIndex(l => l.id === link.id);
    if (index !== -1) {
      currentLinks[index] = link;
      this.shareLinksSubject.next([...currentLinks]);
    }
  }
}
