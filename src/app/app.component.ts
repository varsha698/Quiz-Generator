import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { TranslocoRootModule } from './transloco-root.module';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';
import { PwaInstallComponent } from './components/pwa-install/pwa-install.component';
import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterModule, TranslocoRootModule, CommonModule, PwaInstallComponent, OfflineIndicatorComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'QuizMaster';
  showUserMenu = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      // Optionally refresh user data
      this.authService.getUserStats().subscribe({
        next: (response) => {
          // User data is already loaded from localStorage
        },
        error: (error) => {
          console.error('Error refreshing user data:', error);
        }
      });
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
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
  }
}
