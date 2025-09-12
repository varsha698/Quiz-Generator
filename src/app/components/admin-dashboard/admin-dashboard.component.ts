import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats, UserAnalytics, QuizAnalytics, SystemMetrics } from '../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div class="header-actions">
          <button class="refresh-btn" (click)="refreshData()" [disabled]="isLoading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.37" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8 3.34 17.5033 3.8047 18.0094 4.4611C18.5155 5.1175 18.8 5.9279 18.8 6.7634C18.8 7.5989 18.5155 8.4093 18.0094 9.0657C17.5033 9.7221 16.8 10.1868 16 10.3968" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers | number }}</h3>
            <p>Total Users</p>
            <span class="stat-change positive">+{{ stats.newUsersToday }} today</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon quizzes">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalQuizzes | number }}</h3>
            <p>Total Quizzes</p>
            <span class="stat-change positive">+{{ stats.newQuizzesToday }} today</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon submissions">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C6.47715 21 2 16.9706 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 21 6.47715 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalSubmissions | number }}</h3>
            <p>Total Submissions</p>
            <span class="stat-change">{{ stats.averageScore | number:'1.1-1' }}% avg score</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon views">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalViews | number }}</h3>
            <p>Total Views</p>
            <span class="stat-change">{{ stats.activeUsers }} active users</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="dashboard-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'overview'"
          (click)="setActiveTab('overview')"
        >
          Overview
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'users'"
          (click)="setActiveTab('users')"
        >
          Users
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'quizzes'"
          (click)="setActiveTab('quizzes')"
        >
          Quizzes
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'system'"
          (click)="setActiveTab('system')"
        >
          System
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'moderation'"
          (click)="setActiveTab('moderation')"
        >
          Moderation
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div class="tab-panel" *ngIf="activeTab === 'overview'">
          <div class="overview-grid">
            <!-- Recent Activity -->
            <div class="overview-card">
              <h3>Recent Activity</h3>
              <div class="activity-list">
                <div class="activity-item" *ngFor="let activity of recentActivity">
                  <div class="activity-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <p>{{ activity.description }}</p>
                    <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Health -->
            <div class="overview-card" *ngIf="systemMetrics">
              <h3>System Health</h3>
              <div class="health-metrics">
                <div class="health-item">
                  <span class="health-label">CPU Usage</span>
                  <div class="health-bar">
                    <div class="health-fill" [style.width.%]="systemMetrics.cpuUsage" [class]="getHealthClass(systemMetrics.cpuUsage)"></div>
                  </div>
                  <span class="health-value">{{ systemMetrics.cpuUsage | number:'1.1-1' }}%</span>
                </div>
                <div class="health-item">
                  <span class="health-label">Memory Usage</span>
                  <div class="health-bar">
                    <div class="health-fill" [style.width.%]="systemMetrics.memoryUsage" [class]="getHealthClass(systemMetrics.memoryUsage)"></div>
                  </div>
                  <span class="health-value">{{ systemMetrics.memoryUsage | number:'1.1-1' }}%</span>
                </div>
                <div class="health-item">
                  <span class="health-label">Disk Usage</span>
                  <div class="health-bar">
                    <div class="health-fill" [style.width.%]="systemMetrics.diskUsage" [class]="getHealthClass(systemMetrics.diskUsage)"></div>
                  </div>
                  <span class="health-value">{{ systemMetrics.diskUsage | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div class="tab-panel" *ngIf="activeTab === 'users'">
          <div class="panel-header">
            <h3>User Management</h3>
            <div class="panel-actions">
              <input 
                type="text" 
                placeholder="Search users..." 
                [(ngModel)]="userSearchQuery"
                (input)="searchUsers()"
                class="search-input"
              >
              <select [(ngModel)]="userSortBy" (change)="loadUsers()" class="sort-select">
                <option value="joinedAt">Join Date</option>
                <option value="lastActive">Last Active</option>
                <option value="totalQuizzes">Quiz Count</option>
                <option value="totalPoints">Points</option>
              </select>
            </div>
          </div>
          
          <div class="users-table">
            <div class="table-header">
              <div class="table-cell">User</div>
              <div class="table-cell">Joined</div>
              <div class="table-cell">Last Active</div>
              <div class="table-cell">Quizzes</div>
              <div class="table-cell">Points</div>
              <div class="table-cell">Status</div>
              <div class="table-cell">Actions</div>
            </div>
            
            <div class="table-row" *ngFor="let user of users">
              <div class="table-cell">
                <div class="user-info">
                  <div class="user-avatar">{{ getUserInitials(user.username) }}</div>
                  <div class="user-details">
                    <span class="username">{{ user.username }}</span>
                    <span class="email">{{ user.email }}</span>
                  </div>
                </div>
              </div>
              <div class="table-cell">{{ user.joinedAt | date:'short' }}</div>
              <div class="table-cell">{{ user.lastActive | date:'short' }}</div>
              <div class="table-cell">{{ user.totalQuizzes }}</div>
              <div class="table-cell">{{ user.totalPoints }}</div>
              <div class="table-cell">
                <span class="status-badge" [class]="user.isBanned ? 'banned' : (user.isActive ? 'active' : 'inactive')">
                  {{ user.isBanned ? 'Banned' : (user.isActive ? 'Active' : 'Inactive') }}
                </span>
              </div>
              <div class="table-cell">
                <div class="action-buttons">
                  <button class="action-btn" (click)="viewUser(user.id)">View</button>
                  <button class="action-btn" (click)="toggleUserBan(user)" [class]="user.isBanned ? 'unban' : 'ban'">
                    {{ user.isBanned ? 'Unban' : 'Ban' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quizzes Tab -->
        <div class="tab-panel" *ngIf="activeTab === 'quizzes'">
          <div class="panel-header">
            <h3>Quiz Management</h3>
            <div class="panel-actions">
              <input 
                type="text" 
                placeholder="Search quizzes..." 
                [(ngModel)]="quizSearchQuery"
                (input)="searchQuizzes()"
                class="search-input"
              >
              <select [(ngModel)]="quizCategory" (change)="loadQuizzes()" class="sort-select">
                <option value="">All Categories</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="technology">Technology</option>
                <option value="literature">Literature</option>
                <option value="sports">Sports</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          
          <div class="quizzes-table">
            <div class="table-header">
              <div class="table-cell">Quiz</div>
              <div class="table-cell">Author</div>
              <div class="table-cell">Created</div>
              <div class="table-cell">Submissions</div>
              <div class="table-cell">Views</div>
              <div class="table-cell">Avg Score</div>
              <div class="table-cell">Status</div>
              <div class="table-cell">Actions</div>
            </div>
            
            <div class="table-row" *ngFor="let quiz of quizzes">
              <div class="table-cell">
                <div class="quiz-info">
                  <span class="quiz-title">{{ quiz.title }}</span>
                  <span class="quiz-category">{{ quiz.category }}</span>
                </div>
              </div>
              <div class="table-cell">{{ quiz.createdBy }}</div>
              <div class="table-cell">{{ quiz.createdAt | date:'short' }}</div>
              <div class="table-cell">{{ quiz.totalSubmissions }}</div>
              <div class="table-cell">{{ quiz.totalViews }}</div>
              <div class="table-cell">{{ quiz.averageScore | number:'1.1-1' }}%</div>
              <div class="table-cell">
                <span class="status-badge" [class]="quiz.isPublic ? 'public' : 'private'">
                  {{ quiz.isPublic ? 'Public' : 'Private' }}
                </span>
              </div>
              <div class="table-cell">
                <div class="action-buttons">
                  <button class="action-btn" (click)="viewQuiz(quiz.id)">View</button>
                  <button class="action-btn" (click)="deleteQuiz(quiz.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Tab -->
        <div class="tab-panel" *ngIf="activeTab === 'system'">
          <div class="system-overview">
            <h3>System Monitoring</h3>
            <div class="system-metrics" *ngIf="systemMetrics">
              <div class="metric-card">
                <h4>Performance</h4>
                <div class="metric-item">
                  <span>Response Time</span>
                  <span class="metric-value">{{ systemMetrics.responseTime }}ms</span>
                </div>
                <div class="metric-item">
                  <span>Error Rate</span>
                  <span class="metric-value">{{ systemMetrics.errorRate | number:'1.2-2' }}%</span>
                </div>
                <div class="metric-item">
                  <span>Active Connections</span>
                  <span class="metric-value">{{ systemMetrics.activeConnections }}</span>
                </div>
              </div>
              
              <div class="metric-card">
                <h4>Uptime</h4>
                <div class="uptime-display">
                  <span class="uptime-value">{{ formatUptime(systemMetrics.uptime) }}</span>
                  <span class="uptime-label">System Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Moderation Tab -->
        <div class="tab-panel" *ngIf="activeTab === 'moderation'">
          <div class="moderation-overview">
            <h3>Content Moderation</h3>
            <div class="moderation-stats">
              <div class="mod-stat">
                <span class="mod-number">{{ pendingReports }}</span>
                <span class="mod-label">Pending Reports</span>
              </div>
              <div class="mod-stat">
                <span class="mod-number">{{ resolvedReports }}</span>
                <span class="mod-label">Resolved Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #ffd700;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #333;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon.users {
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
    }

    .stat-icon.quizzes {
      background: linear-gradient(135deg, #2196F3, #42A5F5);
    }

    .stat-icon.submissions {
      background: linear-gradient(135deg, #FF9800, #FFB74D);
    }

    .stat-icon.views {
      background: linear-gradient(135deg, #9C27B0, #BA68C8);
    }

    .stat-content h3 {
      color: #fff;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .stat-content p {
      color: #ccc;
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #4CAF50;
    }

    .dashboard-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #333;
    }

    .tab-button {
      padding: 1rem 1.5rem;
      background: transparent;
      color: #ccc;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .tab-button:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-button.active {
      color: #ffd700;
      border-bottom-color: #ffd700;
    }

    .tab-content {
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .overview-card {
      background: #333;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .overview-card h3 {
      color: #ffd700;
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      background: rgba(255, 215, 0, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffd700;
    }

    .activity-content p {
      color: #fff;
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
    }

    .activity-time {
      color: #999;
      font-size: 0.8rem;
    }

    .health-metrics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .health-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .health-label {
      color: #ccc;
      font-size: 0.9rem;
      min-width: 100px;
    }

    .health-bar {
      flex: 1;
      height: 8px;
      background: #555;
      border-radius: 4px;
      overflow: hidden;
    }

    .health-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .health-fill.good {
      background: #4CAF50;
    }

    .health-fill.warning {
      background: #FF9800;
    }

    .health-fill.danger {
      background: #f44336;
    }

    .health-value {
      color: #fff;
      font-weight: 600;
      min-width: 50px;
      text-align: right;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .panel-header h3 {
      color: #ffd700;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .panel-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-input,
    .sort-select {
      padding: 0.75rem 1rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
    }

    .search-input:focus,
    .sort-select:focus {
      outline: none;
      border-color: #ffd700;
    }

    .users-table,
    .quizzes-table {
      background: #333;
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
      background: #444;
      padding: 1rem;
      font-weight: 600;
      color: #ffd700;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
      padding: 1rem;
      border-bottom: 1px solid #555;
      transition: background 0.3s ease;
    }

    .table-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .table-cell {
      display: flex;
      align-items: center;
      color: #ccc;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .username {
      color: #fff;
      font-weight: 600;
    }

    .email {
      color: #999;
      font-size: 0.8rem;
    }

    .quiz-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quiz-title {
      color: #fff;
      font-weight: 600;
    }

    .quiz-category {
      color: #999;
      font-size: 0.8rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }

    .status-badge.inactive {
      background: rgba(158, 158, 158, 0.2);
      color: #9E9E9E;
    }

    .status-badge.banned {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .status-badge.public {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }

    .status-badge.private {
      background: rgba(158, 158, 158, 0.2);
      color: #9E9E9E;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(255, 215, 0, 0.1);
    }

    .action-btn.ban {
      color: #f44336;
      border-color: #f44336;
    }

    .action-btn.unban {
      color: #4CAF50;
      border-color: #4CAF50;
    }

    .system-overview h3,
    .moderation-overview h3 {
      color: #ffd700;
      margin: 0 0 2rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .system-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .metric-card {
      background: #333;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .metric-card h4 {
      color: #ffd700;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #555;
    }

    .metric-item:last-child {
      border-bottom: none;
    }

    .metric-value {
      color: #fff;
      font-weight: 600;
    }

    .uptime-display {
      text-align: center;
    }

    .uptime-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #4CAF50;
      margin-bottom: 0.5rem;
    }

    .uptime-label {
      color: #ccc;
      font-size: 0.9rem;
    }

    .moderation-stats {
      display: flex;
      gap: 2rem;
    }

    .mod-stat {
      text-align: center;
      background: #333;
      border-radius: 12px;
      padding: 2rem;
    }

    .mod-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 0.5rem;
    }

    .mod-label {
      color: #ccc;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-tabs {
        flex-wrap: wrap;
      }

      .panel-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .panel-actions {
        flex-direction: column;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .table-cell {
        justify-content: space-between;
      }

      .action-buttons {
        justify-content: center;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'overview' | 'users' | 'quizzes' | 'system' | 'moderation' = 'overview';
  
  stats: AdminStats | null = null;
  users: UserAnalytics[] = [];
  quizzes: QuizAnalytics[] = [];
  systemMetrics: SystemMetrics | null = null;
  
  userSearchQuery = '';
  quizSearchQuery = '';
  userSortBy = 'joinedAt';
  quizCategory = '';
  
  recentActivity: any[] = [];
  pendingReports = 0;
  resolvedReports = 0;
  
  isLoading = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setActiveTab(tab: 'overview' | 'users' | 'quizzes' | 'system' | 'moderation'): void {
    this.activeTab = tab;
    this.loadTabData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.subscriptions.push(
      this.adminService.getDashboardStats().subscribe({
        next: (stats) => {
          this.stats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.isLoading = false;
        }
      })
    );

    this.subscriptions.push(
      this.adminService.getSystemMetrics().subscribe({
        next: (metrics) => {
          this.systemMetrics = metrics;
        },
        error: (error) => {
          console.error('Error loading system metrics:', error);
        }
      })
    );
  }

  loadTabData(): void {
    switch (this.activeTab) {
      case 'users':
        this.loadUsers();
        break;
      case 'quizzes':
        this.loadQuizzes();
        break;
      case 'system':
        this.loadSystemData();
        break;
      case 'moderation':
        this.loadModerationData();
        break;
    }
  }

  loadUsers(): void {
    this.subscriptions.push(
      this.adminService.getAllUsers(1, 20, this.userSearchQuery, this.userSortBy).subscribe({
        next: (response) => {
          this.users = response.users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      })
    );
  }

  loadQuizzes(): void {
    this.subscriptions.push(
      this.adminService.getAllQuizzes(1, 20, this.quizSearchQuery, this.quizCategory).subscribe({
        next: (response) => {
          this.quizzes = response.quizzes;
        },
        error: (error) => {
          console.error('Error loading quizzes:', error);
        }
      })
    );
  }

  loadSystemData(): void {
    // Load additional system data if needed
  }

  loadModerationData(): void {
    this.subscriptions.push(
      this.adminService.getContentModeration(1, 20, 'pending').subscribe({
        next: (response) => {
          this.pendingReports = response.total;
        },
        error: (error) => {
          console.error('Error loading moderation data:', error);
        }
      })
    );
  }

  searchUsers(): void {
    this.loadUsers();
  }

  searchQuizzes(): void {
    this.loadQuizzes();
  }

  refreshData(): void {
    this.loadDashboardData();
    this.loadTabData();
  }

  getUserInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }

  getHealthClass(usage: number): string {
    if (usage < 50) return 'good';
    if (usage < 80) return 'warning';
    return 'danger';
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }

  viewUser(userId: string): void {
    // Navigate to user details
    console.log('View user:', userId);
  }

  toggleUserBan(user: UserAnalytics): void {
    if (user.isBanned) {
      this.adminService.unbanUser(user.id).subscribe({
        next: () => {
          user.isBanned = false;
        },
        error: (error) => {
          console.error('Error unbanning user:', error);
        }
      });
    } else {
      this.adminService.banUser(user.id, 'Admin action').subscribe({
        next: () => {
          user.isBanned = true;
        },
        error: (error) => {
          console.error('Error banning user:', error);
        }
      });
    }
  }

  viewQuiz(quizId: string): void {
    // Navigate to quiz details
    console.log('View quiz:', quizId);
  }

  deleteQuiz(quizId: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.adminService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.loadQuizzes();
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
        }
      });
    }
  }
}
