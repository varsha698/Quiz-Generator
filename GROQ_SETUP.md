# Groq API Setup for QuizMaster

This application uses the Groq API to generate AI-powered quiz questions. Follow these steps to set up your API key:

## 1. Get Your Free API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy your API key

## 2. Configure Your API Key

You have three options to set your API key:

### Option A: Environment File (Recommended for Development)
1. Open `src/environments/environment.groq.ts`
2. Replace the empty string with your API key:
   ```typescript
   apiKey: 'your-groq-api-key-here'
   ```

### Option B: Browser Prompt
1. Start the application with `npm start`
2. When you first try to generate a quiz, you'll be prompted to enter your API key
3. The key will be saved in your browser's localStorage

### Option C: Update Key in App
1. Go to the Quiz Generator page
2. Click "Add API Key" or "Update Key" button
3. Enter your API key when prompted

## 3. Features

- **AI-Powered Generation**: Creates relevant quiz questions based on your input text
- **Customizable**: Choose 2-5 questions per quiz
- **Fast & Efficient**: Uses Groq's Llama 3.1 8B model for quick responses
- **Smart Parsing**: Automatically formats questions with multiple choice options
- **Error Handling**: Provides helpful error messages if something goes wrong

## 4. Usage

1. Paste any text content (articles, notes, study material, etc.)
2. Select the number of questions you want (2-5)
3. Click "🤖 Generate Quiz with AI"
4. Wait for the AI to process your text and generate questions
5. Review the generated quiz and save it if desired
6. Take the quiz in the "Take Quiz" section

## 5. Troubleshooting

- **"API Key Required"**: Make sure you've set your API key using one of the methods above
- **"Failed to generate quiz"**: Check your internet connection and API key validity
- **"No response from Groq API"**: The API might be temporarily unavailable, try again

## 6. Cost

Groq offers generous free tier limits, so you can generate many quizzes without any cost. Check their [pricing page](https://console.groq.com/pricing) for current limits.

---

Enjoy creating AI-powered quizzes! 🎯
