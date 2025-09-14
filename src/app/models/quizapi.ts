// models/quiz.models.ts
export interface QuizInfo {
    id?: string;
    name: string;
    description?: string;
    questions: Question[];
    category?: string;
    tags?: string[];
    difficulty?: string;
    timeLimit?: number | null;
    points: number;
    stats?: Stats;
    createdBy?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    createdAt?: string; // ISO
    updatedAt?: string; // ISO
    version?: number;   // maps __v if you surface it
  }
  
  export interface Question {
    id?: string;
    questionText?: string; // if backend uses "QuestionText"
    question?: string;     // if backend uses "question" (from your JSON)
    options: string[];
    correctAnswer: number; // 0-based index
  }
  
  export interface Stats {
    totalAttempts: number;
    averageScore: number;
    totalTime: number;
    averageRating: number;
    ratings: number[];
  }
  
  export interface PagedResult<T> {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
  }
  