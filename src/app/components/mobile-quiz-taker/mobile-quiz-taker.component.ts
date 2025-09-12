import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizItem } from '../../services/quiz-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-quiz-taker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mobile-quiz-container" [class.landscape]="isLandscape">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="quiz-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              [style.width.%]="progressPercentage"
            ></div>
          </div>
          <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
        </div>
        
        <div class="quiz-timer" *ngIf="timeLimit > 0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span [class.warning]="timeRemaining < 30">{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>

      <!-- Question Card -->
      <div class="question-card" [class.answered]="selectedAnswer !== null">
        <div class="question-number">
          Question {{ currentQuestionIndex + 1 }}
        </div>
        
        <h2 class="question-text">{{ currentQuestion.question }}</h2>
        
        <!-- Options -->
        <div class="options-container">
          <button 
            *ngFor="let option of currentQuestion.options; let i = index"
            class="option-button"
            [class.selected]="selectedAnswer === i"
            [class.correct]="showResults && i === currentQuestion.correctAnswer"
            [class.incorrect]="showResults && selectedAnswer === i && i !== currentQuestion.correctAnswer"
            (click)="selectAnswer(i)"
            [disabled]="showResults"
          >
            <div class="option-content">
              <div class="option-letter">{{ getOptionLetter(i) }}</div>
              <div class="option-text">{{ option }}</div>
            </div>
            <div class="option-feedback" *ngIf="showResults">
              <svg *ngIf="i === currentQuestion.correctAnswer" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg *ngIf="selectedAnswer === i && i !== currentQuestion.correctAnswer" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="quiz-navigation">
        <button 
          class="nav-button prev" 
          (click)="previousQuestion()"
          [disabled]="currentQuestionIndex === 0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Previous
        </button>
        
        <button 
          class="nav-button next" 
          (click)="nextQuestion()"
          [disabled]="selectedAnswer === null && !showResults"
        >
          {{ isLastQuestion ? 'Finish' : 'Next' }}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Swipe Instructions -->
      <div class="swipe-instructions" *ngIf="!showResults && !isLandscape">
        <div class="swipe-hint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Swipe to navigate</span>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="showResults">
        <div class="results-header">
          <h3>Quiz Complete!</h3>
          <div class="score-display">
            <span class="score">{{ correctAnswers }}</span>
            <span class="score-separator">/</span>
            <span class="total">{{ totalQuestions }}</span>
          </div>
        </div>
        
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-value">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</span>
            <span class="stat-label">Accuracy</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatTime(totalTimeSpent) }}</span>
            <span class="stat-label">Time</span>
          </div>
        </div>
        
        <div class="results-actions">
          <button class="action-button primary" (click)="restartQuiz()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Retake Quiz
          </button>
          <button class="action-button secondary" (click)="finishQuiz()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C6.47715 21 2 16.9706 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 21 6.47715 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Finish
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-quiz-container {
      min-height: 100vh;
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
    }

    .mobile-quiz-container.landscape {
      padding: 0.5rem;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .quiz-progress {
      flex: 1;
      margin-right: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffd700, #ffed4e);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      color: #ccc;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .quiz-timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffd700;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .quiz-timer.warning {
      color: #ff6b35;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .question-card {
      flex: 1;
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .question-card.answered {
      border-color: #ffd700;
    }

    .question-card::before {
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

    .question-card.answered::before {
      opacity: 1;
    }

    .question-number {
      color: #ffd700;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .question-text {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.4;
      margin: 0 0 2rem 0;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .option-button {
      background: #333;
      border: 2px solid #555;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .option-button:hover:not(:disabled) {
      border-color: #ffd700;
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-2px);
    }

    .option-button.selected {
      border-color: #ffd700;
      background: rgba(255, 215, 0, 0.2);
    }

    .option-button.correct {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.2);
    }

    .option-button.incorrect {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.2);
    }

    .option-button:disabled {
      cursor: not-allowed;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .option-letter {
      width: 40px;
      height: 40px;
      background: #ffd700;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .option-text {
      color: #fff;
      font-size: 1.1rem;
      line-height: 1.4;
      flex: 1;
    }

    .option-feedback {
      position: absolute;
      top: 1rem;
      right: 1rem;
      color: #4CAF50;
    }

    .option-button.incorrect .option-feedback {
      color: #f44336;
    }

    .quiz-navigation {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nav-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffed4e, #ffd700);
      transform: translateY(-2px);
    }

    .nav-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .nav-button.prev {
      background: transparent;
      color: #ffd700;
      border: 2px solid #ffd700;
    }

    .nav-button.prev:hover:not(:disabled) {
      background: rgba(255, 215, 0, 0.1);
    }

    .swipe-instructions {
      text-align: center;
      margin-bottom: 2rem;
    }

    .swipe-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.9rem;
    }

    .results-summary {
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .results-header h3 {
      color: #ffd700;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }

    .score-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .score {
      font-size: 3rem;
      font-weight: 700;
      color: #4CAF50;
    }

    .score-separator {
      font-size: 2rem;
      color: #ccc;
    }

    .total {
      font-size: 2rem;
      color: #ccc;
    }

    .results-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #ccc;
      font-size: 0.9rem;
    }

    .results-actions {
      display: flex;
      gap: 1rem;
    }

    .action-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-button.primary {
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
    }

    .action-button.primary:hover {
      background: linear-gradient(135deg, #66BB6A, #4CAF50);
      transform: translateY(-2px);
    }

    .action-button.secondary {
      background: transparent;
      color: #ffd700;
      border: 2px solid #ffd700;
    }

    .action-button.secondary:hover {
      background: rgba(255, 215, 0, 0.1);
      transform: translateY(-2px);
    }

    /* Landscape Mode */
    @media (orientation: landscape) and (max-height: 600px) {
      .mobile-quiz-container {
        padding: 0.5rem;
      }

      .question-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
      }

      .question-text {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .options-container {
        gap: 0.75rem;
      }

      .option-button {
        padding: 1rem;
      }

      .quiz-navigation {
        margin-bottom: 1rem;
      }

      .swipe-instructions {
        display: none;
      }
    }

    /* Mobile Specific */
    @media (max-width: 480px) {
      .mobile-quiz-container {
        padding: 0.75rem;
      }

      .quiz-header {
        padding: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .question-card {
        padding: 1.5rem;
      }

      .question-text {
        font-size: 1.25rem;
      }

      .option-button {
        padding: 1.25rem;
      }

      .option-content {
        gap: 0.75rem;
      }

      .option-letter {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }

      .option-text {
        font-size: 1rem;
      }

      .nav-button {
        padding: 0.875rem 1.25rem;
        font-size: 0.9rem;
      }

      .results-stats {
        gap: 2rem;
      }

      .results-actions {
        flex-direction: column;
      }
    }

    /* Touch Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .option-button:hover {
        transform: none;
        border-color: #555;
        background: #333;
      }

      .option-button:active {
        transform: scale(0.98);
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
      }

      .nav-button:hover {
        transform: none;
      }

      .nav-button:active {
        transform: scale(0.98);
      }

      .action-button:hover {
        transform: none;
      }

      .action-button:active {
        transform: scale(0.98);
      }
    }
  `]
})
export class MobileQuizTakerComponent implements OnInit, OnDestroy {
  @Input() questions: QuizItem[] = [];
  @Input() timeLimit: number = 0;
  @Input() showResults: boolean = false;
  @Output() answerSelected = new EventEmitter<{ questionIndex: number; answer: number }>();
  @Output() quizCompleted = new EventEmitter<{ score: number; timeSpent: number; answers: number[] }>();
  @Output() quizRestarted = new EventEmitter<void>();

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  answers: number[] = [];
  timeRemaining = 0;
  totalTimeSpent = 0;
  startTime = 0;
  isLandscape = false;
  
  private timerSubscription?: Subscription;
  private resizeSubscription?: Subscription;

  ngOnInit(): void {
    this.initializeQuiz();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  get currentQuestion(): QuizItem {
    return this.questions[this.currentQuestionIndex];
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get progressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.totalQuestions - 1;
  }

  get correctAnswers(): number {
    return this.answers.filter((answer, index) => answer === this.questions[index].correctAnswer).length;
  }

  private initializeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.answers = new Array(this.questions.length).fill(-1);
    this.totalTimeSpent = 0;
    this.startTime = Date.now();
    
    if (this.timeLimit > 0) {
      this.timeRemaining = this.timeLimit;
      this.startTimer();
    }
  }

  private setupResizeListener(): void {
    this.checkOrientation();
    window.addEventListener('resize', () => this.checkOrientation());
  }

  private checkOrientation(): void {
    this.isLandscape = window.innerHeight < window.innerWidth && window.innerHeight < 600;
  }

  private startTimer(): void {
    const timer = setInterval(() => {
      this.timeRemaining--;
      this.totalTimeSpent = Math.floor((Date.now() - this.startTime) / 1000);
      
      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.finishQuiz();
      }
    }, 1000);
  }

  selectAnswer(answerIndex: number): void {
    if (this.showResults) return;
    
    this.selectedAnswer = answerIndex;
    this.answers[this.currentQuestionIndex] = answerIndex;
    this.answerSelected.emit({
      questionIndex: this.currentQuestionIndex,
      answer: answerIndex
    });
  }

  nextQuestion(): void {
    if (this.selectedAnswer === null && !this.showResults) return;
    
    if (this.isLastQuestion) {
      this.finishQuiz();
    } else {
      this.currentQuestionIndex++;
      this.selectedAnswer = this.answers[this.currentQuestionIndex] !== -1 ? this.answers[this.currentQuestionIndex] : null;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedAnswer = this.answers[this.currentQuestionIndex] !== -1 ? this.answers[this.currentQuestionIndex] : null;
    }
  }

  finishQuiz(): void {
    this.totalTimeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    this.quizCompleted.emit({
      score: this.correctAnswers,
      timeSpent: this.totalTimeSpent,
      answers: this.answers
    });
  }

  restartQuiz(): void {
    this.initializeQuiz();
    this.quizRestarted.emit();
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Touch gesture support
  onTouchStart(event: TouchEvent): void {
    // Implement swipe gestures for navigation
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous question
        this.previousQuestion();
      } else {
        // Swipe left - next question
        this.nextQuestion();
      }
    }
    
    this.touchStartX = null;
    this.touchStartY = null;
  }

  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
}
