import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header" [class.scrolled]="isScrolled">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <h1>QuizMaster</h1>
        </div>

        <!-- User Menu Toggle -->
        <button 
          class="user-toggle" 
          (click)="toggleUserMenu()"
          *ngIf="authService.isAuthenticated()"
        >
          <div class="user-avatar">
            {{ getInitials() }}
          </div>
        </button>

        <!-- Menu Toggle -->
        <button class="menu-toggle" (click)="toggleMenu()">
          <span class="hamburger" [class.active]="isMenuOpen"></span>
        </button>
      </div>

      <!-- User Dropdown -->
      <div class="user-dropdown" [class.show]="showUserMenu">
        <div class="user-info">
          <div class="user-avatar-large">
            {{ getInitials() }}
          </div>
          <div class="user-details">
            <h3>{{ authService.getCurrentUser()?.username }}</h3>
            <p>{{ authService.getCurrentUser()?.email }}</p>
          </div>
        </div>
        <div class="user-actions">
          <a routerLink="/profile" (click)="closeUserMenu()" class="user-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Profile
          </a>
          <a routerLink="/my-quizzes" (click)="closeUserMenu()" class="user-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            My Quizzes
          </a>
          <a routerLink="/stats" (click)="closeUserMenu()" class="user-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Statistics
          </a>
          <a routerLink="/collaborations" (click)="closeUserMenu()" class="user-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Collaborations
          </a>
          <hr class="divider">
          <button (click)="logout()" class="user-action logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Menu -->
    <nav class="mobile-nav" [class.open]="isMenuOpen">
      <div class="nav-content">
        <!-- Main Navigation -->
        <div class="nav-section">
          <h3>Main</h3>
          <a routerLink="/" (click)="closeMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Home</span>
          </a>
          <a routerLink="/quiz-generator" (click)="closeMenu()" routerLinkActive="active" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Quiz Generator</span>
          </a>
          <a routerLink="/take-quiz" (click)="closeMenu()" routerLinkActive="active" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C6.47715 21 2 16.9706 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 21 6.47715 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Take Quiz</span>
          </a>
          <a routerLink="/public-quizzes" (click)="closeMenu()" routerLinkActive="active" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Public Quizzes</span>
          </a>
          <a routerLink="/leaderboard" (click)="closeMenu()" routerLinkActive="active" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 3L18 9M6 15L12 21L18 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Leaderboard</span>
          </a>
        </div>

        <!-- User Section -->
        <div class="nav-section" *ngIf="!authService.isAuthenticated()">
          <h3>Account</h3>
          <a routerLink="/login" (click)="closeMenu()" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Login</span>
          </a>
          <a routerLink="/register" (click)="closeMenu()" class="nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Sign Up</span>
          </a>
        </div>

        <!-- Quick Actions -->
        <div class="nav-section">
          <h3>Quick Actions</h3>
          <button class="nav-action" (click)="createQuickQuiz()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Quick Quiz</span>
          </button>
          <button class="nav-action" (click)="openSearch()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Overlay -->
    <div class="nav-overlay" [class.show]="isMenuOpen" (click)="closeMenu()"></div>
  `,
  styles: [`
    .mobile-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #333;
      transition: all 0.3s ease;
    }

    .mobile-header.scrolled {
      background: rgba(26, 26, 26, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      height: 60px;
    }

    .logo h1 {
      color: #ffd700;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .user-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .user-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
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

    .menu-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
    }

    .hamburger {
      width: 24px;
      height: 3px;
      background: #ffd700;
      border-radius: 2px;
      transition: all 0.3s ease;
      position: relative;
    }

    .hamburger::before,
    .hamburger::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 3px;
      background: #ffd700;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .hamburger::before {
      top: -8px;
    }

    .hamburger::after {
      top: 8px;
    }

    .hamburger.active {
      background: transparent;
    }

    .hamburger.active::before {
      top: 0;
      transform: rotate(45deg);
    }

    .hamburger.active::after {
      top: 0;
      transform: rotate(-45deg);
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 1rem;
      width: 280px;
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #333;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1001;
    }

    .user-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #333;
    }

    .user-avatar-large {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .user-details h3 {
      color: #fff;
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .user-details p {
      color: #ccc;
      margin: 0;
      font-size: 0.9rem;
    }

    .user-actions {
      padding: 1rem;
    }

    .user-action {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      color: #ccc;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-size: 1rem;
    }

    .user-action:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .user-action.logout {
      color: #ff6b35;
    }

    .user-action.logout:hover {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
    }

    .divider {
      border: none;
      height: 1px;
      background: #333;
      margin: 0.5rem 0;
    }

    .mobile-nav {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 999;
      overflow-y: auto;
    }

    .mobile-nav.open {
      transform: translateX(0);
    }

    .nav-content {
      padding: 2rem 0;
      height: 100%;
    }

    .nav-section {
      margin-bottom: 2rem;
      padding: 0 1.5rem;
    }

    .nav-section h3 {
      color: #ffd700;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 1rem 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      color: #ccc;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      margin-bottom: 0.5rem;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .nav-link.active {
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
    }

    .nav-action {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      color: #ccc;
      background: none;
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      margin-bottom: 0.5rem;
      width: 100%;
      text-align: left;
      font-size: 1rem;
      cursor: pointer;
    }

    .nav-action:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .nav-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 998;
    }

    .nav-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .header-content {
        padding: 0.75rem;
      }

      .logo h1 {
        font-size: 1.25rem;
      }

      .user-avatar {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }

      .user-dropdown {
        right: 0.75rem;
        width: calc(100vw - 1.5rem);
      }

      .mobile-nav {
        width: 100vw;
      }

      .nav-section {
        padding: 0 1rem;
      }
    }

    /* Touch optimizations */
    @media (hover: none) and (pointer: coarse) {
      .user-toggle:hover,
      .menu-toggle:hover,
      .nav-link:hover,
      .nav-action:hover,
      .user-action:hover {
        background: none;
        color: inherit;
      }

      .user-toggle:active,
      .menu-toggle:active {
        transform: scale(0.95);
      }

      .nav-link:active,
      .nav-action:active,
      .user-action:active {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(0.98);
      }
    }
  `]
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  showUserMenu = false;
  isScrolled = false;
  
  private subscriptions: Subscription[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  private setupScrollListener(): void {
    // Additional scroll handling if needed
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.showUserMenu = false;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.isMenuOpen = false;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
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

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.isMenuOpen = false;
  }

  createQuickQuiz(): void {
    // Navigate to quick quiz creation
    this.closeMenu();
    // Add navigation logic here
  }

  openSearch(): void {
    // Open search modal or navigate to search
    this.closeMenu();
    // Add search logic here
  }
}
