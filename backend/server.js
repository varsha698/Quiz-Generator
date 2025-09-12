import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import 'dotenv/config';
import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Groq API integration for quiz generation
app.post('/api/generate-quiz', async (req, res) => {
  const { text, numQuestions = 3 } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for quiz generation' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: `You are a quiz generator. Generate exactly ${numQuestions} multiple choice questions from the given text. Return ONLY a JSON array with this exact format:
            [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0
              }
            ]
            The correctAnswer should be the index (0, 1, 2, or 3) of the correct option.`
          },
          { 
            role: "user", 
            content: `Generate ${numQuestions} multiple choice questions from this text:\n\n${text}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const quizContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let quizData;
    try {
      // Extract JSON array from the response (remove any text before/after)
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire content
        quizData = JSON.parse(quizContent);
      }
    } catch (parseError) {
      console.error('Failed to parse quiz response:', quizContent);
      throw new Error('Failed to parse quiz response from AI');
    }

    res.json({
      success: true,
      quiz: quizData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate quiz. Please try again.' 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'QuizMaster API Server',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      quizzes: '/api/quizzes',
      generateQuiz: '/api/generate-quiz'
    },
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
});
