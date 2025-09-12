import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalSubmissions: number;
  totalViews: number;
  activeUsers: number;
  newUsersToday: number;
  newQuizzesToday: number;
  averageScore: number;
  averageTimeSpent: number;
}

export interface UserAnalytics {
  id: string;
  username: string;
  email: string;
  joinedAt: string;
  lastActive: string;
  totalQuizzes: number;
  totalSubmissions: number;
  averageScore: number;
  totalPoints: number;
  level: number;
  isActive: boolean;
  isBanned: boolean;
}

export interface QuizAnalytics {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  totalSubmissions: number;
  totalViews: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
  difficulty: string;
  category: string;
  tags: string[];
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
}

export interface ContentModeration {
  id: string;
  type: 'quiz' | 'user' | 'comment';
  contentId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'quiz' | 'system';
  targetId: string;
  details: any;
  timestamp: string;
  ipAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_BASE_URL = 'http://localhost:4000/api/admin';
  private statsSubject = new BehaviorSubject<AdminStats | null>(null);
  private userAnalyticsSubject = new BehaviorSubject<UserAnalytics[]>([]);
  private quizAnalyticsSubject = new BehaviorSubject<QuizAnalytics[]>([]);
  private systemMetricsSubject = new BehaviorSubject<SystemMetrics | null>(null);
  private contentModerationSubject = new BehaviorSubject<ContentModeration[]>([]);
  private adminActionsSubject = new BehaviorSubject<AdminAction[]>([]);

  public stats$ = this.statsSubject.asObservable();
  public userAnalytics$ = this.userAnalyticsSubject.asObservable();
  public quizAnalytics$ = this.quizAnalyticsSubject.asObservable();
  public systemMetrics$ = this.systemMetricsSubject.asObservable();
  public contentModeration$ = this.contentModerationSubject.asObservable();
  public adminActions$ = this.adminActionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Dashboard Stats
  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API_BASE_URL}/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // User Management
  getAllUsers(page: number = 1, limit: number = 20, search?: string, sortBy?: string): Observable<{ users: UserAnalytics[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (sortBy) url += `&sortBy=${sortBy}`;

    return this.http.get<{ users: UserAnalytics[]; total: number; page: number; totalPages: number }>(url, {
      headers: this.getAuthHeaders()
    });
  }

  getUserAnalytics(userId: string): Observable<UserAnalytics> {
    return this.http.get<UserAnalytics>(`${this.API_BASE_URL}/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  banUser(userId: string, reason: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/users/${userId}/ban`, {
      reason
    }, {
      headers: this.getAuthHeaders()
    });
  }

  unbanUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/users/${userId}/unban`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_BASE_URL}/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Quiz Management
  getAllQuizzes(page: number = 1, limit: number = 20, search?: string, category?: string, sortBy?: string): Observable<{ quizzes: QuizAnalytics[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/quizzes?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${category}`;
    if (sortBy) url += `&sortBy=${sortBy}`;

    return this.http.get<{ quizzes: QuizAnalytics[]; total: number; page: number; totalPages: number }>(url, {
      headers: this.getAuthHeaders()
    });
  }

  getQuizAnalytics(quizId: string): Observable<QuizAnalytics> {
    return this.http.get<QuizAnalytics>(`${this.API_BASE_URL}/quizzes/${quizId}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteQuiz(quizId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_BASE_URL}/quizzes/${quizId}`, {
      headers: this.getAuthHeaders()
    });
  }

  featureQuiz(quizId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/quizzes/${quizId}/feature`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  unfeatureQuiz(quizId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/quizzes/${quizId}/unfeature`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // System Monitoring
  getSystemMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.API_BASE_URL}/system/metrics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(metrics => this.systemMetricsSubject.next(metrics))
    );
  }

  getSystemLogs(page: number = 1, limit: number = 50, level?: string, search?: string): Observable<{ logs: any[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/system/logs?page=${page}&limit=${limit}`;
    if (level) url += `&level=${level}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    return this.http.get<{ logs: any[]; total: number; page: number; totalPages: number }>(url, {
      headers: this.getAuthHeaders()
    });
  }

  // Content Moderation
  getContentModeration(page: number = 1, limit: number = 20, status?: string, type?: string): Observable<{ reports: ContentModeration[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/moderation?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;

    return this.http.get<{ reports: ContentModeration[]; total: number; page: number; totalPages: number }>(url, {
      headers: this.getAuthHeaders()
    });
  }

  reviewContent(reportId: string, action: 'approve' | 'reject' | 'remove', details?: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/moderation/${reportId}/review`, {
      action,
      details
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // Analytics and Reports
  getAnalyticsReport(startDate: string, endDate: string, metrics: string[]): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/analytics/report`, {
      startDate,
      endDate,
      metrics
    }, {
      headers: this.getAuthHeaders()
    });
  }

  getQuizPerformanceReport(quizId: string, startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.API_BASE_URL}/analytics/quiz/${quizId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    return this.http.get<any>(url, {
      headers: this.getAuthHeaders()
    });
  }

  getUserEngagementReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/analytics/engagement?startDate=${startDate}&endDate=${endDate}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin Actions
  getAdminActions(page: number = 1, limit: number = 20, adminId?: string): Observable<{ actions: AdminAction[]; total: number; page: number; totalPages: number }> {
    let url = `${this.API_BASE_URL}/actions?page=${page}&limit=${limit}`;
    if (adminId) url += `&adminId=${adminId}`;

    return this.http.get<{ actions: AdminAction[]; total: number; page: number; totalPages: number }>(url, {
      headers: this.getAuthHeaders()
    });
  }

  // Settings Management
  getSystemSettings(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/settings`, {
      headers: this.getAuthHeaders()
    });
  }

  updateSystemSettings(settings: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_BASE_URL}/settings`, settings, {
      headers: this.getAuthHeaders()
    });
  }

  // Backup and Maintenance
  createBackup(): Observable<{ message: string; backupId: string }> {
    return this.http.post<{ message: string; backupId: string }>(`${this.API_BASE_URL}/backup/create`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getBackups(): Observable<{ backups: any[] }> {
    return this.http.get<{ backups: any[] }>(`${this.API_BASE_URL}/backup/list`, {
      headers: this.getAuthHeaders()
    });
  }

  restoreBackup(backupId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/backup/restore/${backupId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Real-time Updates
  startRealTimeUpdates(): void {
    // Implement WebSocket connection for real-time updates
    // This would connect to a WebSocket endpoint for live data
  }

  stopRealTimeUpdates(): void {
    // Disconnect WebSocket
  }

  // Utility Methods
  exportData(type: 'users' | 'quizzes' | 'submissions', format: 'csv' | 'json' | 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/export/${type}?format=${format}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  sendNotificationToUsers(userIds: string[], title: string, message: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE_URL}/notifications/send`, {
      userIds,
      title,
      message
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // Check if user has admin privileges
  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin' || user.role === 'superadmin';
  }

  // Check if user has super admin privileges
  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'superadmin';
  }
}
