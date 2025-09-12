import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your QuizMaster account</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              email
              #email="ngModel"
              class="form-input"
              [class.error]="email.invalid && email.touched"
              placeholder="Enter your email"
            />
            <div *ngIf="email.invalid && email.touched" class="error-message">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              required
              minlength="6"
              #password="ngModel"
              class="form-input"
              [class.error]="password.invalid && password.touched"
              placeholder="Enter your password"
            />
            <div *ngIf="password.invalid && password.touched" class="error-message">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message global-error">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="btn btn-primary btn-full"
          >
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register" class="auth-link">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    }

    .auth-card {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border: 1px solid #ffd700;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(255, 215, 0, 0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .auth-header h1 {
      color: #ffd700;
      font-size: 2rem;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    }

    .auth-header p {
      color: #ccc;
      font-size: 1rem;
    }

    .auth-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: #ffd700;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #1a1a1a;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #ffd700;
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
    }

    .form-input.error {
      border-color: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 0.8rem;
      margin-top: 4px;
    }

    .global-error {
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid #ff4444;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-full {
      width: 100%;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
    }

    .auth-footer p {
      color: #ccc;
      margin: 0;
    }

    .auth-link {
      color: #ffd700;
      text-decoration: none;
      font-weight: 600;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 30px 20px;
      }
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }
}
