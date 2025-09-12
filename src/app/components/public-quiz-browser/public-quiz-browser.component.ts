import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuizSharingService, ShareableQuiz } from '../../services/quiz-sharing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-quiz-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="public-quiz-browser">
      <!-- Header -->
      <div class="browser-header">
        <h2>Discover Public Quizzes</h2>
        <p>Explore quizzes created by the community</p>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="search-input"
          >
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="filters">
          <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="filter-select">
            <option value="">All Categories</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="technology">Technology</option>
            <option value="literature">Literature</option>
            <option value="sports">Sports</option>
            <option value="general">General Knowledge</option>
          </select>

          <select [(ngModel)]="selectedDifficulty" (change)="applyFilters()" class="filter-select">
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ff6b35"/>
        </svg>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadQuizzes()">Try Again</button>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && !error && filteredQuizzes.length === 0">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>No quizzes found</h3>
        <p>Try adjusting your search or filters</p>
        <button class="clear-filters-btn" (click)="clearFilters()">Clear Filters</button>
      </div>

      <!-- Quiz Grid -->
      <div class="quiz-grid" *ngIf="!isLoading && !error && filteredQuizzes.length > 0">
        <div class="quiz-card" *ngFor="let quiz of paginatedQuizzes">
          <div class="quiz-header">
            <h3 class="quiz-title">{{ quiz.title }}</h3>
            <div class="quiz-meta">
              <span class="quiz-category">{{ quiz.category }}</span>
              <span class="quiz-difficulty" [class]="'difficulty-' + quiz.difficulty">
                {{ quiz.difficulty | titlecase }}
              </span>
            </div>
          </div>

          <div class="quiz-content">
            <p class="quiz-description">{{ quiz.description }}</p>
            
            <div class="quiz-stats">
              <div class="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ quiz.viewCount || 0 }} views</span>
              </div>
              <div class="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ quiz.shareCount || 0 }} shares</span>
              </div>
              <div class="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ quiz.questions.length }} questions</span>
              </div>
            </div>

            <div class="quiz-footer">
              <div class="quiz-author">
                <span>by {{ quiz.createdBy }}</span>
                <span class="quiz-date">{{ formatDate(quiz.createdAt) }}</span>
              </div>
              
              <div class="quiz-actions">
                <button 
                  class="take-quiz-btn" 
                  [routerLink]="['/quiz', quiz.shareCode]"
                >
                  Take Quiz
                </button>
                <button 
                  class="share-btn" 
                  (click)="shareQuiz(quiz)"
                  [disabled]="!canShare"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          class="page-btn" 
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
        >
          Previous
        </button>
        
        <div class="page-numbers">
          <button 
            *ngFor="let page of getPageNumbers()" 
            class="page-number"
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn" 
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .public-quiz-browser {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .browser-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .browser-header h2 {
      color: #ffd700;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }

    .browser-header p {
      color: #ccc;
      font-size: 1.1rem;
      margin: 0;
    }

    .search-filters {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .search-bar {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      background: #333;
      border: 2px solid #555;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #ffd700;
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #ffd700;
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
    .empty-state h3 {
      color: #ff6b35;
      margin: 1rem 0;
    }

    .empty-state h3 {
      color: #ffd700;
    }

    .retry-btn,
    .clear-filters-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn:hover,
    .clear-filters-btn:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .quiz-card {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      border: 1px solid #333;
    }

    .quiz-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      border-color: #ffd700;
    }

    .quiz-header {
      margin-bottom: 1rem;
    }

    .quiz-title {
      color: #fff;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .quiz-meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .quiz-category {
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .quiz-difficulty {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .difficulty-easy {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }

    .difficulty-medium {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }

    .difficulty-hard {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .quiz-content {
      margin-bottom: 1.5rem;
    }

    .quiz-description {
      color: #ccc;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .quiz-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.8rem;
    }

    .quiz-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #333;
    }

    .quiz-author {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quiz-author span:first-child {
      color: #ccc;
      font-size: 0.9rem;
    }

    .quiz-date {
      color: #999;
      font-size: 0.8rem;
    }

    .quiz-actions {
      display: flex;
      gap: 0.75rem;
    }

    .take-quiz-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .take-quiz-btn:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .share-btn {
      padding: 0.75rem;
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .share-btn:hover:not(:disabled) {
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-1px);
    }

    .share-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 3rem;
    }

    .page-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(255, 215, 0, 0.1);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .page-number {
      padding: 0.75rem 1rem;
      background: transparent;
      color: #ccc;
      border: 1px solid #555;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .page-number:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .page-number.active {
      background: #ffd700;
      color: #000;
      border-color: #ffd700;
    }

    @media (max-width: 768px) {
      .public-quiz-browser {
        padding: 1rem;
      }

      .browser-header h2 {
        font-size: 2rem;
      }

      .search-filters {
        padding: 1.5rem;
      }

      .filters {
        flex-direction: column;
      }

      .quiz-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .quiz-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .quiz-actions {
        justify-content: center;
      }

      .pagination {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .quiz-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .page-numbers {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class PublicQuizBrowserComponent implements OnInit, OnDestroy {
  quizzes: ShareableQuiz[] = [];
  filteredQuizzes: ShareableQuiz[] = [];
  paginatedQuizzes: ShareableQuiz[] = [];
  
  searchQuery = '';
  selectedCategory = '';
  selectedDifficulty = '';
  sortBy = 'newest';
  
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  
  isLoading = false;
  error: string | null = null;
  canShare = false;
  
  private searchTimeout: any;
  private subscriptions: Subscription[] = [];

  constructor(private quizSharingService: QuizSharingService) {}

  ngOnInit(): void {
    this.canShare = this.quizSharingService.canShare();
    this.loadQuizzes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadQuizzes(): void {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.push(
      this.quizSharingService.getPublicQuizzes(
        this.currentPage,
        this.itemsPerPage,
        this.selectedCategory || undefined,
        this.selectedDifficulty || undefined
      ).subscribe({
        next: (response) => {
          this.quizzes = response.quizzes;
          this.totalPages = response.totalPages;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load quizzes. Please try again.';
          this.isLoading = false;
          console.error('Error loading quizzes:', error);
        }
      })
    );
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    let filtered = [...this.quizzes];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(quiz => quiz.category === this.selectedCategory);
    }

    // Apply difficulty filter
    if (this.selectedDifficulty) {
      filtered = filtered.filter(quiz => quiz.difficulty === this.selectedDifficulty);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return (b.shareCount || 0) - (a.shareCount || 0);
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

    this.filteredQuizzes = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredQuizzes.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedQuizzes = this.filteredQuizzes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDifficulty = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  async shareQuiz(quiz: ShareableQuiz): Promise<void> {
    try {
      await this.quizSharingService.shareQuiz(quiz);
    } catch (error) {
      console.error('Error sharing quiz:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
