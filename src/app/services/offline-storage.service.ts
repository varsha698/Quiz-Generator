import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface OfflineQuizSubmission {
  id: string;
  quizId: string;
  answers: any[];
  score: number;
  timeSpent: number;
  timestamp: number;
  token: string;
  data: any;
}

export interface OfflineQuiz {
  id: string;
  name: string;
  title?: string;
  description: string;
  questions: any[];
  category: string;
  difficulty: string;
  timeLimit: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private dbName = 'QuizMasterOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  private offlineSubmissionsSubject = new BehaviorSubject<OfflineQuizSubmission[]>([]);
  private offlineQuizzesSubject = new BehaviorSubject<OfflineQuiz[]>([]);
  private isOfflineSubject = new BehaviorSubject<boolean>(!navigator.onLine);

  public offlineSubmissions$ = this.offlineSubmissionsSubject.asObservable();
  public offlineQuizzes$ = this.offlineQuizzesSubject.asObservable();
  public isOffline$ = this.isOfflineSubject.asObservable();

  constructor() {
    this.initializeDatabase();
    this.setupOnlineOfflineListeners();
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        this.loadOfflineData();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create submissions store
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { keyPath: 'id' });
          submissionsStore.createIndex('quizId', 'quizId', { unique: false });
          submissionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create quizzes store
        if (!db.objectStoreNames.contains('quizzes')) {
          const quizzesStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizzesStore.createIndex('category', 'category', { unique: false });
          quizzesStore.createIndex('difficulty', 'difficulty', { unique: false });
          quizzesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create user data store
        if (!db.objectStoreNames.contains('userData')) {
          const userDataStore = db.createObjectStore('userData', { keyPath: 'key' });
        }

        console.log('IndexedDB upgraded');
      };
    });
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOfflineSubject.next(false);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOfflineSubject.next(true);
    });
  }

  private async loadOfflineData(): Promise<void> {
    if (!this.db) return;

    try {
      // Load offline submissions
      const submissions = await this.getAllOfflineSubmissions();
      this.offlineSubmissionsSubject.next(submissions);

      // Load offline quizzes
      const quizzes = await this.getAllOfflineQuizzes();
      this.offlineQuizzesSubject.next(quizzes);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  // Quiz Submission Methods
  public async saveOfflineSubmission(submission: Omit<OfflineQuizSubmission, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const fullSubmission: OfflineQuizSubmission = {
      ...submission,
      id,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readwrite');
      const store = transaction.objectStore('submissions');
      const request = store.add(fullSubmission);

      request.onsuccess = () => {
        this.loadOfflineData();
        resolve(id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async getAllOfflineSubmissions(): Promise<OfflineQuizSubmission[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async removeOfflineSubmission(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readwrite');
      const store = transaction.objectStore('submissions');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.loadOfflineData();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Quiz Storage Methods
  public async saveOfflineQuiz(quiz: Omit<OfflineQuiz, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const fullQuiz: OfflineQuiz = {
      ...quiz,
      id,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readwrite');
      const store = transaction.objectStore('quizzes');
      const request = store.add(fullQuiz);

      request.onsuccess = () => {
        this.loadOfflineData();
        resolve(id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async getAllOfflineQuizzes(): Promise<OfflineQuiz[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readonly');
      const store = transaction.objectStore('quizzes');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async getOfflineQuiz(id: string): Promise<OfflineQuiz | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readonly');
      const store = transaction.objectStore('quizzes');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async removeOfflineQuiz(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readwrite');
      const store = transaction.objectStore('quizzes');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.loadOfflineData();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // User Data Methods
  public async saveUserData(key: string, data: any): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getUserData(key: string): Promise<any> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readonly');
      const store = transaction.objectStore('userData');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Sync Methods
  public async syncOfflineData(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Sync offline submissions
      await this.syncOfflineSubmissions();
      
      // Sync offline quizzes
      await this.syncOfflineQuizzes();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  private async syncOfflineSubmissions(): Promise<void> {
    const submissions = await this.getAllOfflineSubmissions();
    
    for (const submission of submissions) {
      try {
        // Try to submit to server
        const response = await fetch('/api/quiz-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${submission.token}`
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          // Remove from offline storage
          await this.removeOfflineSubmission(submission.id);
          console.log('Offline submission synced:', submission.id);
        }
      } catch (error) {
        console.error('Failed to sync submission:', submission.id, error);
      }
    }
  }

  private async syncOfflineQuizzes(): Promise<void> {
    const quizzes = await this.getAllOfflineQuizzes();
    
    for (const quiz of quizzes) {
      try {
        // Try to sync quiz to server
        const response = await fetch('/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(quiz)
        });

        if (response.ok) {
          // Remove from offline storage
          await this.removeOfflineQuiz(quiz.id);
          console.log('Offline quiz synced:', quiz.id);
        }
      } catch (error) {
        console.error('Failed to sync quiz:', quiz.id, error);
      }
    }
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public async clearAllData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions', 'quizzes', 'userData'], 'readwrite');
      
      const clearStore = (storeName: string) => {
        return new Promise<void>((resolveStore, rejectStore) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolveStore();
          request.onerror = () => rejectStore(request.error);
        });
      };

      Promise.all([
        clearStore('submissions'),
        clearStore('quizzes'),
        clearStore('userData')
      ]).then(() => {
        this.loadOfflineData();
        resolve();
      }).catch(reject);
    });
  }

  public async getStorageSize(): Promise<number> {
    if (!this.db) return 0;

    let totalSize = 0;
    const storeNames = ['submissions', 'quizzes', 'userData'];

    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      await new Promise<void>((resolve) => {
        request.onsuccess = () => {
          totalSize += request.result;
          resolve();
        };
      });
    }

    return totalSize;
  }

  public isOffline(): boolean {
    return this.isOfflineSubject.value;
  }
}
