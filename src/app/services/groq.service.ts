import { Injectable } from '@angular/core';
import Groq from 'groq-sdk';
import { environment } from '../../environments/environment.groq';

export interface QuizItem {
  question: string;
  options: string[];
  answer: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroqService {
  private groq: Groq;

  constructor() {
    // Initialize Groq with API key from environment or localStorage
    const apiKey = this.getApiKey();
    this.groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for browser usage
    });
  }

  private getApiKey(): string {
    // First try environment configuration
    let apiKey = environment.groq.apiKey;
    
    // If not found in environment, try localStorage
    if (!apiKey) {
      apiKey = localStorage.getItem('groq_api_key');
    }
    
    // If still not found, use the hardcoded key (for demo purposes)
    if (!apiKey) {
      apiKey = 'your_api_key_here';
    }
    
    return apiKey;
  }

  async generateQuiz(text: string, numQuestions: number = 3): Promise<QuizItem[]> {
    try {
      const prompt = this.createQuizPrompt(text, numQuestions);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Create engaging multiple choice questions based on the provided text. Always return valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: environment.groq.model,
        temperature: environment.groq.temperature,
        max_tokens: environment.groq.maxTokens
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq API');
      }

      return this.parseQuizResponse(response);
    } catch (error) {
      console.error('Error generating quiz with Groq:', error);
      throw new Error('Failed to generate quiz. Please check your API key and try again.');
    }
  }

  private createQuizPrompt(text: string, numQuestions: number): string {
    return `
Create ${numQuestions} multiple choice quiz questions based on the following text. Each question should have 4 options (a, b, c, d) with exactly one correct answer.

Text: "${text}"

Return the response in this exact JSON format:
[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }
]

Rules:
- Make questions challenging but fair
- Ensure only one correct answer per question
- Use clear, concise language
- Base questions directly on the provided text
- The "answer" field should be the index (0-3) of the correct option
- Return only valid JSON, no additional text
`;
  }

  private parseQuizResponse(response: string): QuizItem[] {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const quizData = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!Array.isArray(quizData)) {
        throw new Error('Response is not an array');
      }

      return quizData.map((item, index) => {
        if (!item.question || !item.options || typeof item.answer !== 'number') {
          throw new Error(`Invalid question structure at index ${index}`);
        }
        
        if (!Array.isArray(item.options) || item.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        
        if (item.answer < 0 || item.answer > 3) {
          throw new Error(`Question ${index + 1} answer must be between 0 and 3`);
        }

        return {
          question: item.question.trim(),
          options: item.options.map((opt: string) => opt.trim()),
          answer: item.answer
        };
      });
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      throw new Error('Failed to parse quiz response. Please try again.');
    }
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem('groq_api_key', apiKey);
    // Reinitialize Groq with new API key
    this.groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  hasApiKey(): boolean {
    return !!localStorage.getItem('groq_api_key');
  }
}
