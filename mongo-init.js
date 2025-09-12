// MongoDB initialization script
db = db.getSiblingDB('quizmaster');

// Create collections
db.createCollection('quizzes');
db.createCollection('quizattempts');
db.createCollection('users');

// Create indexes for better performance
db.quizzes.createIndex({ "createdBy": 1 });
db.quizzes.createIndex({ "category": 1 });
db.quizzes.createIndex({ "difficulty": 1 });
db.quizzes.createIndex({ "isPublic": 1 });
db.quizzes.createIndex({ "createdAt": -1 });

db.quizattempts.createIndex({ "userId": 1 });
db.quizattempts.createIndex({ "quizId": 1 });
db.quizattempts.createIndex({ "submittedAt": -1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

// Insert sample data
db.quizzes.insertOne({
  name: "Sample Quiz",
  description: "A sample quiz for testing",
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    }
  ],
  category: "General",
  difficulty: "Easy",
  timeLimit: 5,
  points: 10,
  createdBy: "system",
  isPublic: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");
