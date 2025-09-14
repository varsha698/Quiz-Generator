// services/quizzes.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResult, Question, QuizInfo } from '../models/quizapi';

@Injectable({ providedIn: 'root' })
export class QuizzesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/quizzes`;

  // GET /api/quizzes?page=&pageSize=&search=&category=
  list(params?: {
    page?: number;
    pageSize?: number;
    search?: string | null;
    category?: string | null;
  }): Observable<PagedResult<QuizInfo>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category) httpParams = httpParams.set('category', params.category);

    return this.http
      .get<PagedResult<QuizInfo>>(this.base, { params: httpParams })
      .pipe(catchError(this.handle));
  }

  // GET /api/quizzes/{id}
  getById(id: string): Observable<QuizInfo> {
    return this.http.get<QuizInfo>(`${this.base}/${id}`).pipe(catchError(this.handle));
  }

  // POST /api/quizzes
  create(quiz: QuizInfo): Observable<QuizInfo> {
    return this.http.post<QuizInfo>(this.base, quiz).pipe(catchError(this.handle));
  }

  // PUT /api/quizzes/{id}
  update(id: string, quiz: QuizInfo): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, quiz).pipe(catchError(this.handle));
  }

  // DELETE /api/quizzes/{id}
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(this.handle));
  }

  // ---- Question subresources ----

  // POST /api/quizzes/{id}/questions
  addQuestion(quizId: string, question: Question): Observable<void> {
    return this.http
      .post<void>(`${this.base}/${quizId}/questions`, question)
      .pipe(catchError(this.handle));
  }

  // PUT /api/quizzes/{id}/questions/{questionId}
  updateQuestion(quizId: string, questionId: string, question: Question): Observable<void> {
    return this.http
      .put<void>(`${this.base}/${quizId}/questions/${questionId}`, question)
      .pipe(catchError(this.handle));
  }

  // DELETE /api/quizzes/{id}/questions/{questionId}
  removeQuestion(quizId: string, questionId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${quizId}/questions/${questionId}`)
      .pipe(catchError(this.handle));
  }

  private handle(err: any) {
    // Optionally map server errors into user-friendly messages
    return throwError(() => err);
  }
}
