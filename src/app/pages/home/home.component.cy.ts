import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Welcome to the AI Quiz Generator</h1>
    <p>Use the menu to create or take quizzes.</p>
  `
})
export class HomeComponent {}
