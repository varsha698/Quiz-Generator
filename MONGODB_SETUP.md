# 🗄️ MongoDB Integration for QuizMaster

QuizMaster now supports persistent data storage using MongoDB! All quizzes are stored in a database instead of browser localStorage.

## 🚀 Quick Start

### Option 1: Local MongoDB
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# Start QuizMaster
./start-mongodb.sh
```

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizmaster
```

## 📁 Project Structure

```
QuizMaster/
├── backend/                 # Express.js + MongoDB API
│   ├── models/             # Mongoose schemas
│   │   └── Quiz.js         # Quiz data model
│   ├── routes/             # API endpoints
│   │   └── quizRoutes.js   # Quiz CRUD operations
│   ├── server.js           # Main server file
│   └── .env               # Environment variables
├── src/app/services/       # Angular services
│   └── quiz-api.service.ts # MongoDB API client
└── start-mongodb.sh        # Startup script
```

## 🔧 API Endpoints

### Quiz Management
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `GET /api/quizzes/search/:query` - Search quizzes

### AI Integration
- `POST /api/generate-quiz` - Generate quiz with Groq AI

### Health Check
- `GET /api/health` - Check API and MongoDB status

## 🎯 Features

### ✅ What's New
- **Persistent Storage**: All quizzes saved to MongoDB
- **Real-time Sync**: Changes reflect immediately across sessions
- **Quiz Management**: Create, read, update, delete quizzes
- **Search Functionality**: Find quizzes by name or description
- **Connection Status**: Visual indicator of MongoDB connection
- **Auto-save**: Quizzes automatically saved when generated
- **Quiz Metadata**: Names, dates, descriptions, and more

### 🔄 Data Flow
1. **Generate Quiz**: AI creates quiz → Auto-saved to MongoDB
2. **View Quizzes**: Load all quizzes from database
3. **Take Quiz**: Select and load specific quiz
4. **Manage Quizzes**: Update or delete as needed

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm start
```

### Frontend Development
```bash
npm install
npm start
```

### Database Schema
```javascript
{
  _id: ObjectId,
  name: String,           // Quiz name
  description: String,    // Quiz description
  questions: [            // Array of questions
    {
      question: String,   // Question text
      options: [String],  // Answer options
      correctAnswer: Number // Index of correct answer
    }
  ],
  createdAt: Date,       // Creation timestamp
  updatedAt: Date,       // Last update timestamp
  createdBy: String,     // Creator identifier
  isPublic: Boolean      // Visibility setting
}
```

## 🔍 Troubleshooting

### MongoDB Connection Issues
1. **Check MongoDB Status**: `brew services list | grep mongodb`
2. **Start MongoDB**: `brew services start mongodb-community`
3. **Check Port**: MongoDB runs on port 27017 by default
4. **Check Logs**: Look at backend console for connection errors

### API Connection Issues
1. **Check Backend**: Visit http://localhost:4000/api/health
2. **Check CORS**: Ensure backend allows frontend origin
3. **Check Environment**: Verify GROQ_API_KEY in backend/.env

### Common Errors
- **"MongoDB Disconnected"**: Start MongoDB service
- **"Failed to generate quiz"**: Check Groq API key
- **"Quiz not found"**: Refresh the quiz list

## 🌟 Benefits

### For Users
- **Data Persistence**: Quizzes never lost
- **Cross-Device Access**: Access quizzes from any device
- **Better Organization**: Search and filter quizzes
- **Reliability**: No browser storage limitations

### For Developers
- **Scalable Architecture**: Easy to add features
- **Data Integrity**: Structured data with validation
- **API-First Design**: Easy to build mobile apps
- **Cloud Ready**: Deploy to any cloud provider

## 🚀 Next Steps

1. **User Authentication**: Add user accounts and private quizzes
2. **Quiz Sharing**: Share quizzes with links
3. **Analytics**: Track quiz performance and usage
4. **Categories**: Organize quizzes by topic
5. **Import/Export**: Backup and restore quiz data

---

**Ready to use QuizMaster with MongoDB?** Run `./start-mongodb.sh` and start creating persistent quizzes! 🎉
