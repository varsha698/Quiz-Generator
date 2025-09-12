import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isExpired: boolean;
  totalTime: number;
  elapsedTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizTimerService {
  private timerSubject = new BehaviorSubject<TimerState>({
    timeRemaining: 0,
    isRunning: false,
    isPaused: false,
    isExpired: false,
    totalTime: 0,
    elapsedTime: 0
  });

  private timerSubscription?: Subscription;
  private startTime = 0;
  private pausedTime = 0;

  constructor() {}

  getTimerState(): Observable<TimerState> {
    return this.timerSubject.asObservable();
  }

  startTimer(totalSeconds: number): void {
    if (totalSeconds <= 0) return;

    this.stopTimer();
    
    this.startTime = Date.now();
    this.pausedTime = 0;
    
    this.timerSubject.next({
      timeRemaining: totalSeconds,
      isRunning: true,
      isPaused: false,
      isExpired: false,
      totalTime: totalSeconds,
      elapsedTime: 0
    });

    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => this.timerSubject.value.isRunning && !this.timerSubject.value.isExpired)
    ).subscribe(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - this.startTime - this.pausedTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      if (remaining <= 0) {
        this.expireTimer();
      } else {
        this.timerSubject.next({
          ...this.timerSubject.value,
          timeRemaining: remaining,
          elapsedTime: elapsed
        });
      }
    });
  }

  pauseTimer(): void {
    if (!this.timerSubject.value.isRunning || this.timerSubject.value.isPaused) return;

    this.pausedTime += Date.now() - this.startTime;
    
    this.timerSubject.next({
      ...this.timerSubject.value,
      isRunning: false,
      isPaused: true
    });

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  resumeTimer(): void {
    if (!this.timerSubject.value.isPaused || this.timerSubject.value.isExpired) return;

    this.startTime = Date.now();
    
    this.timerSubject.next({
      ...this.timerSubject.value,
      isRunning: true,
      isPaused: false
    });

    const remaining = this.timerSubject.value.timeRemaining;
    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => this.timerSubject.value.isRunning && !this.timerSubject.value.isExpired)
    ).subscribe(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - this.startTime - this.pausedTime) / 1000);
      const newRemaining = Math.max(0, remaining - elapsed);
      
      if (newRemaining <= 0) {
        this.expireTimer();
      } else {
        this.timerSubject.next({
          ...this.timerSubject.value,
          timeRemaining: newRemaining,
          elapsedTime: this.timerSubject.value.totalTime - newRemaining
        });
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubject.next({
      timeRemaining: 0,
      isRunning: false,
      isPaused: false,
      isExpired: false,
      totalTime: 0,
      elapsedTime: 0
    });
  }

  private expireTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubject.next({
      ...this.timerSubject.value,
      timeRemaining: 0,
      isRunning: false,
      isPaused: false,
      isExpired: true,
      elapsedTime: this.timerSubject.value.totalTime
    });
  }

  getFormattedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  getProgressPercentage(): number {
    const state = this.timerSubject.value;
    if (state.totalTime === 0) return 0;
    return (state.elapsedTime / state.totalTime) * 100;
  }

  addTime(seconds: number): void {
    const currentState = this.timerSubject.value;
    if (!currentState.isRunning && !currentState.isPaused) return;

    const newRemaining = Math.max(0, currentState.timeRemaining + seconds);
    
    this.timerSubject.next({
      ...currentState,
      timeRemaining: newRemaining,
      totalTime: currentState.totalTime + seconds
    });
  }

  getTimeWarning(threshold: number = 60): boolean {
    return this.timerSubject.value.timeRemaining <= threshold && this.timerSubject.value.timeRemaining > 0;
  }
}
