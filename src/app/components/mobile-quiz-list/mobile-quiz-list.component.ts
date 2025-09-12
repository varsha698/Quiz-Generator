import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Quiz } from '../../services/quiz-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-quiz-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mobile-quiz-list">
      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="search-input"
          >
          <button 
            class="clear-search" 
            (click)="clearSearch()"
            *ngIf="searchQuery"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="filter-chips">
          <button 
            *ngFor="let category of categories" 
            class="filter-chip"
            [class.active]="selectedCategory === category"
            (click)="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <div class="sort-options">
          <select [(ngModel)]="sortBy" (change)="applySorting()" class="sort-select">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="questions">Questions</option>
          </select>
        </div>
      </div>

      <!-- Quiz Grid -->
      <div class="quiz-grid" *ngIf="filteredQuizzes.length > 0">
        <div 
          class="quiz-card" 
          *ngFor="let quiz of paginatedQuizzes; trackBy: trackByQuizId"
          (click)="selectQuiz(quiz)"
          [class.selected]="selectedQuiz?.id === quiz.id"
        >
          <!-- Quiz Header -->
          <div class="quiz-header">
            <div class="quiz-title">
              <h3>{{ quiz.name }}</h3>
              <p *ngIf="quiz.description">{{ quiz.description }}</p>
            </div>
            <div class="quiz-actions">
              <button 
                class="action-btn" 
                (click)="toggleFavorite(quiz, $event)"
                [class.favorited]="isFavorite(quiz.id)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button 
                class="action-btn" 
                (click)="shareQuiz(quiz, $event)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quiz Stats -->
          <div class="quiz-stats">
            <div class="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ quiz.questions.length }} questions</span>
            </div>
            <div class="stat-item" *ngIf="quiz.timeLimit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 21 6.47715 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ formatTimeLimit(quiz.timeLimit) }}</span>
            </div>
            <div class="stat-item" *ngIf="quiz.difficulty">
              <span class="difficulty-badge" [class]="'difficulty-' + quiz.difficulty">
                {{ quiz.difficulty | titlecase }}
              </span>
            </div>
          </div>

          <!-- Quiz Footer -->
          <div class="quiz-footer">
            <div class="quiz-meta">
              <span class="quiz-category" *ngIf="quiz.category">{{ quiz.category }}</span>
              <span class="quiz-date">{{ formatDate(quiz.createdAt) }}</span>
            </div>
            <div class="quiz-buttons">
              <button 
                class="quiz-btn secondary" 
                (click)="previewQuiz(quiz, $event)"
              >
                Preview
              </button>
              <button 
                class="quiz-btn primary" 
                (click)="startQuiz(quiz, $event)"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredQuizzes.length === 0 && !isLoading">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C6.47715 21 2 16.9706 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 21 6.47715 21 12Z" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>No quizzes found</h3>
        <p>Try adjusting your search or filters</p>
        <button class="clear-filters-btn" (click)="clearAllFilters()">Clear Filters</button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          class="page-btn" 
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mobile-quiz-list {
      padding: 1rem;
      max-width: 100%;
    }

    .search-filters {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .search-bar {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
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

    .clear-search {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .clear-search:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .filter-chip {
      padding: 0.5rem 1rem;
      background: #333;
      color: #ccc;
      border: 1px solid #555;
      border-radius: 20px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-chip:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .filter-chip.active {
      background: #ffd700;
      color: #000;
      border-color: #ffd700;
    }

    .sort-options {
      display: flex;
      justify-content: flex-end;
    }

    .sort-select {
      padding: 0.75rem 1rem;
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .sort-select:focus {
      outline: none;
      border-color: #ffd700;
    }

    .quiz-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .quiz-card {
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .quiz-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      border-color: #ffd700;
    }

    .quiz-card.selected {
      border-color: #ffd700;
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
    }

    .quiz-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ffd700, #ffed4e);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .quiz-card.selected::before {
      opacity: 1;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .quiz-title h3 {
      color: #fff;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .quiz-title p {
      color: #ccc;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .quiz-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: #ccc;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .action-btn.favorited {
      color: #ff6b35;
    }

    .quiz-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.9rem;
    }

    .difficulty-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
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

    .quiz-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #333;
    }

    .quiz-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quiz-category {
      color: #ffd700;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .quiz-date {
      color: #999;
      font-size: 0.8rem;
    }

    .quiz-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .quiz-btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .quiz-btn.primary {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
    }

    .quiz-btn.primary:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .quiz-btn.secondary {
      background: transparent;
      color: #ffd700;
      border: 1px solid #ffd700;
    }

    .quiz-btn.secondary:hover {
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-1px);
    }

    .empty-state,
    .loading-state {
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

    .empty-state h3 {
      color: #ffd700;
      margin: 1rem 0;
    }

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

    .clear-filters-btn:hover {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-1px);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-btn {
      width: 40px;
      height: 40px;
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
      width: 40px;
      height: 40px;
      background: transparent;
      color: #ccc;
      border: 1px solid #555;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
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

    /* Touch optimizations */
    @media (hover: none) and (pointer: coarse) {
      .quiz-card:hover {
        transform: none;
      }

      .quiz-card:active {
        transform: scale(0.98);
      }

      .action-btn:hover,
      .quiz-btn:hover,
      .page-btn:hover,
      .page-number:hover {
        transform: none;
      }

      .action-btn:active,
      .quiz-btn:active,
      .page-btn:active,
      .page-number:active {
        transform: scale(0.95);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .mobile-quiz-list {
        padding: 0.75rem;
      }

      .search-filters {
        padding: 1rem;
      }

      .quiz-card {
        padding: 1.25rem;
      }

      .quiz-title h3 {
        font-size: 1.1rem;
      }

      .quiz-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      .quiz-btn {
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
      }

      .pagination {
        flex-wrap: wrap;
      }
    }
  `]
})
export class MobileQuizListComponent implements OnInit, OnDestroy {
  @Input() quizzes: Quiz[] = [];
  @Input() isLoading = false;
  @Output() quizSelected = new EventEmitter<Quiz>();
  @Output() quizStarted = new EventEmitter<Quiz>();
  @Output() quizPreviewed = new EventEmitter<Quiz>();
  @Output() quizFavorited = new EventEmitter<{ quiz: Quiz; favorited: boolean }>();
  @Output() quizShared = new EventEmitter<Quiz>();

  filteredQuizzes: Quiz[] = [];
  paginatedQuizzes: Quiz[] = [];
  selectedQuiz: Quiz | null = null;
  
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'newest';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  categories = ['All', 'Science', 'History', 'Technology', 'Literature', 'Sports', 'General'];
  favorites: Set<string> = new Set();
  
  private searchTimeout: any;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadFavorites();
    this.filteredQuizzes = [...this.quizzes];
    this.updatePagination();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  toggleCategory(category: string): void {
    if (category === 'All') {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = this.selectedCategory === category ? '' : category;
    }
    this.applyFilters();
  }

  applySorting(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.quizzes];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.name.toLowerCase().includes(query) ||
        (quiz.description && quiz.description.toLowerCase().includes(query)) ||
        (quiz.category && quiz.category.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(quiz => quiz.category === this.selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'questions':
          return b.questions.length - a.questions.length;
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

  selectQuiz(quiz: Quiz): void {
    this.selectedQuiz = quiz;
    this.quizSelected.emit(quiz);
  }

  startQuiz(quiz: Quiz, event: Event): void {
    event.stopPropagation();
    this.quizStarted.emit(quiz);
  }

  previewQuiz(quiz: Quiz, event: Event): void {
    event.stopPropagation();
    this.quizPreviewed.emit(quiz);
  }

  toggleFavorite(quiz: Quiz, event: Event): void {
    event.stopPropagation();
    const isFavorited = this.favorites.has(quiz.id || '');
    
    if (isFavorited) {
      this.favorites.delete(quiz.id || '');
    } else {
      this.favorites.add(quiz.id || '');
    }
    
    this.saveFavorites();
    this.quizFavorited.emit({ quiz, favorited: !isFavorited });
  }

  shareQuiz(quiz: Quiz, event: Event): void {
    event.stopPropagation();
    this.quizShared.emit(quiz);
  }

  isFavorite(quizId: string): boolean {
    return this.favorites.has(quizId);
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  trackByQuizId(index: number, quiz: Quiz): string {
    return quiz.id || index.toString();
  }

  formatTimeLimit(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private loadFavorites(): void {
    const saved = localStorage.getItem('quiz-favorites');
    if (saved) {
      this.favorites = new Set(JSON.parse(saved));
    }
  }

  private saveFavorites(): void {
    localStorage.setItem('quiz-favorites', JSON.stringify([...this.favorites]));
  }
}
