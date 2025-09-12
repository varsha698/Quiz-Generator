import mongoose from 'mongoose';

const quizItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [quizItemSchema],
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Science', 'History', 'Math', 'Literature', 'Geography', 'Sports', 'Technology', 'Art', 'Music', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timeLimit: {
    type: Number, // in minutes
    default: null
  },
  points: {
    type: Number,
    default: 10
  },
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    ratings: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { strict: false });

// Update the updatedAt field before saving
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Quiz', quizSchema);
