import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizApiService, QuizItem, Quiz } from '../../services/quiz-api.service';
import { QuizTimerService, TimerState } from '../../services/quiz-timer.service';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatRadioModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './take-quiz.component.html',
  styleUrl: './take-quiz.component.css'
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  loading = false;
  quizzes: QuizItem[] = [];
  answers: number[] = [];
  score: number | null = null;
  availableQuizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];
  selectedQuizKey: string = '';
  isConnected = false;
  
  // Search and filter properties
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedDifficulty: string = '';
  sortBy: string = 'newest';
  selectedTags: string[] = [];
  availableTags: string[] = [];
  
  // Timer properties
  timeLimit: number = 0; // in minutes
  selectedQuiz: Quiz | null = null;
  timeSpent: number = 0; // in seconds
  quizStartTime: number = 0;
  timerState: TimerState = {
    timeRemaining: 0,
    isRunning: false,
    isPaused: false,
    isExpired: false,
    totalTime: 0,
    elapsedTime: 0
  };

  constructor(
    private quizApiService: QuizApiService,
    private quizTimerService: QuizTimerService
  ) {
    this.checkConnection();
    this.loadAvailableQuizzes();
    this.subscribeToTimer();
  }

  ngOnInit(): void {
    // Component initialization
  }

  private subscribeToTimer(): void {
    this.quizTimerService.getTimerState().subscribe(state => {
      this.timerState = state;
      
      if (state.isExpired) {
        this.handleTimerExpired();
      }
    });
  }

  ngOnDestroy(): void {
    this.quizTimerService.stopTimer();
  }

  private handleTimerExpired(): void {
    console.log('Timer expired! Auto-submitting quiz...');
    this.submitQuiz();
  }

  submitQuiz(): void {
    if (!this.selectedQuiz) return;

    // Stop the timer
    this.quizTimerService.stopTimer();
    
    // Calculate time spent
    this.timeSpent = this.timerState.elapsedTime;
    
    // Calculate score
    let correctAnswers = 0;
    this.quizzes.forEach((question, index) => {
      if (this.answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    this.score = Math.round((correctAnswers / this.quizzes.length) * 100);
    
    // Create submission data
    const submission = {
      quizId: this.selectedQuiz._id!,
      answers: this.answers,
      score: this.score,
      timeSpent: this.timeSpent,
      submittedAt: new Date().toISOString()
    };
    
    // Submit to API
    this.quizApiService.submitQuiz(submission).subscribe({
      next: (response) => {
        console.log('Quiz submitted successfully:', response);
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
      }
    });
  }

  pauseTimer(): void {
    this.quizTimerService.pauseTimer();
  }

  resumeTimer(): void {
    this.quizTimerService.resumeTimer();
  }

  getFormattedTime(seconds: number): string {
    return this.quizTimerService.getFormattedTime(seconds);
  }

  getTimerProgress(): number {
    return this.quizTimerService.getProgressPercentage();
  }

  isTimeWarning(): boolean {
    return this.quizTimerService.getTimeWarning(60); // Warning when less than 1 minute
  }

  loadAvailableQuizzes() {
    this.loading = true;
    this.availableQuizzes = [];
    
    this.quizApiService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        console.log('All quizzes from API:', quizzes);
        // Filter out quizzes with empty questions array
        this.availableQuizzes = quizzes.filter(quiz => quiz.questions && quiz.questions.length > 0);
        console.log('Filtered quizzes:', this.availableQuizzes);
        
        // Extract available tags
        this.extractAvailableTags();
        
        // If no valid quizzes found, add default quiz
        if (this.availableQuizzes.length === 0) {
          this.availableQuizzes = [{
            _id: 'default',
            name: 'Sample Quiz',
            description: 'Default sample quiz',
            questions: this.getDefaultQuizzes(),
            category: 'General',
            difficulty: 'Medium',
            points: 10,
            tags: ['sample'],
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            isPublic: true
          }];
        }
        
        // Initialize filtered quizzes
        this.filteredQuizzes = [...this.availableQuizzes];
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        // Fallback to default quiz if API fails
        this.availableQuizzes = [{
          _id: 'default',
          name: 'Sample Quiz',
          description: 'Default sample quiz',
          questions: this.getDefaultQuizzes(),
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          isPublic: true
        }];
        this.loading = false;
      }
    });
  }

  selectQuiz(quizId: string) {
    console.log('Selecting quiz:', quizId);
    this.selectedQuizKey = quizId;
  }

  loadSelectedQuiz() {
    if (!this.selectedQuizKey) {
      console.log('No quiz selected');
      return;
    }
    
    console.log('Loading selected quiz:', this.selectedQuizKey);
    this.loading = true;
    setTimeout(() => {
      const selectedQuiz = this.availableQuizzes.find(q => q._id === this.selectedQuizKey);
      console.log('Selected quiz found:', selectedQuiz);
      if (selectedQuiz) {
        this.selectedQuiz = selectedQuiz;
        this.quizzes = selectedQuiz.questions;
        console.log('Loaded questions:', this.quizzes);
        this.answers = new Array(this.quizzes.length).fill(-1);
        this.score = null;
        
        // Set up timer if quiz has time limit
        this.timeLimit = selectedQuiz.timeLimit || 0;
        this.quizStartTime = Date.now();
        this.timeSpent = 0;
        
        if (this.timeLimit > 0) {
          const timeInSeconds = this.timeLimit * 60; // Convert minutes to seconds
          this.quizTimerService.startTimer(timeInSeconds);
          console.log(`Timer started: ${this.timeLimit} minutes (${timeInSeconds} seconds)`);
        } else {
          this.quizTimerService.stopTimer();
        }
      } else {
        console.error('Quiz not found with ID:', this.selectedQuizKey);
      }
      this.loading = false;
    }, 500);
  }

  checkConnection() {
    this.quizApiService.healthCheck().subscribe({
      next: (response) => {
        this.isConnected = response.mongodb === 'Connected';
      },
      error: (error) => {
        console.error('API connection error:', error);
        this.isConnected = false;
      }
    });
  }

  private getDefaultQuizzes(): QuizItem[] {
    return [
      {
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        correctAnswer: 2,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswer: 1,
      },
      {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
      }
    ];
  }

  submit() {
    this.quizTimerService.stopTimer();
    this.timeSpent = Math.floor((Date.now() - this.quizStartTime) / 1000);
    
    let correct = 0;
    this.quizzes.forEach((quiz, index) => {
      if (this.answers[index] === quiz.correctAnswer) {
        correct++;
      }
    });
    this.score = correct;
  }

  reset() {
    this.answers = new Array(this.quizzes.length).fill(-1);
    this.score = null;
  }

  getSelectedQuizName(): string {
    const selectedQuiz = this.availableQuizzes.find(q => q._id === this.selectedQuizKey);
    return selectedQuiz ? selectedQuiz.name : 'Unknown Quiz';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(97 + index);
  }

  // Timer methods


  getPerformanceFeedback(): string {
    if (!this.score || !this.quizzes.length) return '';
    
    const percentage = (this.score / this.quizzes.length) * 100;
    
    if (percentage >= 90) return '🎉 Outstanding! You\'re a quiz master!';
    if (percentage >= 80) return '🌟 Excellent work! You really know your stuff!';
    if (percentage >= 70) return '👍 Great job! You\'re doing well!';
    if (percentage >= 60) return '📚 Good effort! Keep studying!';
    return '💪 Keep practicing! You\'ll get there!';
  }

  goToQuizSelection(): void {
    this.quizzes = [];
    this.answers = [];
    this.score = null;
    this.selectedQuizKey = '';
    this.quizTimerService.stopTimer();
  }

  shareScore(): void {
    if (!this.score || !this.quizzes.length) return;
    
    const percentage = Math.round((this.score / this.quizzes.length) * 100);
    const quizName = this.selectedQuiz?.name || 'this quiz';
    const shareText = `I just scored ${this.score}/${this.quizzes.length} (${percentage}%) on "${quizName}"! Can you beat my score? 🧠✨`;
    
    if (navigator.share) {
      navigator.share({
        title: 'QuizMaster Score',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Score copied to clipboard!');
    }
  }

  // Search and filtering methods
  extractAvailableTags(): void {
    const allTags = new Set<string>();
    this.availableQuizzes.forEach(quiz => {
      if (quiz.tags) {
        quiz.tags.forEach(tag => allTags.add(tag));
      }
    });
    this.availableTags = Array.from(allTags).sort();
  }

  filterQuizzes(): void {
    let filtered = [...this.availableQuizzes];

    // Search by name or description
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.name.toLowerCase().includes(query) ||
        (quiz.description && quiz.description.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(quiz => quiz.category === this.selectedCategory);
    }

    // Filter by difficulty
    if (this.selectedDifficulty) {
      filtered = filtered.filter(quiz => quiz.difficulty === this.selectedDifficulty);
    }

    // Filter by tags
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(quiz => 
        quiz.tags && this.selectedTags.some(tag => quiz.tags!.includes(tag))
      );
    }

    // Sort quizzes
    filtered = this.sortQuizzes(filtered);

    this.filteredQuizzes = filtered;
  }

  sortQuizzes(quizzes: Quiz[]): Quiz[] {
    const sorted = [...quizzes];
    
    switch (this.sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'questions':
        return sorted.sort((a, b) => b.questions.length - a.questions.length);
      case 'points':
        return sorted.sort((a, b) => (b.points || 0) - (a.points || 0));
      default:
        return sorted;
    }
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.filterQuizzes();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDifficulty = '';
    this.selectedTags = [];
    this.sortBy = 'newest';
    this.filterQuizzes();
  }
}
