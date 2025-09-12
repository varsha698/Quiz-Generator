import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface UserStats {
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  level: number;
  experience: number;
  experienceToNext: number;
  badges: string[];
  streak: number;
  bestStreak: number;
  categories: { [key: string]: number };
  recentQuizzes: any[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">{{ getInitials() }}</div>
          <div class="level-badge">Level {{ userStats.level }}</div>
        </div>
        <div class="profile-info">
          <h1>{{ getUserName() }}</h1>
          <p class="profile-email">{{ getUserEmail() }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStats.totalQuizzes }}</span>
              <span class="stat-label">Quizzes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.totalScore }}</span>
              <span class="stat-label">Points</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.averageScore }}%</span>
              <span class="stat-label">Average</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.streak }}</span>
              <span class="stat-label">Streak</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="level-progress">
          <h3>Level Progress</h3>
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="getLevelProgress()"
              ></div>
            </div>
            <div class="progress-text">
              {{ userStats.experience }} / {{ userStats.experienceToNext }} XP
            </div>
          </div>
        </div>

        <div class="badges-section">
          <h3>🏆 Badges & Achievements</h3>
          <div class="badges-grid">
            <div 
              *ngFor="let badge of allBadges" 
              class="badge-card"
              [class.earned]="userStats.badges.includes(badge.id)"
            >
              <div class="badge-icon">{{ badge.emoji }}</div>
              <div class="badge-info">
                <h4>{{ badge.name }}</h4>
                <p>{{ badge.description }}</p>
                <div class="badge-status" *ngIf="!userStats.badges.includes(badge.id)">
                  <div class="progress-bar small">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="badge.progress"
                    ></div>
                  </div>
                  <span>{{ badge.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="categories-section">
          <h3>📊 Category Performance</h3>
          <div class="categories-grid">
            <div 
              *ngFor="let category of getCategoryStats()" 
              class="category-card"
            >
              <div class="category-icon">{{ category.emoji }}</div>
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p>{{ category.quizzes }} quizzes</p>
                <div class="category-score">{{ category.average }}% avg</div>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-activity">
          <h3>📈 Recent Activity</h3>
          <div class="activity-list">
            <div 
              *ngFor="let activity of userStats.recentQuizzes" 
              class="activity-item"
            >
              <div class="activity-icon">📝</div>
              <div class="activity-info">
                <h4>{{ activity.quizName }}</h4>
                <p>{{ activity.score }}/{{ activity.total }} ({{ activity.percentage }}%)</p>
                <span class="activity-date">{{ activity.date | date:'short' }}</span>
              </div>
              <div class="activity-score" [class]="getScoreClass(activity.percentage)">
                {{ activity.percentage }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 20px;
      border: 1px solid #ffd700;
    }

    .profile-avatar {
      position: relative;
    }

    .avatar-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
    }

    .level-badge {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
    }

    .profile-info {
      flex: 1;
    }

    .profile-info h1 {
      color: #ffd700;
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
    }

    .profile-email {
      color: #ccc;
      font-size: 1.1rem;
      margin: 0 0 1.5rem 0;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #ccc;
      font-size: 0.9rem;
    }

    .profile-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .level-progress {
      grid-column: 1 / -1;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #333;
    }

    .level-progress h3 {
      color: #ffd700;
      margin: 0 0 1rem 0;
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar.small {
      height: 6px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffd700, #ffed4e);
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .progress-text {
      color: #ccc;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .badges-section, .categories-section, .recent-activity {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #333;
    }

    .badges-section h3, .categories-section h3, .recent-activity h3 {
      color: #ffd700;
      margin: 0 0 1.5rem 0;
    }

    .badges-grid, .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .badge-card, .category-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid #333;
      transition: all 0.3s ease;
    }

    .badge-card.earned {
      background: rgba(255, 215, 0, 0.1);
      border-color: #ffd700;
    }

    .badge-card:hover, .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
    }

    .badge-icon, .category-icon {
      font-size: 2rem;
    }

    .badge-info, .category-info {
      flex: 1;
    }

    .badge-info h4, .category-info h4 {
      color: #f5f5f5;
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .badge-info p, .category-info p {
      color: #ccc;
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .badge-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-status .progress-bar {
      flex: 1;
    }

    .badge-status span {
      font-size: 0.8rem;
      color: #ccc;
    }

    .category-score {
      color: #ffd700;
      font-weight: 600;
      font-size: 0.9rem;
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
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid #333;
    }

    .activity-icon {
      font-size: 1.5rem;
    }

    .activity-info {
      flex: 1;
    }

    .activity-info h4 {
      color: #f5f5f5;
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .activity-info p {
      color: #ccc;
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
    }

    .activity-date {
      color: #888;
      font-size: 0.8rem;
    }

    .activity-score {
      font-size: 1.2rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 20px;
    }

    .activity-score.excellent {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
    }

    .activity-score.good {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
      color: #000;
    }

    .activity-score.average {
      background: linear-gradient(135deg, #17a2b8, #6f42c1);
      color: white;
    }

    .activity-score.poor {
      background: linear-gradient(135deg, #dc3545, #e83e8c);
      color: white;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .profile-content {
        grid-template-columns: 1fr;
      }

      .badges-grid, .categories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  userStats: UserStats = {
    totalQuizzes: 15,
    totalScore: 1250,
    averageScore: 87,
    level: 8,
    experience: 750,
    experienceToNext: 1000,
    badges: ['first-steps', 'perfectionist', 'speed-demon'],
    streak: 5,
    bestStreak: 12,
    categories: {
      'Science': 4,
      'History': 3,
      'Math': 2,
      'General': 6
    },
    recentQuizzes: [
      { quizName: 'Advanced Math Quiz', score: 8, total: 10, percentage: 80, date: new Date() },
      { quizName: 'World History', score: 9, total: 10, percentage: 90, date: new Date(Date.now() - 86400000) },
      { quizName: 'Science Facts', score: 7, total: 10, percentage: 70, date: new Date(Date.now() - 172800000) }
    ]
  };

  allBadges = [
    { id: 'first-steps', name: 'First Steps', description: 'Complete your first quiz', emoji: '👶', progress: 100 },
    { id: 'speed-demon', name: 'Speed Demon', description: 'Complete 10 quizzes quickly', emoji: '⚡', progress: 60 },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', emoji: '💯', progress: 100 },
    { id: 'streak-king', name: 'Streak King', description: 'Complete quizzes for 7 days', emoji: '🔥', progress: 40 },
    { id: 'category-expert', name: 'Category Expert', description: 'Master all categories', emoji: '🎯', progress: 25 },
    { id: 'quiz-master', name: 'Quiz Master', description: 'Complete 100 quizzes', emoji: '🏆', progress: 15 }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Load user stats from API
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '?';
    
    const firstName = user.profile?.firstName || '';
    const lastName = user.profile?.lastName || '';
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'Guest User';
    
    const firstName = user.profile?.firstName || '';
    const lastName = user.profile?.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return user.username;
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'No email';
  }

  getLevelProgress(): number {
    return (this.userStats.experience / this.userStats.experienceToNext) * 100;
  }

  getCategoryStats(): any[] {
    const categoryEmojis: { [key: string]: string } = {
      'Science': '🔬',
      'History': '📚',
      'Math': '🧮',
      'General': '🌟',
      'Literature': '📖',
      'Geography': '🌍',
      'Sports': '⚽',
      'Technology': '💻',
      'Art': '🎨',
      'Music': '🎵'
    };

    return Object.entries(this.userStats.categories).map(([name, quizzes]) => ({
      name,
      quizzes,
      average: Math.floor(Math.random() * 20) + 80, // Mock average
      emoji: categoryEmojis[name] || '📝'
    }));
  }

  getScoreClass(percentage: number): string {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'average';
    return 'poor';
  }
}
