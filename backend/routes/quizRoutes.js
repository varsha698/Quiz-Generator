import express from 'express';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// GET /api/quizzes - Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublic: true })
      .sort({ createdAt: -1 });
    
    console.log('Retrieved quizzes:', JSON.stringify(quizzes, null, 2));
    res.json(quizzes);
  } catch (error) {
    console.error('Error retrieving quizzes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quizzes/:id - Get a specific quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quizzes - Create a new quiz
router.post('/', async (req, res) => {
  try {
    const { name, description, questions, createdBy, isPublic } = req.body;
    
    console.log('Creating quiz with data:', { name, description, questions, createdBy, isPublic });
    
    const quiz = new Quiz({
      name,
      description: description || '',
      questions,
      createdBy: createdBy || 'user',
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    console.log('Quiz object before save:', quiz);
    
    const savedQuiz = await quiz.save();
    console.log('Quiz saved successfully:', savedQuiz);
    
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/quizzes/:id - Update a quiz
router.put('/:id', async (req, res) => {
  try {
    const { name, description, questions, isPublic } = req.body;
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        questions,
        isPublic,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/quizzes/:id - Delete a quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quizzes/search/:query - Search quizzes by name or description
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const quizzes = await Quiz.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .sort({ createdAt: -1 })
    .select('name description questions.length createdAt');
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
