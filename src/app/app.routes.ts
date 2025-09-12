import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizGeneratorComponent } from './pages/quiz-generator/quiz-generator.component';
import { TakeQuizComponent } from './pages/take-quiz/take-quiz.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quiz-generator', component: QuizGeneratorComponent },
  { path: 'take-quiz', component: TakeQuizComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
